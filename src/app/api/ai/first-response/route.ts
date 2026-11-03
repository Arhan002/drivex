
import { NextResponse } from "next/server";
import { gemini } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }

  return undefined;
}

type CustomerData = {
  name: string;
  model: string | null;
  fuel: string | null;
  transmission: string | null;
  budget: string | null;
  purchaseTimeline: string | null;
  leadStatus: string;
};

function generateFallbackDraft(customer: CustomerData) {
  const details = [
    customer.model ? `your interest in ${customer.model}` : null,
    customer.fuel ? `${customer.fuel} fuel preference` : null,
    customer.transmission
      ? `${customer.transmission} transmission preference`
      : null,
    customer.budget ? `your budget of ${customer.budget}` : null,
    customer.purchaseTimeline
      ? `your purchase timeline of ${customer.purchaseTimeline}`
      : null,
  ].filter(Boolean);

  const personalisedDetails =
    details.length > 0
      ? `We understand ${details.join(", ")}.`
      : "We would love to understand your vehicle preferences and requirements.";

  const draft = `Hi ${customer.name},

Thank you for contacting DriveX Dealership!

${personalisedDetails}

Our team would be happy to assist you with your requirements and discuss suitable options. We can also help arrange a test-drive appointment at your convenience.

Please let us know a suitable time to connect.

Regards,
DriveX Dealership, Lucknow`;

  return draft;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to continue." },
        { status: 401 }
      );
    }

    // 2. Verify staff role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["consultant", "admin"].includes(profile.role)) {
      return NextResponse.json(
        { error: "You are not authorized to use this feature." },
        { status: 403 }
      );
    }

    // 3. Validate request
    let body: { leadId?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const leadId = body?.leadId;

    if (
      typeof leadId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        leadId
      )
    ) {
      return NextResponse.json(
        { error: "A valid lead ID is required." },
        { status: 400 }
      );
    }

    // 4. Fetch lead using existing RLS permissions
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select(`
        id,
        buyer_name,
        status,
        interested_model_id,
        fuel_preference,
        transmission_preference,
        budget,
        purchase_timeline
      `)
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: "Lead not found or access denied." },
        { status: 404 }
      );
    }

    // 5. Fetch car model
    let modelName: string | null = null;

    if (lead.interested_model_id) {
      const { data: model } = await supabase
        .from("car_models")
        .select("name")
        .eq("id", lead.interested_model_id)
        .maybeSingle();

      modelName = model?.name ?? null;
    }

    // 6. Prepare customer information
    const customerData: CustomerData = {
      name: lead.buyer_name,
      model: modelName,
      fuel: lead.fuel_preference,
      transmission: lead.transmission_preference,
      budget: lead.budget,
      purchaseTimeline: lead.purchase_timeline,
      leadStatus: lead.status,
    };

    // 7. Fallback response
    const fallback = (reason: string) =>
      NextResponse.json({
        success: true,
        source: "fallback",
        notice: reason,
        draft: generateFallbackDraft(customerData),
      });

    // 8. Build Gemini prompt
    const prompt = `
You are a professional customer communication assistant for DriveX,
an authorised car dealership in Lucknow.

Write a personalised first-response WhatsApp message for this customer.

Customer information:
${JSON.stringify(customerData)}

Requirements:
1. Address the customer by their supplied name.
2. Thank them for their enquiry.
3. Naturally mention their recorded vehicle preferences.
4. Use a friendly, professional and helpful tone.
5. Keep the message concise and suitable for WhatsApp.
6. Ask the customer for a convenient time to connect.
7. Never invent prices, discounts, stock availability or offers.
8. Never invent missing customer information.
9. Do not claim that a booking or test drive has already been confirmed.
10. Return only the message text, without Markdown or explanations.
`;

    // 9. Generate draft using Gemini
    let response;

    try {
      response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.4,
          maxOutputTokens: 1024,
          httpOptions: {
            timeout: 30000,
            retryOptions: {
              attempts: 1,
            },
          },
        },
      });
    } catch (error) {
      console.error("First-response Gemini error:", error);

      const status = getErrorStatus(error);

      if (status === 503) {
        return fallback("Gemini is busy. A template-based draft is shown instead.");
      }

      if (status === 504 || status === 408) {
        return fallback("Gemini took too long to respond. A template-based draft is shown instead.");
      }

      if (status === 429) {
        return fallback("Gemini usage limit reached. A template-based draft is shown instead.");
      }

      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "TimeoutError")
      ) {
        return fallback("Gemini request timed out. A template-based draft is shown instead.");
      }

      return fallback("Gemini is unavailable. A template-based draft is shown instead.");
    }

    // 10. Validate generated message
    const draft = response.text?.trim();

    if (!draft || draft.length > 3000) {
      return fallback("Gemini returned an invalid draft. A template-based draft is shown instead.");
    }

    // 11. Return AI-generated draft
    return NextResponse.json({
      success: true,
      source: "gemini",
      draft,
    });
  } catch (error) {
    console.error("First-response route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to generate the response draft. Please try again.",
      },
      { status: 500 }
    );
  }
}

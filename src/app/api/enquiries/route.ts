
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      buyerName,
      email,
      phone,
      showroomId,
      modelId,
      source,
      consentGiven,
      fuelPreference,
      transmissionPreference,
      budget,
      purchaseTimeline,
    } = body;

    if (
      !buyerName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !showroomId ||
      !source ||
      consentGiven !== true
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields and provide consent." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    if (!["new_car", "used_car"].includes(source)) {
      return NextResponse.json(
        { error: "Invalid enquiry source." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check whether a session exists.
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError.message);

      return NextResponse.json(
        { error: "Unable to verify your session. Please try again." },
        { status: 401 }
      );
    }

    let user = null;

    // Only verify the user when a session exists.
    if (session) {
      const {
        data: { user: authenticatedUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authenticatedUser) {
        console.error("Authentication error:", authError?.message);

        return NextResponse.json(
          { error: "Your session is invalid or expired. Please sign in again." },
          { status: 401 }
        );
      }

      user = authenticatedUser;
    }

    const rpcParams = {
      p_buyer_name: buyerName.trim(),
      p_email: email.trim().toLowerCase(),
      p_phone: phone.trim(),
      p_showroom_id: showroomId,
      p_model_id: modelId || null,
      p_source: source,
      p_consent_given: consentGiven,
      p_fuel_preference: fuelPreference || null,
      p_transmission_preference: transmissionPreference || null,
      p_budget: budget || null,
      p_purchase_timeline: purchaseTimeline || null,
    };

    let data;
    let error;

    if (user) {
      // Authenticated users must have a Buyer profile.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (
        profileError ||
        profile?.role?.trim().toLowerCase() !== "buyer"
      ) {
        return NextResponse.json(
          { error: "Only Buyer accounts can submit enquiries here." },
          { status: 403 }
        );
      }

      const result = await supabase.rpc(
        "create_buyer_enquiry",
        rpcParams
      );

      data = result.data;
      error = result.error;
    } else {
      // Guest submission: no authenticated session.
      const result = await supabase.rpc(
        "create_guest_enquiry",
        rpcParams
      );

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Enquiry creation error:", error.message);

      return NextResponse.json(
        { error: error.message || "Unable to submit your enquiry." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Your enquiry was submitted successfully!",
        enquiry: data?.[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enquiry API error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

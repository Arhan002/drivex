
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
      selectedModelId,
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

    const { data, error } = await supabase.rpc(
  "create_guest_enquiry",
  {
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
  }
);

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


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
      demoVehicleId,
      scheduledAt,
      consentGiven,
    } = body;

    if (
      !buyerName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !showroomId ||
      !demoVehicleId ||
      !scheduledAt ||
      consentGiven !== true
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields and provide consent." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Identify whether this is an authenticated request.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: "Unable to verify your session. Please sign in again." },
        { status: 401 }
      );
    }

    const rpcParams = {
      p_buyer_name: buyerName.trim(),
      p_email: email.trim().toLowerCase(),
      p_phone: phone.trim(),
      p_showroom_id: showroomId,
      p_demo_vehicle_id: demoVehicleId,
      p_scheduled_at: scheduledAt,
      p_consent_given: consentGiven,
    };

    let data;
    let error;

    if (user) {
      // Only Buyer accounts can use the authenticated booking flow.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || profile?.role?.trim().toLowerCase() !== "buyer") {
        return NextResponse.json(
          { error: "Only Buyer accounts can book test drives here." },
          { status: 403 }
        );
      }

      const result = await supabase.rpc(
        "create_buyer_test_drive_booking",
        rpcParams
      );

      data = result.data;
      error = result.error;
    } else {
      // Preserve the existing guest booking flow.
      const result = await supabase.rpc(
        "create_guest_test_drive_booking",
        rpcParams
      );

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Test drive booking error:", error.message);

      return NextResponse.json(
        { error: error.message || "Unable to book your test drive." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Test drive booked successfully!",
        booking: data?.[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking API error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

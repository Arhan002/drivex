
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
      !buyerName ||
      !email ||
      !phone ||
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

    const { data, error } = await supabase.rpc(
      "create_guest_test_drive_booking",
      {
        p_buyer_name: buyerName,
        p_email: email,
        p_phone: phone,
        p_showroom_id: showroomId,
        p_demo_vehicle_id: demoVehicleId,
        p_scheduled_at: scheduledAt,
        p_consent_given: consentGiven,
      }
    );

    if (error) {
      console.error("Booking error:", error.message);

      return NextResponse.json(
        { error: error.message },
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
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

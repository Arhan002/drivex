
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

    const parsedDate = new Date(scheduledAt);

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Please select a valid booking date and time." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check whether an authenticated session exists.
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

    // Verify the user only when a session exists.
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
      p_demo_vehicle_id: demoVehicleId,
      p_scheduled_at: parsedDate.toISOString(),
      p_consent_given: consentGiven,
    };

    let data;
    let error;

    if (user) {
      // Only Buyer accounts can use authenticated booking.
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
      // Guests use the guest booking RPC.
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

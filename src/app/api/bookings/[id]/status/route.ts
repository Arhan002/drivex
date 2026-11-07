
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTestDriveConfirmedEmail } from "@/lib/emails/test-drive";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const { status } = await request.json();

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid booking status." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to update this booking." },
        { status: 401 }
      );
    }

    // Verify staff role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role?.trim().toLowerCase();

    if (
      profileError ||
      !["admin", "consultant"].includes(role ?? "")
    ) {
      return NextResponse.json(
        { error: "You are not authorized to update bookings." },
        { status: 403 }
      );
    }

    // Fetch existing booking details
    const { data: booking, error: bookingError } = await supabase
      .from("test_drive_bookings")
      .select(
        "id, status, scheduled_at, lead_id, showroom_id, demo_vehicle_id"
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found or unavailable." },
        { status: 404 }
      );
    }

    // Update booking status through the existing RPC
    const { error: updateError } = await supabase.rpc(
      "update_test_drive_booking_status",
      {
        p_booking_id: bookingId,
        p_status: status,
      }
    );

    if (updateError) {
      console.error("Booking status update error:", updateError);

      return NextResponse.json(
        {
          error:
            updateError.message || "Unable to update booking.",
        },
        { status: 400 }
      );
    }

    // Send confirmation email only when status changes to confirmed
    if (status === "confirmed" && booking.status !== "confirmed") {
      try {
        const { data: lead } = await supabase
          .from("leads")
          .select("buyer_name, email")
          .eq("id", booking.lead_id)
          .maybeSingle();

        const { data: showroom } = await supabase
          .from("showrooms")
          .select("name")
          .eq("id", booking.showroom_id)
          .maybeSingle();

        const { data: demoVehicle } = await supabase
          .from("demo_vehicles")
          .select("variant_id")
          .eq("id", booking.demo_vehicle_id)
          .maybeSingle();

        let vehicleName = "Your selected vehicle";

        if (demoVehicle?.variant_id) {
          const { data: variant } = await supabase
            .from("car_variants")
            .select("variant_name, model_id")
            .eq("id", demoVehicle.variant_id)
            .maybeSingle();

          if (variant) {
            let modelName = "";

            if (variant.model_id) {
              const { data: model } = await supabase
                .from("car_models")
                .select("name")
                .eq("id", variant.model_id)
                .maybeSingle();

              modelName = model?.name ?? "";
            }

            vehicleName = [modelName, variant.variant_name]
              .filter(Boolean)
              .join(" ");
          }
        }

        if (lead?.email) {
          await sendTestDriveConfirmedEmail({
            buyerName: lead.buyer_name ?? "Customer",
            email: lead.email,
            vehicleName,
            showroomName: showroom?.name ?? "Selected showroom",
            scheduledAt: booking.scheduled_at,
            bookingId: booking.id,
          });

          console.log(
            "Test-drive confirmation email accepted by Gmail SMTP."
          );
        } else {
          console.error(
            "Confirmation email skipped: customer email not found."
          );
        }
      } catch (emailError) {
        // Email failure must never undo a successful booking update.
        console.error(
          "Booking updated, but confirmation email failed:",
          emailError
        );
      }
    }

    return NextResponse.json({
      message: "Booking status updated successfully!",
    });
  } catch (error) {
    console.error("Booking status API error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

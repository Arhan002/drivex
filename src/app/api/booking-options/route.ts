
import { NextResponse, connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET() {
  await connection();

  try {
    const supabase = await createClient();

    const { data: showrooms, error: showroomError } = await supabase
      .from("showrooms")
      .select("id, name, city, address")
      .eq("is_active", true);

    if (showroomError) throw showroomError;

    const { data: vehicles, error: vehicleError } = await supabase
      .from("demo_vehicles")
      .select(`
        id,
        showroom_id,
        variant_id,
        car_variants (
          variant_name,
          car_models (
            name
          )
        )
      `)
      .eq("is_available", true);

    if (vehicleError) throw vehicleError;

    return NextResponse.json({
      showrooms: showrooms ?? [],
      vehicles: vehicles ?? [],
    });
  } catch (error) {
    console.error("Booking options error:", error);

    return NextResponse.json(
      { error: "Unable to load booking options." },
      { status: 500 }
    );
  }
}

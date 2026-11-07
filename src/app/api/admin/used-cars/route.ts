
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized. Please log in.", status: 401 };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    return { error: "Admin privileges required.", status: 403 };
  }

  return { error: null, status: 200 };
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateVehicle(body: Record<string, unknown>) {
  const stockId = cleanText(body.stock_id);
  const modelName = cleanText(body.model_name);
  const variantName = cleanText(body.variant_name);
  const fuelType = cleanText(body.fuel_type);
  const year = Number(body.manufacturing_year);
  const kilometres = Number(body.kilometres_driven);
  const owners = Number(body.number_of_owners);
  const price = Number(body.selling_price);
  const status = cleanText(body.status) || "available";

  if (
    !stockId ||
    !modelName ||
    !variantName ||
    !fuelType ||
    body.manufacturing_year === "" ||
    body.kilometres_driven === "" ||
    body.number_of_owners === "" ||
    body.selling_price === ""
  ) {
    return { error: "Please complete all required vehicle details." };
  }

  if (
    !Number.isInteger(year) ||
    year < 1900 ||
    year > new Date().getFullYear() + 1
  ) {
    return { error: "Enter a valid manufacturing year." };
  }

  if (!Number.isInteger(kilometres) || kilometres < 0) {
    return { error: "Kilometres must be a non-negative whole number." };
  }

  if (!Number.isInteger(owners) || owners < 1 || owners > 10) {
    return { error: "Enter a valid owner count." };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Selling price must be greater than zero." };
  }

  if (!["available", "reserved", "sold", "booked"].includes(status)) {
    return { error: "Invalid vehicle status." };
  }

  const imageUrl = cleanText(body.image_url);

  if (imageUrl) {
    try {
      const url = new URL(imageUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        return { error: "Image URL must use HTTP or HTTPS." };
      }
    } catch {
      return { error: "Enter a valid image URL." };
    }
  }

  return {
    values: {
      stock_id: stockId,
      model_name: modelName,
      variant_name: variantName,
      fuel_type: fuelType,
      manufacturing_year: year,
      kilometres_driven: kilometres,
      number_of_owners: owners,
      registration_masked: cleanText(body.registration_masked) || null,
      selling_price: price,
      inspection_report: cleanText(body.inspection_report) || null,
      image_url: imageUrl || null,
      status,
    },
  };
}

// CREATE USED CAR
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();

    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const validation = validateVehicle(body);

    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("used_cars")
      .insert(validation.values!)
      .select()
      .single();

    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "This stock ID already exists." },
        { status: 409 }
      );
    }

    if (error) throw error;

    return NextResponse.json(
      { success: true, vehicle: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Used car creation error:", error);

    return NextResponse.json(
      { error: "Unable to add used car. Please try again." },
      { status: 500 }
    );
  }
}

// UPDATE USED CAR
export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdmin();

    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const id = cleanText(body.id);

    if (!id) {
      return NextResponse.json(
        { error: "Vehicle ID is required." },
        { status: 400 }
      );
    }

    const validation = validateVehicle(body);

    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("used_cars")
      .update(validation.values!)
      .eq("id", id)
      .select()
      .single();

    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "This stock ID already exists." },
        { status: 409 }
      );
    }

    if (error) throw error;

    return NextResponse.json({ success: true, vehicle: data });
  } catch (error) {
    console.error("Used car update error:", error);

    return NextResponse.json(
      { error: "Unable to update used car. Please try again." },
      { status: 500 }
    );
  }
}

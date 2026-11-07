
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

function validatePrice(body: Record<string, unknown>) {
  const variantId = cleanText(body.variant_id);
  const city = cleanText(body.city);
  const validUntil = cleanText(body.valid_until);

  const fields = [
    body.ex_showroom_price,
    body.road_tax,
    body.insurance,
    body.accessories,
  ];

  if (!variantId || !city || !validUntil || fields.some(
    (value) => value === "" || value === null || value === undefined
  )) {
    return { error: "Please complete all required pricing fields." };
  }

  const amounts = fields.map(Number);

  if (
    amounts.some(
      (amount) => !Number.isFinite(amount) || amount < 0
    ) ||
    amounts[0] <= 0
  ) {
    return {
      error: "Ex-showroom price must be positive. Other price components cannot be negative.",
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) {
    return { error: "Please provide a valid price expiry date." };
  }

  const parsedDate = new Date(`${validUntil}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== validUntil
  ) {
    return { error: "Please provide a valid calendar date." };
  }

  if (validUntil < new Date().toISOString().slice(0, 10)) {
    return { error: "Price validity date cannot be in the past." };
  }

  return {
    values: {
      variant_id: variantId,
      city,
      ex_showroom_price: amounts[0],
      road_tax: amounts[1],
      insurance: amounts[2],
      accessories: amounts[3],
      valid_until: validUntil,
      updated_at: new Date().toISOString(),
    },
  };
}

// CREATE CITY-WISE PRICE
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
    const validation = validatePrice(body);

    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Verify that the selected variant exists.
    const { data: variant, error: variantError } = await admin
      .from("car_variants")
      .select("id")
      .eq("id", validation.values!.variant_id)
      .maybeSingle();

    if (variantError || !variant) {
      return NextResponse.json(
        { error: "Selected car variant was not found." },
        { status: 400 }
      );
    }

    // Prevent duplicate pricing for the same variant and city.
    const { data: existing, error: existingError } = await admin
      .from("car_prices")
      .select("id")
      .eq("variant_id", validation.values!.variant_id)
      .ilike("city", validation.values!.city)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Pricing already exists for this variant and city. Edit the existing record instead.",
        },
        { status: 409 }
      );
    }

    const { data, error } = await admin
      .from("car_prices")
      .insert(validation.values!)
      .select()
      .single();

    if (error) throw error;

    const onRoadPrice =
      Number(data.ex_showroom_price) +
      Number(data.road_tax) +
      Number(data.insurance) +
      Number(data.accessories);

    return NextResponse.json(
      {
        success: true,
        price: data,
        on_road_price: onRoadPrice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Price creation error:", error);

    return NextResponse.json(
      { error: "Unable to save pricing. Please try again." },
      { status: 500 }
    );
  }
}

// UPDATE EXISTING CITY-WISE PRICE
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
        { error: "Price record ID is required." },
        { status: 400 }
      );
    }

    const validation = validatePrice(body);

    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Prevent another record for the same variant and city.
    const { data: duplicate, error: duplicateError } = await admin
      .from("car_prices")
      .select("id")
      .eq("variant_id", validation.values!.variant_id)
      .ilike("city", validation.values!.city)
      .neq("id", id)
      .maybeSingle();

    if (duplicateError) throw duplicateError;

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "Another pricing record already exists for this variant and city.",
        },
        { status: 409 }
      );
    }

    const { data, error } = await admin
      .from("car_prices")
      .update(validation.values!)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Pricing record not found." },
        { status: 404 }
      );
    }

    const onRoadPrice =
      Number(data.ex_showroom_price) +
      Number(data.road_tax) +
      Number(data.insurance) +
      Number(data.accessories);

    return NextResponse.json({
      success: true,
      price: data,
      on_road_price: onRoadPrice,
    });
  } catch (error) {
    console.error("Price update error:", error);

    return NextResponse.json(
      { error: "Unable to update pricing. Please try again." },
      { status: 500 }
    );
  }
}

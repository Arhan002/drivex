
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
    return {
      error: "Admin privileges required.",
      status: 403,
    };
  }

  return { error: null, status: 200 };
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validSpecifications(value: unknown) {
  return (
    value === undefined ||
    (typeof value === "object" &&
      value !== null &&
      !Array.isArray(value))
  );
}

// CREATE MODEL OR VARIANT
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
    const admin = createAdminClient();

    if (body.action === "create_model") {
      const name = text(body.name);
      const description = text(body.description);
      const bodyType = text(body.body_type);
      const imageUrl = text(body.image_url);

      if (!name) {
        return NextResponse.json(
          { error: "Car model name is required." },
          { status: 400 }
        );
      }

      const { data, error } = await admin
        .from("car_models")
        .insert({
          name,
          description: description || null,
          body_type: bodyType || null,
          image_url: imageUrl || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json(
        { success: true, model: data },
        { status: 201 }
      );
    }

    if (body.action === "create_variant") {
      const modelId = text(body.model_id);
      const variantName = text(body.variant_name);
      const fuelType = text(body.fuel_type);
      const transmission = text(body.transmission);

      if (!modelId || !variantName || !fuelType || !transmission) {
        return NextResponse.json(
          { error: "Model, variant, fuel and transmission are required." },
          { status: 400 }
        );
      }

      if (!validSpecifications(body.specifications)) {
        return NextResponse.json(
          { error: "Specifications must be a valid object." },
          { status: 400 }
        );
      }

      const engineCc =
        body.engine_cc === "" || body.engine_cc == null
          ? null
          : Number(body.engine_cc);

      if (
        engineCc !== null &&
        (!Number.isInteger(engineCc) || engineCc <= 0)
      ) {
        return NextResponse.json(
          { error: "Engine capacity must be a positive number." },
          { status: 400 }
        );
      }

      const { data, error } = await admin
        .from("car_variants")
        .insert({
          model_id: modelId,
          variant_name: variantName,
          fuel_type: fuelType,
          transmission,
          engine_cc: engineCc,
          mileage: text(body.mileage) || null,
          specifications: body.specifications ?? {},
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json(
        { success: true, variant: data },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Invalid action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Inventory creation error:", error);

    return NextResponse.json(
      { error: "Unable to save inventory. Please check your details." },
      { status: 500 }
    );
  }
}

// UPDATE MODEL, MODEL STATUS OR VARIANT
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
    const admin = createAdminClient();
    const id = text(body.id);

    if (!id) {
      return NextResponse.json(
        { error: "Record ID is required." },
        { status: 400 }
      );
    }

    if (body.action === "update_model") {
      const name = text(body.name);

      if (!name) {
        return NextResponse.json(
          { error: "Model name is required." },
          { status: 400 }
        );
      }

      const { data, error } = await admin
        .from("car_models")
        .update({
          name,
          description: text(body.description) || null,
          body_type: text(body.body_type) || null,
          image_url: text(body.image_url) || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, model: data });
    }

    if (body.action === "toggle_model") {
      if (typeof body.is_active !== "boolean") {
        return NextResponse.json(
          { error: "A valid model status is required." },
          { status: 400 }
        );
      }

      const { data, error } = await admin
        .from("car_models")
        .update({ is_active: body.is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, model: data });
    }

    if (body.action === "update_variant") {
      const variantName = text(body.variant_name);
      const fuelType = text(body.fuel_type);
      const transmission = text(body.transmission);

      if (!variantName || !fuelType || !transmission) {
        return NextResponse.json(
          { error: "Variant, fuel and transmission are required." },
          { status: 400 }
        );
      }

      if (!validSpecifications(body.specifications)) {
        return NextResponse.json(
          { error: "Specifications must be a valid object." },
          { status: 400 }
        );
      }

      const engineCc =
        body.engine_cc === "" || body.engine_cc == null
          ? null
          : Number(body.engine_cc);

      if (
        engineCc !== null &&
        (!Number.isInteger(engineCc) || engineCc <= 0)
      ) {
        return NextResponse.json(
          { error: "Engine capacity must be a positive number." },
          { status: 400 }
        );
      }

      const { data, error } = await admin
        .from("car_variants")
        .update({
          variant_name: variantName,
          fuel_type: fuelType,
          transmission,
          engine_cc: engineCc,
          mileage: text(body.mileage) || null,
          specifications: body.specifications ?? {},
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, variant: data });
    }

    return NextResponse.json(
      { error: "Invalid action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Inventory update error:", error);

    return NextResponse.json(
      { error: "Unable to update inventory. Please try again." },
      { status: 500 }
    );
  }
}

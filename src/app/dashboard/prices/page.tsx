
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PricingManagement from "@/components/PricingManagement";

export const instant = false;

export default async function PricingPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();

  const [
    { data: models, error: modelsError },
    { data: variants, error: variantsError },
    { data: prices, error: pricesError },
  ] = await Promise.all([
    admin
      .from("car_models")
      .select("id, name")
      .order("name"),

    admin
      .from("car_variants")
      .select("id, model_id, variant_name, fuel_type, transmission")
      .order("variant_name"),

    admin
      .from("car_prices")
      .select("*")
      .order("updated_at", { ascending: false }),
  ]);

  if (modelsError || variantsError || pricesError) {
    throw new Error("Unable to load pricing management data.");
  }

  return (
    <PricingManagement
      initialModels={models ?? []}
      initialVariants={variants ?? []}
      initialPrices={prices ?? []}
    />
  );
}

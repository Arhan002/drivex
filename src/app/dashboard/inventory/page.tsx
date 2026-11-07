
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import InventoryManagement from "@/components/InventoryManagement";

export const instant = false;

export default async function InventoryPage() {
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

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  const [
    { data: models, error: modelsError },
    { data: variants, error: variantsError },
  ] = await Promise.all([
    admin
      .from("car_models")
      .select("*")
      .order("created_at", { ascending: false }),

    admin
      .from("car_variants")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  if (modelsError || variantsError) {
    throw new Error("Unable to load inventory.");
  }

  return (
    <InventoryManagement
      initialModels={models ?? []}
      initialVariants={variants ?? []}
    />
  );
}

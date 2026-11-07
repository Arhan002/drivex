
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import UsedCarManagement from "@/components/UsedCarManagement";

export const instant = false;

export default async function UsedInventoryPage() {
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

  const { data: cars, error } = await admin
    .from("used_cars")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load used car inventory.");
  }

  return <UsedCarManagement initialCars={cars ?? []} />;
}

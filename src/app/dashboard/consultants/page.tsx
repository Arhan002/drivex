
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ConsultantManagement from "@/components/ConsultantManagement";
import { connection } from "next/server";
export const instant = false;

export default async function ConsultantsPage() {
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

  const adminClient = createAdminClient();

  const { data: showrooms, error: showroomError } = await adminClient
    .from("showrooms")
    .select("id, name, city")
    .eq("is_active", true)
    .order("name");

  const { data: consultants, error: consultantError } = await adminClient
    .from("profiles")
    .select("id, full_name, phone, showroom_id, created_at")
    .eq("role", "consultant")
    .order("created_at", { ascending: false });

  if (showroomError || consultantError) {
    throw new Error("Unable to load consultant management data.");
  }

  return (
    <ConsultantManagement
      showrooms={showrooms ?? []}
      consultants={consultants ?? []}
    />
  );
}

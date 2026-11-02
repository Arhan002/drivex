import { createClient } from "./server";

export async function testDatabaseConnection() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("car_models")
    .select("id, name, body_type")
    .eq("is_active", true);

  if (error) {
    console.error("Database connection failed:", error.message);
    return null;
  }

  console.log("DriveX database connected!");
  console.log(data);

  return data;
}
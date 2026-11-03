
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type UsedCar = {
  id: string;
  stock_id: string;
  model_name: string;
  variant_name: string;
  fuel_type: string;
  manufacturing_year: number;
  kilometres_driven: number;
  number_of_owners: number;
  registration_masked: string | null;
  selling_price: number;
  inspection_report: string | null;
  image_url: string | null;
  status: string;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function UsedCarDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: car, error } = await supabase
    .from("used_cars")
    .select("*")
    .eq("id", id)
    .eq("status", "available")
    .maybeSingle();

  if (error) {
    console.error("Error fetching used car:", error.message);
    throw new Error("Unable to load vehicle details.");
  }

  if (!car) {
    notFound();
  }

  const vehicle = car as UsedCar;

  return (
    <main className="min-h-screen bg-[#f8f8f6] px-6 py-12 text-[#202020] md:px-16">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/used-cars"
          className="text-sm font-semibold text-orange-600 hover:underline"
        >
          ← Back to Used Cars
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl bg-gray-200">
              <img
                src={
                  vehicle.image_url ||
                  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200"
                }
                alt={`${vehicle.model_name} ${vehicle.variant_name}`}
                className="h-[300px] w-full object-cover md:h-[450px]"
              />
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-bold">Vehicle inspection report</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                {vehicle.inspection_report ||
                  "Inspection report is currently unavailable. Please contact our team for details."}
              </p>
            </div>
          </div>

          <div>
            <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-700">
              Available
            </span>

            <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-orange-600">
              DriveX Pre-Owned · {vehicle.stock_id}
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              {vehicle.model_name}
            </h1>

            <p className="mt-2 text-lg text-gray-500">
              {vehicle.variant_name}
            </p>

            <p className="mt-6 text-3xl font-bold text-orange-600">
              {formatPrice(Number(vehicle.selling_price))}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Listed selling price
            </p>

            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold">Vehicle overview</h2>

              <div className="mt-5 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Manufacturing year</p>
                  <p className="mt-1 font-semibold">
                    {vehicle.manufacturing_year}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Kilometres driven</p>
                  <p className="mt-1 font-semibold">
                    {vehicle.kilometres_driven.toLocaleString("en-IN")} km
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Fuel type</p>
                  <p className="mt-1 font-semibold">{vehicle.fuel_type}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Number of owners</p>
                  <p className="mt-1 font-semibold">
                    {vehicle.number_of_owners}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Stock ID</p>
                  <p className="mt-1 font-semibold">{vehicle.stock_id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Registration</p>
                  <p className="mt-1 font-semibold">
                    {vehicle.registration_masked || "Not disclosed"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-[#202020] p-6 text-white">
              <h2 className="text-xl font-bold">Interested in this car?</h2>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Contact our sales team to enquire about this vehicle and
                arrange a visit to the showroom.
              </p>
              <p className="mt-4 text-sm font-semibold text-orange-400">
                Enquiry booking coming next
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

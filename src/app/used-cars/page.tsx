
import Link from "next/link";
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
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatKilometres(km: number) {
  return new Intl.NumberFormat("en-IN").format(km);
}

export default async function UsedCarsPage() {
  const supabase = await createClient();

  const { data: cars, error } = await supabase
    .from("used_cars")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching used cars:", error.message);
  }

  const usedCars: UsedCar[] = cars ?? [];

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-[#202020]">
      <section className="bg-[#171717] px-6 py-16 text-white md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">
            DriveX Pre-Owned
          </p>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Find your next car.
            <span className="text-orange-400"> Drive with confidence.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300">
            Explore carefully selected pre-owned vehicles with transparent
            pricing and inspection information.
          </p>

          <div className="mt-8">
            <span className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white">
              {usedCars.length} cars available
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 md:px-16">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
              Our inventory
            </p>
            <h2 className="mt-2 text-3xl font-bold">Available used cars</h2>
          </div>

          <p className="text-sm text-gray-500">
            Transparent prices. Carefully selected vehicles.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load used cars right now. Please try again later.
          </div>
        ) : usedCars.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <h3 className="text-xl font-semibold">No cars available right now</h3>
            <p className="mt-2 text-gray-500">
              Please check back soon for new arrivals.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {usedCars.map((car) => (
              <article
                key={car.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-56 bg-gray-200">
                  <img
                    src={
                      car.image_url ||
                      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900"
                    }
                    alt={`${car.model_name} ${car.variant_name}`}
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700 shadow">
                    Available
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold">{car.model_name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {car.variant_name}
                      </p>
                    </div>

                    <span className="rounded-lg bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                      {car.manufacturing_year}
                    </span>
                  </div>

                  <p className="mt-4 text-2xl font-bold text-orange-600">
                    {formatPrice(Number(car.selling_price))}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-y border-gray-100 py-4 text-sm">
                    <div>
                      <p className="text-gray-400">Kilometres</p>
                      <p className="mt-1 font-semibold">
                        {formatKilometres(car.kilometres_driven)} km
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">Fuel type</p>
                      <p className="mt-1 font-semibold">{car.fuel_type}</p>
                    </div>

                    <div>
                      <p className="text-gray-400">Owners</p>
                      <p className="mt-1 font-semibold">
                        {car.number_of_owners}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">Stock ID</p>
                      <p className="mt-1 font-semibold">{car.stock_id}</p>
                    </div>
                  </div>

                  {car.registration_masked && (
                    <p className="mt-3 text-xs text-gray-500">
                      Registration: {car.registration_masked}
                    </p>
                  )}

                  <Link
                    href={`/used-cars/${car.id}`}
                    className="mt-6 block rounded-lg bg-[#202020] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    View Car Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

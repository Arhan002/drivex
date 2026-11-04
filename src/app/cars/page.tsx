export const instant = false;
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type CarModel = {
  id: string;
  name: string;
  description: string | null;
  body_type: string | null;
  image_url: string | null;
  car_variants?: {
    id: string;
    variant_name: string;
    fuel_type: string;
    transmission: string;
    car_prices?: {
      city: string;
      ex_showroom_price: number;
      road_tax: number;
      insurance: number;
      accessories: number;
      valid_until: string;
    }[];
  }[];
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600"
          >
            ← Back
          </Link>
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            Drive<span className="text-orange-500">X</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex">
          <Link href="/cars" className="font-semibold text-orange-600">
            New Cars
          </Link>
          <Link href="/used-cars" className="hover:text-orange-600">
            Used Cars
          </Link>
          <Link href="/book-test-drive" className="hover:text-orange-600">
            Test Drives
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const supabase = await createClient();

  const { data: modelData, error } = await supabase
    .from("car_models")
    .select(`
      id,
      name,
      description,
      body_type,
      image_url,
      car_variants (
        id,
        variant_name,
        fuel_type,
        transmission,
        car_prices (
          city,
          ex_showroom_price,
          road_tax,
          insurance,
          accessories,
          valid_until
        )
      )
    `)
    .eq("is_active", true);

  if (error) {
    console.error("Cars query error:", error.message);

    return (
      <main className="min-h-screen bg-[#f8f8f6]">
        <TopNav />
        <div className="px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Unable to load cars</h1>
          <p className="mt-3 text-gray-600">Please try again later.</p>
        </div>
      </main>
    );
  }

  const allCars = (modelData ?? []) as unknown as CarModel[];

  // Body type filter chips (built from the real data)
  const bodyTypes = [
    ...new Set(allCars.map((c) => c.body_type).filter(Boolean)),
  ] as string[];

  const cars = type
    ? allCars.filter((c) => c.body_type?.toLowerCase() === type.toLowerCase())
    : allCars;

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      <TopNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#17191f] px-6 py-16 text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            Explore DriveX
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Find Your Perfect Car.</h1>
          <p className="mt-4 max-w-xl text-gray-300">
            Explore our collection of new cars and discover the right vehicle
            for your journey.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Heading + count */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">New Cars</h2>
            <p className="mt-1 text-sm text-gray-500">Explore our available models</p>
          </div>
          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
            {cars.length} {cars.length === 1 ? "Model" : "Models"}
          </span>
        </div>

        {/* Filter chips */}
        {bodyTypes.length > 0 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
            <Link
              href="/cars"
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                !type
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              All
            </Link>
            {bodyTypes.map((bt) => (
              <Link
                key={bt}
                href={`/cars?type=${encodeURIComponent(bt)}`}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  type?.toLowerCase() === bt.toLowerCase()
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {bt}
              </Link>
            ))}
          </div>
        )}

        {cars.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">No cars available</h3>
            <p className="mt-2 text-gray-500">
              {type ? "No models match this filter." : "Please check back soon."}
            </p>
            {type && (
              <Link
                href="/cars"
                className="mt-5 inline-block text-sm font-semibold text-orange-600 hover:underline"
              >
                Clear filter
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => {
              const variants = car.car_variants ?? [];

              const lucknowPrices = variants.flatMap((variant) =>
                (variant.car_prices ?? [])
                  .filter((price) => price.city.toLowerCase() === "lucknow")
                  .map((price) => price.ex_showroom_price)
              );

              const startingPrice =
                lucknowPrices.length > 0 ? Math.min(...lucknowPrices) : null;

              // unique fuel types for small badges
              const fuels = [...new Set(variants.map((v) => v.fuel_type))];

              return (
                <article
                  key={car.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    {car.image_url ? (
                      <img
                        src={car.image_url}
                        alt={car.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        Image coming soon
                      </div>
                    )}

                    {car.body_type && (
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">
                        {car.body_type}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-bold text-gray-900">{car.name}</h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-500">
                      {car.description || "Discover this DriveX model."}
                    </p>

                    {fuels.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {fuels.map((f) => (
                          <span
                            key={f}
                            className="rounded-md bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        Starting ex-showroom price · Lucknow
                      </p>
                      <p className="mt-1 text-2xl font-bold text-orange-600">
                        {startingPrice !== null
                          ? formatPrice(startingPrice)
                          : "Price on request"}
                      </p>
                    </div>

                    <div className="mt-5">
                      <p className="mb-3 text-sm font-semibold text-gray-800">
                        Available variants ({variants.length})
                      </p>
                      <div className="space-y-2">
                        {variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 text-sm last:border-0"
                          >
                            <span className="font-medium text-gray-700">
                              {variant.variant_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {variant.fuel_type} · {variant.transmission}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Buttons pinned to the bottom */}
                    <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                      <Link
                        href={`/cars/${car.id}`}
                        className="rounded-xl bg-gray-900 py-3 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        View Details
                      </Link>
                      <Link
                        href="/book-test-drive"
                        className="rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600"
                      >
                        Test Drive
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="py-8 text-center text-xs text-gray-400">
        © 2026 DriveX Dealership Management. All rights reserved.
      </footer>
    </main>
  );
}
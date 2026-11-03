export const instant = false;
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

export default async function CarsPage() {
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
      <main className="min-h-screen bg-[#f8f8f6] px-6 py-20">
        <h1 className="text-3xl font-bold text-gray-900">
          Unable to load cars
        </h1>
        <p className="mt-3 text-gray-600">
          Please try again later.
        </p>
      </main>
    );
  }

  const cars = (modelData ?? []) as unknown as CarModel[];

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      {/* Page heading */}
      <section className="bg-[#171717] px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            Explore DriveX
          </p>

          <h1 className="text-4xl font-bold sm:text-5xl">
            Find Your Perfect Car.
          </h1>

          <p className="mt-4 max-w-xl text-gray-300">
            Explore our collection of new cars and discover
            the right vehicle for your journey.
          </p>
        </div>
      </section>

      {/* Car listing */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              New Cars
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Explore our available models
            </p>
          </div>

          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
            {cars.length} Models
          </span>
        </div>

        {cars.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">
              No cars available
            </h3>
            <p className="mt-2 text-gray-500">
              Please check back soon.
            </p>
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
                lucknowPrices.length > 0
                  ? Math.min(...lucknowPrices)
                  : null;

              return (
                <article
                  key={car.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Car image */}
                  <div className="h-56 overflow-hidden bg-gray-100">
                    {car.image_url ? (
                      <img
                        src={car.image_url}
                        alt={car.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        Image coming soon
                      </div>
                    )}
                  </div>

                  {/* Car information */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {car.name}
                      </h3>

                      {car.body_type && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          {car.body_type}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 line-clamp-2 min-h-10 text-sm text-gray-500">
                      {car.description || "Discover this DriveX model."}
                    </p>

                    <div className="mt-5 border-t border-gray-100 pt-4">
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
                            className="flex flex-wrap items-center justify-between gap-2 text-sm"
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

                    <a
  href={`/cars/${car.id}`}
  className="mt-6 block w-full rounded-xl bg-gray-900 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
>
  View Details →
</a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

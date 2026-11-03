import EnquiryForm from "@/components/EnquiryForm";
export const instant = false;

import { createClient } from "@/lib/supabase/server";

type CarDetail = {
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

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
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
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Car detail query error:", error.message);
    throw new Error("Unable to load car details.");
  }

  if (!data) {
    return (
      <main className="p-10">
        <h1 className="text-2xl font-bold text-red-600">
          Car not found
        </h1>
        <p className="mt-4">Requested ID: {id}</p>
      </main>
    );
  }

  const car = data as unknown as CarDetail;
  const variants = car.car_variants ?? [];

  const prices = variants.flatMap((variant) =>
    (variant.car_prices ?? [])
      .filter((price) => price.city.toLowerCase() === "lucknow")
      .map((price) => ({
        variantName: variant.variant_name,
        ...price,
      }))
  );

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <a
          href="/cars"
          className="text-sm font-semibold text-orange-600 hover:underline"
        >
          ← Back to all cars
        </a>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-gray-200">
            {car.image_url ? (
              <img
                src={car.image_url}
                alt={car.name}
                className="h-full min-h-[300px] w-full object-cover"
              />
            ) : (
              <div className="flex min-h-[300px] items-center justify-center text-gray-500">
                Image coming soon
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="font-semibold uppercase tracking-widest text-orange-600">
              DriveX New Cars
            </p>

            <h1 className="mt-3 text-4xl font-bold text-gray-900 sm:text-5xl">
              {car.name}
            </h1>

            <p className="mt-4 text-lg text-gray-600">
              {car.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {car.body_type && (
                <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
                  {car.body_type}
                </span>
              )}

              <span className="rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-700">
                {variants.length} Available Variants
              </span>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900">
                Available Variants
              </h2>

              <div className="mt-4 space-y-3">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {variant.variant_name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {variant.fuel_type} · {variant.transmission}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900">
            Pricing in Lucknow
          </h2>

          <p className="mt-2 text-gray-500">
            Price breakdown for available variants.
          </p>

          {prices.length === 0 ? (
            <div className="mt-6 rounded-xl bg-white p-6">
              Pricing is currently available on request.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {prices.map((price, index) => {
                const total =
                  Number(price.ex_showroom_price) +
                  Number(price.road_tax) +
                  Number(price.insurance) +
                  Number(price.accessories);

                return (
                  <div
                    key={`${price.variantName}-${index}`}
                    className="rounded-2xl border border-gray-200 bg-white p-6"
                  >
                    <h3 className="text-lg font-bold text-gray-900">
                      {price.variantName}
                    </h3>

                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Ex-showroom</span>
                        <span>{money(Number(price.ex_showroom_price))}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Road tax</span>
                        <span>{money(Number(price.road_tax))}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Insurance</span>
                        <span>{money(Number(price.insurance))}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Accessories</span>
                        <span>{money(Number(price.accessories))}</span>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-gray-200 pt-5">
                      <p className="text-sm text-gray-500">
                        Estimated on-road price
                      </p>
                      <p className="mt-1 text-3xl font-bold text-orange-600">
                        {money(total)}
                      </p>
                    </div>

                    <p className="mt-4 text-xs text-gray-500">
                      Price valid until {price.valid_until}.
                      Prices are illustrative and subject to confirmation.
                    </p>
                  </div>
                );
              })}
            </div>
          )}
                </section>

        {/* Customer Enquiry Form */}
        <section className="mt-14 rounded-2xl border border-gray-200 bg-white p-6 md:p-10">
          <h2 className="text-gray-900 font-bold text-2xl">
            Interested in this car?
          </h2>
          <p className="mb-6 text-gray-500">
            Share your details and our sales team will contact you.
          </p>

          <EnquiryForm
            source="new_car"
            modelId={car.id}
          />
        </section>
      </section>
    </main>
    
  );
}

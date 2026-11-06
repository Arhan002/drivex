
export const instant = false;

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {connection} from "next/server"
import {
  ArrowRight,
  ArrowLeft,
  Fuel,
  Settings2,
  CarFront,
  MapPin,
  ChevronRight,
  Sparkles,
} from "lucide-react";

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

function TopNav({ backHref, from }: { backHref: string; from: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-5">
          <Link
            href={backHref}
            className="flex items-center gap-2 rounded-lg text-sm font-semibold text-neutral-500 transition hover:text-orange-600"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-neutral-950"
          >
            DRIVE<span className="text-orange-500">X.</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 sm:flex">
          <Link href={`/cars?from=${from}`} className="font-bold text-orange-600">
            New Cars
          </Link>
          <Link href={`/used-cars?from=${from}`} className="transition hover:text-orange-600">
            Used Cars
          </Link>
          <Link href={`/book-test-drive?from=${from}`} className="transition hover:text-orange-600">
            Test Drives
          </Link>
        </nav>

        <Link
          href={`/book-test-drive?from=${from}`}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-xs font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-lg sm:text-sm"
        >
          Book a test drive
          <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; from?: string }>;
}) {
  await connection();
  const { type, from: source } = await searchParams;
  const from = source === "dashboard" ? "dashboard" : "home";
  const backHref = from === "dashboard" ? "/dashboard" : "/";
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
      <main className="min-h-screen bg-[#f7f7f5]">
       <TopNav backHref={backHref} from={from} />

        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <CarFront size={42} className="mx-auto text-orange-500" />

          <h1 className="mt-6 text-3xl font-bold text-neutral-950">
            Unable to load cars
          </h1>

          <p className="mt-3 text-neutral-500">
            Please try again later.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 hover:text-black"
          >
            Return home
            <ArrowRight size={17} />
          </Link>
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
    ? allCars.filter(
        (c) => c.body_type?.toLowerCase() === type.toLowerCase()
      )
    : allCars;

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <TopNav backHref={backHref} from={from} />

      {/* PREMIUM HERO */}
      <section className="relative isolate overflow-hidden bg-[#090909] px-5 py-20 text-white sm:px-8 lg:py-28">

        <div className="pointer-events-none absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full bg-orange-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 backdrop-blur-md">
            <Sparkles size={14} className="text-orange-500" />
            Explore the DriveX collection
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">

            <div>
              <p className="flex items-center gap-2 text-sm text-neutral-400">
                <MapPin size={16} className="text-orange-500" />
                Lucknow, Uttar Pradesh
              </p>

              <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Find your
                <br />
                perfect <span className="text-orange-500">drive.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-neutral-400 sm:text-lg">
                Discover the DriveX range. Compare features, explore
                variants and find the right car for your journey.
              </p>

              <Link
                href="#available-cars"
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:shadow-[0_12px_35px_rgba(249,115,22,0.25)]"
              >
                Explore available cars
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:justify-self-end lg:min-w-[300px]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md">
                <p className="text-3xl font-bold">{allCars.length.toString().padStart(2, "0")}</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-neutral-400">
                  Available models
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md">
                <p className="text-3xl font-bold">{bodyTypes.length.toString().padStart(2, "0")}</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-neutral-400">
                  Body types
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* AVAILABLE CARS */}
      <section
        id="available-cars"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24"
      >

        {/* Heading */}
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-orange-600">
              The new car collection
            </p>

            <h2 className="text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl">
              Explore our <span className="text-orange-500">models.</span>
            </h2>

            <p className="mt-3 text-sm leading-7 text-neutral-500">
              Find the right combination of style, comfort and performance.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 shadow-sm">
            <CarFront size={17} className="text-orange-500" />
            {cars.length} {cars.length === 1 ? "Model" : "Models"}
          </div>
        </div>

        {/* Filter chips */}
        {bodyTypes.length > 0 && (
          <div className="mb-10 flex gap-2 overflow-x-auto pb-2">

            <Link
              href={`/cars?from=${from}`}
              className={`shrink-0 rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                !type
                  ? "border-neutral-950 bg-neutral-950 text-white shadow-lg"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-orange-400 hover:text-orange-600"
              }`}
            >
              All vehicles
            </Link>

            {bodyTypes.map((bt) => (
              <Link
                key={bt}
                href={`/cars?type=${encodeURIComponent(bt)}&from=${from}`}
                className={`shrink-0 rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                  type?.toLowerCase() === bt.toLowerCase()
                    ? "border-neutral-950 bg-neutral-950 text-white shadow-lg"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-orange-400 hover:text-orange-600"
                }`}
              >
                {bt}
              </Link>
            ))}
          </div>
        )}

        {/* Empty state or listings */}
        {cars.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center shadow-sm">

            <CarFront size={42} className="mx-auto text-orange-500" />

            <h3 className="mt-5 text-2xl font-bold text-neutral-950">
              No cars available
            </h3>

            <p className="mt-3 text-sm text-neutral-500">
              {type
                ? "No models match this filter."
                : "Please check back soon."}
            </p>

            {type && (
              <Link
                href="/cars"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700"
              >
                <ArrowLeft size={16} />
                Clear filter
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">

            {cars.map((car, index) => {
              const variants = car.car_variants ?? [];

              const lucknowPrices = variants.flatMap((variant) =>
                (variant.car_prices ?? [])
                  .filter(
                    (price) => price.city.toLowerCase() === "lucknow"
                  )
                  .map((price) => price.ex_showroom_price)
              );

              const startingPrice =
                lucknowPrices.length > 0
                  ? Math.min(...lucknowPrices)
                  : null;

              const fuels = [
                ...new Set(variants.map((v) => v.fuel_type)),
              ];

              return (
                <article
                  key={car.id}
                  className="group/car stagger-item flex flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-orange-200 hover:shadow-2xl motion-reduce:transition-none"
                  style={{ animationDelay: `${index * 120}ms` }}
                >

                  {/* Vehicle image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">

                    {car.image_url ? (
                      <img
                        src={car.image_url}
                        alt={car.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/car:scale-110 motion-reduce:transition-none"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-neutral-100 text-neutral-400">
                        <CarFront size={44} strokeWidth={1.2} />
                        <span className="ml-3 text-sm">Image coming soon</span>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    {car.body_type && (
                      <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/95 px-4 py-1.5 text-xs font-bold text-neutral-800 shadow-sm backdrop-blur">
                        {car.body_type}
                      </span>
                    )}

                    <Link
                      href={`/cars/${car.id}?from=${from}`}
                      aria-label={`View ${car.name} details`}
                      className="absolute bottom-4 right-4 rounded-full bg-orange-500 p-3 text-black opacity-0 shadow-lg transition-all duration-300 group-hover/car:translate-x-0 group-hover/car:opacity-100 hover:bg-orange-400"
                      >
                        <ArrowRight size={18} />
                      </Link>
                  </div>

                  {/* Vehicle information */}
                  <div className="flex flex-1 flex-col p-6 sm:p-7">

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                        DriveX new collection
                      </p>

                      <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-950">
                        {car.name}
                      </h3>

                      <p className="mt-2 min-h-[2.5rem] text-sm leading-6 text-neutral-500">
                        {car.description || "Discover this DriveX model."}
                      </p>
                    </div>

                    {/* Fuel options */}
                    {fuels.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {fuels.map((f) => (
                          <span
                            key={f}
                            className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700"
                          >
                            <Fuel size={14} />
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <div className="mt-6 border-t border-neutral-100 pt-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Starting ex-showroom price · Lucknow
                      </p>

                      <p className="mt-2 text-2xl font-extrabold text-neutral-950">
                        {startingPrice !== null
                          ? formatPrice(startingPrice)
                          : "Price on request"}
                      </p>
                    </div>

                    {/* Variants */}
                    <div className="mt-6">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-bold text-neutral-900">
                          Available variants
                        </p>

                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                          {variants.length}
                        </span>
                      </div>

                      {variants.length > 0 ? (
                        <div className="space-y-3 rounded-2xl bg-neutral-50 p-4">
                          {variants.map((variant) => (
                            <div
                              key={variant.id}
                              className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/70 pb-3 text-sm last:border-0 last:pb-0"
                            >
                              <span className="font-semibold text-neutral-800">
                                {variant.variant_name}
                              </span>

                              <span className="text-xs text-neutral-500">
                                {variant.fuel_type} · {variant.transmission}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
                          Contact us for variant information.
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto grid grid-cols-2 gap-3 pt-7">

                      <Link
href={`/cars/${car.id}?from=${from}`}                        
className="group/details flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-3 py-3.5 text-center text-sm font-bold text-white transition-all duration-300 hover:bg-orange-500 hover:text-black"
                      >
                        Details
                        <ChevronRight
                          size={17}
                          className="transition-transform group-hover/details:translate-x-1"
                        />
                      </Link>

                      <Link
                        href={`/book-test-drive?from=${from}`}
                        className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 py-3.5 text-center text-sm font-bold text-neutral-700 transition-all duration-300 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700"
                      >
                        Test drive
                      </Link>

                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#090909] px-5 py-9 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight"
          >
            DRIVE<span className="text-orange-500">X.</span>
          </Link>

          <p className="text-xs text-neutral-500">
            © 2026 DriveX. Demonstration dealership platform.
          </p>

          <Link
            href="/"
            className="text-sm font-semibold text-neutral-400 transition hover:text-orange-500"
          >
            Back to home ↑
          </Link>
        </div>
      </footer>
    </main>
  );
}


import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

export const instant = false;

type CarPrice = {
  city: string;
  ex_showroom_price: number;
  road_tax: number;
  insurance: number;
  accessories: number;
  valid_until: string;
};

type CarVariant = {
  id: string;
  variant_name: string;
  fuel_type: string;
  transmission: string;
  car_prices?: CarPrice[];
};

type CarModel = {
  id: string;
  name: string;
  description: string | null;
  body_type: string | null;
  image_url: string | null;
  car_variants?: CarVariant[];
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const getOnRoadTotal = (price: CarPrice) =>
  Number(price.ex_showroom_price) +
  Number(price.road_tax) +
  Number(price.insurance) +
  Number(price.accessories);

// Uses the server's local calendar date.
const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function TopNav({
  backHref,
  from,
}: {
  backHref: string;
  from: string;
}) {
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
            href={backHref}
            className="text-2xl font-extrabold tracking-tight text-neutral-950"
          >
            DRIVE<span className="text-orange-500">X.</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 sm:flex">
          <Link
            href={`/cars?from=${from}`}
            className="font-bold text-orange-600"
          >
            New Cars
          </Link>

          <Link
            href={`/used-cars?from=${from}`}
            className="transition hover:text-orange-600"
          >
            Used Cars
          </Link>

          <Link
            href={`/book-test-drive?from=${from}`}
            className="transition hover:text-orange-600"
          >
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

  const from =
    source === "buyer"
      ? "buyer"
      : source === "dashboard"
        ? "dashboard"
        : "home";

  const backHref =
    from === "buyer"
      ? "/buyer/dashboard"
      : from === "dashboard"
        ? "/dashboard"
        : "/";

  const supabase = await createClient();
  const today = getToday();

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
    .eq("is_active", true)
    .order("name");

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
            href={backHref}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 hover:text-black"
          >
            Return
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  const allCars = (modelData ?? []) as unknown as CarModel[];

  const bodyTypes = [
    ...new Set(
      allCars
        .map((car) => car.body_type)
        .filter((bodyType): bodyType is string => Boolean(bodyType))
    ),
  ];

  const cars = type
    ? allCars.filter(
        (car) =>
          car.body_type?.toLowerCase() === type.toLowerCase()
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

            <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl lg:min-w-[380px]">
              {allCars[0]?.image_url && (
                <img
                  src={allCars[0].image_url}
                  alt={allCars[0].name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
                  Explore DriveX
                </p>

                <h2 className="mt-2 text-3xl font-extrabold">
                  {allCars[0]?.name ?? "Our Collection"}
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                    <p className="text-2xl font-bold">
                      {allCars.length.toString().padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-xs text-neutral-300">
                      Available models
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                    <p className="text-2xl font-bold">
                      {bodyTypes.length.toString().padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-xs text-neutral-300">
                      Body types
                    </p>
                  </div>
                </div>
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
        <div className="mb-9 flex flex-col justify-between gap-5 border-b border-neutral-200 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              THE DRIVEX COLLECTION
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
              Explore our <span className="text-orange-500">models.</span>
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Discover the perfect combination of design, comfort and performance.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-3 shadow-sm">
            <CarFront size={21} className="text-orange-500" />
            <div>
              <p className="text-xl font-extrabold leading-none text-neutral-950">
                {cars.length.toString().padStart(2, "0")}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                {cars.length === 1 ? "Model available" : "Models available"}
              </p>
            </div>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        {bodyTypes.length > 0 && (
          <div className="mb-12 flex flex-wrap items-center gap-3">
            <span className="mr-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
              Browse by category
            </span>

            <Link
              href={`/cars?from=${from}`}
              scroll={false}
              className={`inline-flex items-center rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                !type
                  ? "border-orange-500 bg-orange-500 text-black shadow-md shadow-orange-500/20"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              All vehicles
            </Link>

            {bodyTypes.map((bodyType) => {
              const isActive =
                type?.toLowerCase() === bodyType.toLowerCase();

              return (
                <Link
                  key={bodyType}
                  href={`/cars?type=${encodeURIComponent(bodyType)}&from=${from}`}
                  scroll={false}
                  className={`inline-flex items-center rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "border-orange-500 bg-orange-500 text-black shadow-md shadow-orange-500/20"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  }`}
                >
                  {bodyType}
                </Link>
              );
            })}
          </div>
        )}

        {/* CAR LISTINGS */}
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
                href={`/cars?from=${from}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700"
              >
                <ArrowLeft size={16} />
                Clear filter
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {cars.map((car) => {
              const variants = car.car_variants ?? [];

              // Only use valid Lucknow price records.
              const validLucknowPrices = variants.flatMap((variant) =>
                (variant.car_prices ?? [])
                  .filter(
                    (price) =>
                      price.city.trim().toLowerCase() === "lucknow" &&
                      price.valid_until >= today
                  )
                  .map((price) => getOnRoadTotal(price))
              );

              const startingPrice =
                validLucknowPrices.length > 0
                  ? Math.min(...validLucknowPrices)
                  : null;

              const fuels = [
                ...new Set(variants.map((variant) => variant.fuel_type)),
              ];

              const transmissions = [
                ...new Set(
                  variants.map((variant) => variant.transmission)
                ),
              ];

              return (
                <article
                  key={car.id}
                  className="group/car flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                >
                  {/* CAR IMAGE */}
                  <Link
                    href={`/cars/${car.id}?from=${from}`}
                    className="relative block aspect-[16/10] overflow-hidden bg-neutral-100"
                  >
                    {car.image_url ? (
                      <img
                        src={car.image_url}
                        alt={car.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover/car:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-400">
                        <CarFront size={48} strokeWidth={1.2} />
                        <span className="ml-3 text-sm">
                          Image coming soon
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                    {car.body_type && (
                      <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-bold text-neutral-900 shadow-sm">
                        {car.body_type}
                      </span>
                    )}

                    <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-black shadow-lg transition-transform group-hover/car:translate-x-1">
                      <ArrowRight size={19} />
                    </span>
                  </Link>

                  {/* CAR INFORMATION */}
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                        DRIVEX COLLECTION
                      </p>

                      <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-950">
                        {car.name}
                      </h3>

                      <p className="mt-2 min-h-[2.5rem] text-sm leading-6 text-neutral-500">
                        {car.description || "Discover this DriveX model."}
                      </p>
                    </div>

                    {/* SPECIFICATIONS */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {fuels.map((fuel) => (
                        <span
                          key={fuel}
                          className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700"
                        >
                          <Fuel size={14} />
                          {fuel}
                        </span>
                      ))}

                      {transmissions.map((transmission) => (
                        <span
                          key={transmission}
                          className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700"
                        >
                          <Settings2 size={14} />
                          {transmission}
                        </span>
                      ))}
                    </div>

                    {/* ON-ROAD PRICE */}
                    <div className="mt-6 border-t border-neutral-100 pt-5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Starting on-road price · Lucknow
                      </p>

                      <p className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-950">
                        {startingPrice !== null
                          ? formatPrice(startingPrice)
                          : "Price on request"}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-neutral-500">
                        {startingPrice !== null
                          ? "Includes ex-showroom price, road tax, insurance and accessories."
                          : "Contact our dealership for the latest pricing."}
                      </p>
                    </div>

                    {/* VARIANT SUMMARY */}
                    <div className="mt-5 flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
                      <span className="text-sm font-semibold text-neutral-700">
                        Available variants
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-neutral-800 shadow-sm">
                        {variants.length}
                      </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                      <Link
                        href={`/cars/${car.id}?from=${from}`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-3 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500 hover:text-black"
                      >
                        Details
                        <ChevronRight size={17} />
                      </Link>

                      <Link
                        href={`/book-test-drive?from=${from}`}
                        className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 py-3.5 text-sm font-bold text-neutral-700 transition hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700"
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
            href={backHref}
            className="text-2xl font-extrabold tracking-tight"
          >
            DRIVE<span className="text-orange-500">X.</span>
          </Link>

          <p className="text-xs text-neutral-500">
            © 2026 DriveX. Demonstration dealership platform.
          </p>

          <Link
            href={backHref}
            className="text-sm font-semibold text-neutral-400 transition hover:text-orange-500"
          >
            Back ↑
          </Link>
        </div>
      </footer>
    </main>
  );
}

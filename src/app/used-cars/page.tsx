
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  ArrowLeft,
  CarFront,
  Fuel,
  Gauge,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

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
            className="flex items-center gap-2 text-sm font-semibold text-neutral-500 transition hover:text-orange-600"
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
            className="transition hover:text-orange-600"
          >
            New Cars
          </Link>

          <Link
            href={`/used-cars?from=${from}`}
            className="font-bold text-orange-600"
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

export default async function UsedCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from: source } = await searchParams;
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

  const { data: cars, error } = await supabase
    .from("used_cars")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching used cars:", error.message);
  }

  const usedCars: UsedCar[] = cars ?? [];
  const featuredCar = usedCars.find((car) => car.image_url) ?? usedCars[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <TopNav backHref={backHref} from={from} />

      {/* PREMIUM HERO */}
      <section className="relative isolate overflow-hidden bg-[#090909] px-5 py-20 text-white sm:px-8 lg:py-24">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full bg-orange-500/15 blur-[120px]" />

        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 backdrop-blur-md">
            <CarFront size={15} className="text-orange-500" />
            DriveX Pre-Owned Collection
          </div>

          {/* HERO GRID */}
          <div className="mt-9 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* LEFT: HERO CONTENT */}
            <div>
              <p className="flex items-center gap-2 text-sm text-neutral-400">
                <MapPin size={16} className="text-orange-500" />
                Lucknow, Uttar Pradesh
              </p>

              <h1 className="mt-5 max-w-2xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Pre-owned.
                <br />
                <span className="text-orange-500">
                  Carefully chosen.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-neutral-400 sm:text-lg">
                Find your next car and drive with confidence.
                Explore available vehicles with transparent pricing
                and important details shown upfront.
              </p>

              <Link
                href="#available-cars"
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:shadow-[0_12px_35px_rgba(249,115,22,0.25)]"
              >
                Explore available cars
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* RIGHT: FEATURED USED CAR */}
            <div className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl lg:h-[420px]">
              {featuredCar?.image_url ? (
                <img
                  src={featuredCar.image_url}
                  alt={`${featuredCar.model_name} ${featuredCar.variant_name}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
                  <CarFront
                    size={64}
                    strokeWidth={1}
                    className="text-neutral-600"
                  />
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                    Image unavailable
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
                  DRIVEX PRE-OWNED
                </p>

                <h2 className="mt-2 text-3xl font-extrabold">
                  {featuredCar?.model_name ?? "Pre-owned collection"}
                </h2>

                <p className="mt-1 text-sm text-neutral-300">
                  {featuredCar?.variant_name ?? "Explore available vehicles"}
                </p>

                <div className="mt-5 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-2xl font-bold">
                    {usedCars.length.toString().padStart(2, "0")}
                  </p>

                  <p className="mt-1 text-xs text-neutral-300">
                    Available pre-owned cars
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AVAILABLE INVENTORY */}
      <section
        id="available-cars"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24"
      >
        {/* SECTION HEADING */}
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-orange-600">
              The DriveX pre-owned collection
            </p>

            <h2 className="text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl">
              Find your <span className="text-orange-500">next car.</span>
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-7 text-neutral-500">
              Explore available vehicles with clear pricing,
              mileage and ownership information.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 shadow-sm">
            <CarFront size={17} className="text-orange-500" />
            {usedCars.length} {usedCars.length === 1 ? "Vehicle" : "Vehicles"}
          </div>
        </div>

        {/* ERROR STATE */}
        {error ? (
          <div
            role="alert"
            className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700"
          >
            <h3 className="text-xl font-bold">
              Unable to load used cars
            </h3>

            <p className="mt-2 text-sm">
              Please try again later.
            </p>
          </div>
        ) : usedCars.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center shadow-sm">
            <CarFront
              size={42}
              className="mx-auto text-orange-500"
            />

            <h3 className="mt-5 text-2xl font-bold text-neutral-950">
              No cars available right now
            </h3>

            <p className="mt-3 text-sm text-neutral-500">
              Please check back soon for new arrivals.
            </p>

            <Link
              href={backHref}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-orange-600 transition hover:text-orange-700"
            >
              <ArrowLeft size={16} />
              Return home
            </Link>
          </div>
        ) : (
          /* VEHICLE CARDS */
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {usedCars.map((car, index) => (
              <article
                key={car.id}
                className="group/car stagger-item flex flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-orange-200 hover:shadow-2xl motion-reduce:transition-none"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                {/* VEHICLE IMAGE */}
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src={
                      car.image_url ||
                      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900"
                    }
                    alt={`${car.model_name} ${car.variant_name}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/car:scale-110 motion-reduce:transition-none"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                  <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/95 px-4 py-1.5 text-xs font-bold text-green-700 shadow-sm backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Available
                  </span>

                  <span className="absolute bottom-4 right-4 rounded-full bg-orange-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black">
                    Pre-owned
                  </span>

                  <Link
                    href={`/used-cars/${car.id}?from=${from}`}
                    aria-label={`View ${car.model_name} details`}
                    className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-950 opacity-0 shadow-lg transition-all duration-300 group-hover/car:translate-x-0 group-hover/car:opacity-100 hover:bg-orange-500"
                  >
                    <ArrowRight size={18} />
                  </Link>
                </div>

                {/* VEHICLE INFORMATION */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                        DriveX pre-owned
                      </p>

                      <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-950">
                        {car.model_name}
                      </h3>

                      <p className="mt-1 text-sm text-neutral-500">
                        {car.variant_name}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-xl bg-neutral-100 px-3 py-2 text-sm font-bold text-neutral-800">
                      {car.manufacturing_year}
                    </span>
                  </div>

                  {/* PRICE */}
                  <div className="mt-6 border-t border-neutral-100 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Asking price
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-neutral-950">
                      {formatPrice(Number(car.selling_price))}
                    </p>
                  </div>

                  {/* SPECIFICATIONS */}
                  <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-neutral-50 p-4">
                    <div>
                      <p className="flex items-center gap-2 text-xs text-neutral-400">
                        <Gauge size={14} className="text-orange-500" />
                        Kilometres
                      </p>

                      <p className="mt-2 text-sm font-bold text-neutral-800">
                        {formatKilometres(car.kilometres_driven)} km
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-xs text-neutral-400">
                        <Fuel size={14} className="text-orange-500" />
                        Fuel type
                      </p>

                      <p className="mt-2 text-sm font-bold text-neutral-800">
                        {car.fuel_type}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-xs text-neutral-400">
                        <CarFront size={14} className="text-orange-500" />
                        Owners
                      </p>

                      <p className="mt-2 text-sm font-bold text-neutral-800">
                        {car.number_of_owners}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-xs text-neutral-400">
                        <ShieldCheck size={14} className="text-orange-500" />
                        Stock ID
                      </p>

                      <p className="mt-2 text-sm font-bold text-neutral-800">
                        {car.stock_id}
                      </p>
                    </div>
                  </div>

                  {/* ADDITIONAL DETAILS */}
                  <div className="mt-4 space-y-2">
                    {car.registration_masked && (
                      <p className="text-xs text-neutral-500">
                        Registration: {car.registration_masked}
                      </p>
                    )}

                    {car.inspection_report && (
                      <p className="flex items-center gap-2 text-xs font-medium text-green-700">
                        <ShieldCheck size={14} />
                        Inspection information available
                      </p>
                    )}
                  </div>

                  {/* VEHICLE ACTION */}
                  <Link
                    href={`/used-cars/${car.id}?from=${from}`}
                    className="group/details mt-auto flex items-center justify-between rounded-xl bg-neutral-950 px-5 py-4 text-sm font-bold text-white transition-all duration-300 hover:bg-orange-500 hover:text-black hover:shadow-lg"
                  >
                    <span>View vehicle details</span>

                    <ChevronRight
                      size={19}
                      className="transition-transform duration-300 group-hover/details:translate-x-1"
                    />
                  </Link>
                </div>
              </article>
            ))}
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
            {from === "buyer"
              ? "Back to buyer dashboard ↑"
              : from === "dashboard"
                ? "Back to dashboard ↑"
                : "Back to home ↑"}
          </Link>
        </div>
      </footer>
    </main>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EnquiryForm from "@/components/EnquiryForm";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  ChevronDown,
  Fuel,
  Settings2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";


export const instant = false;

type Showroom = {
  id: string;
  name: string;
  city: string;
};

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

// Shared focus ring for keyboard users
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500";

function TopNav({ from }: { from: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/cars?from=${from}`}
            className={`flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold text-neutral-500 transition hover:text-orange-600 ${focusRing}`}
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">All cars</span>
          </Link>

          <Link
            href="/"
            className={`text-2xl font-extrabold tracking-tight text-neutral-950 ${focusRing}`}
          >
            DRIVE<span className="text-orange-500">X.</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 rounded-full bg-neutral-100 p-1 text-sm font-semibold sm:flex">
          <Link
            href={`/cars?from=${from}`}
            className={`rounded-full bg-white px-4 py-2 text-neutral-950 shadow-sm ${focusRing}`}
          >
            New cars
          </Link>
          <Link
            href={`/used-cars?from=${from}`}
            className={`rounded-full px-4 py-2 text-neutral-600 transition hover:text-neutral-950 ${focusRing}`}
          >
            Used cars
          </Link>
          <Link
            href={`/book-test-drive?from=${from}`}
            className={`rounded-full px-4 py-2 text-neutral-600 transition hover:text-neutral-950 ${focusRing}`}
          >
            Test drives
          </Link>
        </nav>

        <Link
          href={`/book-test-drive?from=${from}`}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-xs font-bold text-neutral-950 shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-400 sm:px-5 sm:py-3 sm:text-sm ${focusRing}`}
        >
          <span className="hidden sm:inline">Book a test drive</span>
          <span className="sm:hidden">Test drive</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}

export default async function CarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  await connection();

  const { id } = await params;
  const { from: source } = await searchParams;

  const from =
    source === "buyer"
      ? "buyer"
      : source === "dashboard"
        ? "dashboard"
        : "home";
  const supabase = await createClient();
  // Get the currently authenticated user
const {
  data: { user },
} = await supabase.auth.getUser();

// Fetch the user's role
let userRole: string | null = null;

if (user) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile role query error:", profileError.message);
  } else {
    userRole = profile?.role ?? null;
  }
}

// Guests can submit enquiries.
// Authenticated users must have the buyer role.
const normalizedRole = userRole?.trim().toLowerCase();

const canSubmitEnquiry =
  !user || !["admin", "consultant"].includes(normalizedRole ?? "");
  // Fetch car details
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
    console.error("Car detail query error:", error);
    throw new Error("Unable to load car details.");
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
            <CarFront size={34} className="text-orange-500" />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-neutral-950">
            Car not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            We couldn&apos;t find the vehicle you were looking for. It may have
            been removed or is no longer available.
          </p>

          <Link
            href={`/cars?from=${from}`}
            className={`mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500 hover:text-neutral-950 ${focusRing}`}
          >
            <ArrowLeft size={16} />
            Explore all cars
          </Link>
        </div>
      </main>
    );
  }

  // Fetch active showrooms
  const { data: showroomData, error: showroomError } = await supabase
    .from("showrooms")
    .select("id, name, city")
    .eq("is_active", true)
    .order("name");

  if (showroomError) {
    console.error("Showroom query error:", showroomError.message);
    throw new Error("Unable to load showrooms.");
  }

  const showrooms: Showroom[] = showroomData ?? [];
  const { data: modelData, error: modelError } = await supabase
  .from("car_models")
  .select("id, name")
  .eq("is_active", true)
  .order("name");

if (modelError) {
  console.error("Car models query error:", modelError.message);
  throw new Error("Unable to load car models.");
}

const models = modelData ?? [];

  const car = data as unknown as CarDetail;
  const variants = car.car_variants ?? [];

  // Calculate Lucknow prices
  const prices = variants.flatMap((variant) =>
    (variant.car_prices ?? [])
      .filter((price) => price.city.toLowerCase() === "lucknow")
      .map((price) => ({
        variantName: variant.variant_name,
        ...price,
      }))
  );

  const startingPrice =
    prices.length > 0
      ? Math.min(
          ...prices.map(
            (price) =>
              Number(price.ex_showroom_price) +
              Number(price.road_tax) +
              Number(price.insurance) +
              Number(price.accessories)
          )
        )
      : null;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <TopNav from={from} />

      {/* VEHICLE HERO */}
      <section className="relative isolate overflow-hidden bg-[#090909] text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-orange-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-orange-600/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
          {/* Vehicle image */}
          <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 shadow-2xl">
            {car.image_url ? (
              <img
                src={car.image_url}
                alt={car.name}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
              />
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 text-neutral-500">
                <CarFront size={60} strokeWidth={1.2} />
                <span className="text-sm">Image coming soon</span>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md sm:bottom-5 sm:left-5">
              <Sparkles size={14} className="text-orange-400" />
              DriveX New Collection
            </div>
          </div>

          {/* Vehicle introduction */}
          <div className="flex flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              New car
            </div>

            <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              {car.name}
              <span className="text-orange-500">.</span>
            </h1>

            <p className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
              <MapPin size={16} className="text-orange-500" />
              Showrooms in Lucknow, Uttar Pradesh
            </p>

            <p className="mt-6 max-w-xl text-base leading-8 text-neutral-400 sm:text-lg">
              {car.description || "Discover the DriveX vehicle collection."}
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {car.body_type && (
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-100 ring-1 ring-white/15">
                  {car.body_type}
                </span>
              )}
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-100 ring-1 ring-white/15">
                {variants.length} {variants.length === 1 ? "variant" : "variants"}
              </span>
            </div>

            {/* Starting price card */}
            <div className="mt-9 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Starting on-road price · Lucknow
              </p>

              <p className="mt-2 text-3xl font-extrabold text-orange-400 sm:text-4xl">
                {startingPrice !== null
                  ? money(startingPrice)
                  : "Price on request"}
              </p>

              <p className="mt-2 text-xs text-neutral-500">
                Based on available variant pricing.
              </p>
            </div>

            <Link
              href="#pricing"
              className={`mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-neutral-950 shadow-lg shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:shadow-xl sm:w-fit ${focusRing}`}
            >
              Explore pricing
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* VARIANTS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-600">
              Find your configuration
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Explore <span className="text-orange-500">variants.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-neutral-500">
              Compare fuel options and transmissions before you choose.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-700 shadow-sm ring-1 ring-neutral-200">
            <CarFront size={17} className="text-orange-500" />
            {variants.length} {variants.length === 1 ? "variant" : "variants"}
          </span>
        </div>

        {variants.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500">
            Variant information is currently unavailable.
          </div>
        ) : (
          <div
            className={
              variants.length === 1
                ? "grid grid-cols-1"
                : "grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            }
          >
            {variants.map((variant, index) => {
              const variantPrices = (variant.car_prices ?? []).filter(
                (price) => price.city.toLowerCase() === "lucknow"
              );

              const lowestPrice =
                variantPrices.length > 0
                  ? Math.min(
                      ...variantPrices.map(
                        (price) =>
                          Number(price.ex_showroom_price) +
                          Number(price.road_tax) +
                          Number(price.insurance) +
                          Number(price.accessories)
                      )
                    )
                  : null;

              return (
                <article
                  key={variant.id}
                  className={`stagger-item group flex flex-col rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl motion-reduce:transition-none sm:p-8 ${
                    variants.length === 1
                      ? "lg:flex-row lg:items-center lg:justify-between lg:gap-12"
                      : ""
                  }`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className={variants.length === 1 ? "flex-1" : ""}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition duration-300 group-hover:bg-orange-500 group-hover:text-white">
                        <CarFront size={26} />
                      </div>

                      <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Variant {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-neutral-950">
                      {variant.variant_name}
                    </h3>

                    <p className="mt-2 text-sm text-neutral-500">
                      Choose your preferred configuration.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-700">
                        <Fuel size={16} className="text-orange-500" />
                        {variant.fuel_type}
                      </span>

                      <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-700">
                        <Settings2 size={16} className="text-orange-500" />
                        {variant.transmission}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-7 rounded-2xl bg-neutral-50 p-6 transition-colors duration-300 group-hover:bg-orange-50/70 ${
                      variants.length === 1
                        ? "lg:mt-0 lg:w-[38%] lg:shrink-0"
                        : "mt-auto"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Lucknow on-road price
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
                      {lowestPrice !== null
                        ? money(lowestPrice)
                        : "Price on request"}
                    </p>

                    <p className="mt-2 text-xs text-neutral-500">
                      Transparent pricing with a complete cost breakdown.
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      
      {/* ON-ROAD PRICING */}
      <section
        id="pricing"
        className="scroll-mt-24 bg-white px-4 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-600">
                Transparent pricing
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
                Know the full <span className="text-orange-500">price.</span>
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500">
                See the estimated on-road price for each available variant in
                Lucknow, broken down line by line.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-700">
              <ShieldCheck size={17} />
              Transparent breakdown
            </div>
          </div>

          {prices.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-[#f7f7f5] p-10 text-center text-neutral-500">
              Pricing is currently available on request.
            </div>
          ) : (
            <div className="space-y-6">
              {prices.map((price, index) => {
                const total =
                  Number(price.ex_showroom_price) +
                  Number(price.road_tax) +
                  Number(price.insurance) +
                  Number(price.accessories);

                const lines = [
                  { label: "Ex-showroom price", value: price.ex_showroom_price },
                  { label: "Road tax", value: price.road_tax },
                  { label: "Insurance", value: price.insurance },
                  { label: "Accessories", value: price.accessories },
                ];

                return (
                  <article
                    key={`${price.variantName}-${index}`}
                    className="stagger-item grid gap-8 rounded-3xl border border-neutral-200/80 bg-[#f7f7f5] p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none sm:p-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-stretch lg:gap-12"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                            Variant pricing
                          </p>

                          <h3 className="mt-2 text-2xl font-extrabold text-neutral-950">
                            {price.variantName}
                          </h3>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                          <ShieldCheck size={24} />
                        </div>
                      </div>

                      <dl className="mt-7 divide-y divide-neutral-200 text-sm">
                        {lines.map((line) => (
                          <div
                            key={line.label}
                            className="flex items-center justify-between gap-4 py-4"
                          >
                            <dt className="text-neutral-500">{line.label}</dt>
                            <dd className="font-bold text-neutral-900">
                              {money(Number(line.value))}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl bg-[#090909] p-7 text-white sm:p-9">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">
                          Your estimated on-road price
                        </p>

                        <p className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                          {money(total)}
                        </p>

                        <div className="mt-5 h-1 w-16 rounded-full bg-orange-500" />
                      </div>

                      <div className="mt-8 border-t border-white/10 pt-5">
                        <p className="text-sm leading-6 text-neutral-400">
                          Complete price breakdown for Lucknow. No hidden
                          charges in this estimate.
                        </p>

                        <p className="mt-4 text-xs leading-5 text-neutral-500">
                          Price valid until {price.valid_until}. Prices are
                          illustrative and subject to confirmation.
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>


     {/* CUSTOMER ENQUIRY */}
{canSubmitEnquiry && (
  <section className="px-4 py-16 sm:px-8 lg:py-24">
    <div className="mx-auto max-w-7xl">

      <div className="mb-8 overflow-hidden rounded-[2rem] bg-[#090909] px-6 py-10 text-white sm:px-12 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">
          Your next step
        </p>

        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Interested in {car.name}?
        </h2>

        <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400">
          Tell us what you&apos;re looking for and our dealership team will
          help you with the next steps.
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200/70 sm:p-8 lg:p-10">
        <EnquiryForm
          source="new_car"
          modelId={car.id}
          showrooms={showrooms}
          models={models}
          userRole={userRole}
        />
      </div>

    </div>
  </section>
)}

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#090909] px-4 py-10 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            DRIVE<span className="text-orange-500">X.</span>
          </Link>

          <p className="text-xs text-neutral-500">
            © 2026 DriveX. Demonstration dealership platform.
          </p>

          <a
            href="#top"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-400 transition hover:text-orange-500"
          >
            Back to top
            <ChevronDown size={16} className="rotate-180" />
          </a>
        </div>
      </footer>
    </main>
  );
}
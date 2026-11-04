// Next.js route option (kept from your original file)
export const instant = false;
import Link from "next/link";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Fuel,
  Gauge,
  Menu,
  MapPin,
  Settings2,
  ShieldCheck,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// Fonts: next/font downloads them at build time and exposes CSS variables
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});
const body = Figtree({ subsets: ["latin"], variable: "--font-body" });

// Tailwind needs the full class string in the source, so keep it as a const.
const heading = "font-[family-name:var(--font-display)] tracking-tight";
// Outline shown only for keyboard users (accessibility)
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500";

// Formats a number as Indian rupees, e.g. 1250000 -> ₹12,50,000
const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const navLinks = [
  { href: "#new-cars", label: "New cars" },
  { href: "#used-cars", label: "Used cars" },
  { href: "#why-drivex", label: "Why DriveX" },
  { href: "#contact", label: "Contact" },
];

const photos = [
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=80",
];

// Takes the first variant, finds its Lucknow price row, and adds up the
// on-road total (ex-showroom + road tax + insurance + accessories).
// onRoad is null when there's no Lucknow price, so the UI shows "Price on request".
function getLucknowPrice(car: any) {
  const variant = car.car_variants?.[0];
  const price = variant?.car_prices?.find((p: any) => p.city === "Lucknow");
  const onRoad = price
    ? Number(price.ex_showroom_price) +
      Number(price.road_tax) +
      Number(price.insurance) +
      Number(price.accessories)
    : null;
  return { variant, price, onRoad };
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between py-1.5">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-800">{formatPrice(value)}</dd>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ body?: string }>;
}) {
  // In Next 15/16 searchParams is a Promise. Read ?body=SUV from the URL
  const { body: selectedBody } = await searchParams;
  const supabase = await createClient();

  // Query 1: active models, with their variants and prices nested inside
  const { data: modelData, error: modelError } = await supabase
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

  // Query 2: used cars still available, newest first
  const { data: usedData, error: usedError } = await supabase
    .from("used_cars")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  // If a query fails, `data` is null, so fall back to empty lists
  const models = modelData ?? [];
  const usedCars = usedData ?? [];

  // Log errors on the server only when something actually fails
  if (modelError) console.error("NEW CAR QUERY:", modelError.message);
  if (usedError) console.error("USED CAR QUERY:", usedError.message);

  // Body type filter (works without client JS: /?body=SUV)
  // 1) collect the unique body types for the chips
  const bodyTypes = Array.from(
    new Set(models.map((m: any) => m.body_type).filter(Boolean))
  ) as string[];
  // 2) keep only the models that match the selected chip (or all if none)
  const visibleModels = selectedBody
    ? models.filter((m: any) => m.body_type === selectedBody)
    : models;

  // The hero card shows the first model from the database
  const featured: any = models[0];
  const featuredPrice = featured ? getLucknowPrice(featured) : null;

  return (
    <main
      className={`${display.variable} ${body.variable} min-h-screen overflow-x-hidden bg-white font-[family-name:var(--font-body)] text-neutral-900 antialiased`}
    >
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className={`${heading} text-2xl font-extrabold ${focusRing}`}
          >
            DRIVE<span className="text-orange-500">X.</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`transition-colors hover:text-neutral-950 ${focusRing}`}
              >
                {l.label}
              </a>
            ))}
          </div>

          <Link
            href="/book-test-drive"
            className={`hidden rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-orange-400 md:inline-block ${focusRing}`}
          >
            Book a test drive
          </Link>

          {/* Mobile menu, no JS needed */}
          <details className="group relative md:hidden">
            <summary
              aria-label="Toggle menu"
              className={`flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-neutral-200 [&::-webkit-details-marker]:hidden ${focusRing}`}
            >
              <Menu size={20} className="group-open:hidden" />
              <X size={20} className="hidden group-open:block" />
            </summary>

            <div className="absolute right-0 top-14 w-64 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/book-test-drive"
                className="mt-2 block rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-neutral-950"
              >
                Book a test drive
              </Link>
            </div>
          </details>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-neutral-950">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=2000&q=85"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/30 md:bg-gradient-to-r md:from-neutral-950/95 md:via-neutral-950/70 md:to-neutral-950/10" />

        <div className="mx-auto grid max-w-7xl items-end gap-10 px-4 pb-14 pt-20 sm:px-6 sm:pt-28 lg:grid-cols-[1.5fr_1fr] lg:gap-16 lg:px-8 lg:pb-20 lg:pt-36">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-neutral-300">
              <MapPin size={16} className="text-orange-500" />
              Showrooms in Lucknow, Uttar Pradesh
            </p>

            <h1
              className={`${heading} mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl lg:text-7xl`}
            >
              Know your on-road price before you visit.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-300 sm:text-lg">
              Every car on DriveX shows the full Lucknow price: ex-showroom,
              road tax, insurance and accessories. No surprises at the desk.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#new-cars"
                className={`inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-7 py-3.5 font-semibold text-neutral-950 transition-colors hover:bg-orange-400 ${focusRing}`}
              >
                Browse new cars <ArrowRight size={18} />
              </a>
              <a
                href="#used-cars"
                className={`inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white hover:text-neutral-950 ${focusRing}`}
              >
                See used cars
              </a>
            </div>

            <div className="mt-10 flex gap-8 text-white">
              <div>
                <p className={`${heading} text-2xl font-bold`}>3</p>
                <p className="text-sm text-neutral-400">Showrooms</p>
              </div>
              <div className="border-l border-white/20 pl-8">
                <p className={`${heading} text-2xl font-bold`}>2</p>
                <p className="text-sm text-neutral-400">Service centres</p>
              </div>
            </div>
          </div>

          {/* Featured model: real price from your database */}
          {featured && (
            <Link
              href={`/cars/${featured.id}`}
              className={`group block rounded-2xl bg-white p-5 shadow-2xl sm:p-6 lg:justify-self-end lg:w-full lg:max-w-sm ${focusRing}`}
            >
              <div className="aspect-[16/10] overflow-hidden rounded-xl bg-neutral-100">
                <img
                  src={featured.image_url || photos[0]}
                  alt={featured.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-neutral-500">Featured model</p>
                  <h2 className={`${heading} text-xl font-bold`}>
                    {featured.name}
                  </h2>
                </div>
                <ChevronRight className="mt-1 text-neutral-400 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-4 text-sm text-neutral-500">
                On-road price in Lucknow
              </p>
              <p className={`${heading} text-2xl font-bold`}>
                {featuredPrice?.onRoad != null
                  ? formatPrice(featuredPrice.onRoad)
                  : "Price on request"}
              </p>
            </Link>
          )}
        </div>
      </section>

      {/* NEW CARS */}
      <section
        id="new-cars"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      >
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2
              className={`${heading} text-3xl font-bold sm:text-4xl`}
            >
              New cars
            </h2>
            <p className="mt-2 max-w-md text-neutral-600">
              Pick a body type to narrow the list. Prices are for Lucknow.
            </p>
          </div>

          {bodyTypes.length > 0 && (
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              <Link
                href="/#new-cars"
                scroll={false}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  !selectedBody
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-neutral-950"
                } ${focusRing}`}
              >
                All
              </Link>
              {bodyTypes.map((type) => (
                <Link
                  key={type}
                  href={`/?body=${encodeURIComponent(type)}#new-cars`}
                  scroll={false}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedBody === type
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-300 text-neutral-700 hover:border-neutral-950"
                  } ${focusRing}`}
                >
                  {type}
                </Link>
              ))}
            </div>
          )}
        </div>

        {modelError && (
          <p
            role="alert"
            className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            We couldn't load new cars. Check the database connection and
            access policies, then refresh.
          </p>
        )}

        {visibleModels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center sm:p-14">
            <p className="font-semibold">
              {selectedBody
                ? `No ${selectedBody} models right now.`
                : "No new cars listed yet."}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              {selectedBody
                ? "Try another body type or view all cars."
                : "Add active models from the admin dashboard."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {visibleModels.map((car: any, index: number) => {
              // variant = first variant, price = its Lucknow row, onRoad = total
              const { variant, price, onRoad } = getLucknowPrice(car);

              return (
                <article
                  key={car.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow duration-300 hover:shadow-xl motion-reduce:transition-none"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <img
                      // Use the DB image, or a fallback photo if it's missing
                      src={car.image_url || photos[index % photos.length]}
                      alt={car.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    />
                    {car.body_type && (
                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-neutral-800">
                        {car.body_type}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className={`${heading} text-xl font-bold`}>
                      {car.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-neutral-600">
                      {car.description || "Explore this model at DriveX."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
                      <span className="flex items-center gap-2">
                        <Fuel size={16} className="text-neutral-400" />
                        {variant?.fuel_type || "Multiple fuels"}
                      </span>
                      <span className="flex items-center gap-2">
                        <Settings2 size={16} className="text-neutral-400" />
                        {variant?.transmission || "Multiple options"}
                      </span>
                    </div>

                    <div className="mt-5 border-t border-neutral-100 pt-5">
                      <p className="text-sm text-neutral-500">
                        On-road price in Lucknow
                      </p>
                      <p className={`${heading} mt-1 text-2xl font-bold`}>
                        {onRoad !== null
                          ? formatPrice(onRoad)
                          : "Price on request"}
                      </p>

                      {/* <details> gives a click-to-expand breakdown with no JS */}
                      {price ? (
                        <details className="group/price mt-3 text-sm">
                          <summary
                            className={`flex cursor-pointer list-none items-center gap-1 font-medium text-orange-700 [&::-webkit-details-marker]:hidden ${focusRing}`}
                          >
                            See price breakdown
                            <ChevronDown
                              size={16}
                              className="transition-transform group-open/price:rotate-180"
                            />
                          </summary>
                          <dl className="mt-2 divide-y divide-neutral-100">
                            <PriceRow
                              label="Ex-showroom"
                              value={Number(price.ex_showroom_price)}
                            />
                            <PriceRow
                              label="Road tax"
                              value={Number(price.road_tax)}
                            />
                            <PriceRow
                              label="Insurance"
                              value={Number(price.insurance)}
                            />
                            <PriceRow
                              label="Accessories"
                              value={Number(price.accessories)}
                            />
                          </dl>
                          <p className="mt-2 text-xs text-neutral-400">
                            Valid until {price.valid_until}
                          </p>
                        </details>
                      ) : (
                        <p className="mt-2 text-sm text-neutral-500">
                          Contact our sales team for pricing.
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/cars/${car.id}`}
                      className={`mt-auto flex items-center justify-between rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 hover:text-neutral-950 ${focusRing}`}
                    >
                      <span>View details</span>
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* USED CARS */}
      <section
        id="used-cars"
        className="scroll-mt-20 bg-neutral-100 py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className={`${heading} text-3xl font-bold sm:text-4xl`}>
              Certified pre-owned
            </h2>
            <p className="mt-2 max-w-md text-neutral-600">
              Inspected cars with the kilometres and year shown up front.
            </p>
          </div>

          {usedError && (
            <p
              role="alert"
              className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              We couldn't load used cars. Refresh to try again.
            </p>
          )}

          {usedCars.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center sm:p-14">
              <p className="font-semibold">No used cars in stock right now.</p>
              <p className="mt-2 text-sm text-neutral-500">
                New arrivals are added regularly. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {usedCars.map((car: any) => (
                <article
                  key={car.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg motion-reduce:transition-none sm:flex-row"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-neutral-200 sm:aspect-auto sm:w-2/5 sm:shrink-0">
                    <img
                      src={car.image_url || photos[1]}
                      alt={`${car.model_name} used car`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-700">
                      <ShieldCheck size={16} /> Certified
                    </span>
                    <h3 className={`${heading} mt-2 text-xl font-bold`}>
                      {car.model_name} {car.variant_name}
                    </h3>

                    <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <dt className="text-neutral-500">Year</dt>
                        <dd className="font-semibold">
                          {car.manufacturing_year}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">Driven</dt>
                        <dd className="font-semibold">
                          {/* ?? 0 stops a crash if kilometres_driven is null */}
                          {Number(car.kilometres_driven ?? 0).toLocaleString(
                            "en-IN"
                          )}{" "}
                          km
                        </dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">Fuel</dt>
                        <dd className="font-semibold">{car.fuel_type}</dd>
                      </div>
                    </dl>

                    <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                      <p className={`${heading} text-2xl font-bold`}>
                        {formatPrice(Number(car.selling_price))}
                      </p>
                      <Link
                        href={`/used-cars/${car.stock_id}`}
                        className={`inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-950 underline decoration-orange-500 decoration-2 underline-offset-4 hover:text-orange-700 ${focusRing}`}
                      >
                        View vehicle <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY DRIVEX */}
      <section
        id="why-drivex"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div>
            <h2 className={`${heading} text-3xl font-bold sm:text-4xl`}>
              Buying a car, without the guesswork
            </h2>
            <p className="mt-4 max-w-sm text-neutral-600">
              We list the full price, the specs and the next step on every
              page.
            </p>
          </div>

          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {[
              {
                icon: ShieldCheck,
                title: "Clear pricing",
                description:
                  "See ex-showroom, tax, insurance and accessories before you walk in.",
              },
              {
                icon: Gauge,
                title: "Compare variants",
                description:
                  "Check fuel type, transmission and specifications side by side.",
              },
              {
                icon: CalendarDays,
                title: "Book online",
                description:
                  "Choose a showroom and a time for your test drive in a few taps.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-5 py-6 sm:gap-6 sm:py-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className={`${heading} text-lg font-bold`}>
                      {item.title}
                    </h3>
                    <p className="mt-1 max-w-md text-neutral-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TEST DRIVE CTA */}
      <section id="book-test-drive" className="scroll-mt-20 px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl bg-orange-500 px-6 py-12 text-neutral-950 sm:px-12 sm:py-16 md:flex-row md:items-center">
          <div>
            <h2 className={`${heading} text-3xl font-extrabold sm:text-5xl`}>
              Drive it before you decide.
            </h2>
            <p className="mt-3 max-w-md text-neutral-900/80">
              Pick a car and a showroom. We'll have it ready when you arrive.
            </p>
          </div>

          <Link
            href="/book-test-drive"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-8 py-4 font-semibold text-white transition-colors hover:bg-neutral-800 md:w-auto ${focusRing}`}
          >
            Book a test drive <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-neutral-200 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className={`${heading} text-2xl font-extrabold`}>
              DRIVE<span className="text-orange-500">X.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-neutral-600">
              New and certified pre-owned cars in Lucknow, with the full price
              shown upfront.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">Browse</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li><a href="#new-cars" className="hover:text-neutral-950">New cars</a></li>
              <li><a href="#used-cars" className="hover:text-neutral-950">Used cars</a></li>
              <li><Link href="/book-test-drive" className="hover:text-neutral-950">Book a test drive</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Visit us</p>
            <p className="mt-3 text-sm text-neutral-600">
              Lucknow, Uttar Pradesh
            </p>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-7xl border-t border-neutral-200 pt-6 text-sm text-neutral-400">
          © 2026 DriveX. Demonstration dealership platform.
        </p>
      </footer>
    </main>
  );
}
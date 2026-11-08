// Next.js route option (kept from your original file)
export const instant = false;
import Link from "next/link";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { cookies } from "next/headers";
import { getTranslations, type Language } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { connection } from "next/server";
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
// Heading font is selected per language inside Home so Devanagari uses its own font.
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

const photos = [
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=80",
];


type CarPrice = {
  city: string;
  ex_showroom_price: number | string | null;
  road_tax: number | string | null;
  insurance: number | string | null;
  accessories: number | string | null;
  valid_until: string | null;
};

type CarVariant = {
  id: string;
  variant_name: string;
  fuel_type: string | null;
  transmission: string | null;
  car_prices: CarPrice[];
};

type CarModel = {
  id: string;
  name: string;
  description: string | null;
  body_type: string | null;
  image_url: string | null;
  car_variants: CarVariant[];
};

type UsedCar = {
  id: string;
  stock_id: string;
  model_name: string;
  variant_name: string | null;
  manufacturing_year: number | string;
  kilometres_driven: number | string | null;
  fuel_type: string | null;
  selling_price: number | string;
  image_url: string | null;
};

// Takes the first variant, finds its Lucknow price row, and adds up the
// on-road total (ex-showroom + road tax + insurance + accessories).
// onRoad is null when there's no Lucknow price, so the UI shows "Price on request".
function getLucknowPrice(car: CarModel) {
  const variant = car.car_variants?.[0];
  const price = variant?.car_prices?.find((p) => p.city === "Lucknow");
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

export default async function Home(
  
  {
  searchParams,
  
  
}: {
  searchParams: Promise<{ body?: string }>;
}) {
  await connection();
  const { body: selectedBody } = await searchParams;

// Read the buyer's saved language preference
const cookieStore = await cookies();
const language: Language =
  cookieStore.get("drivex-language")?.value === "hi" ? "hi" : "en";

const t = getTranslations(language);
  const heading =
    language === "hi"
      ? "font-[family-name:var(--font-hindi)] tracking-normal"
      : "font-[family-name:var(--font-display)] tracking-tight";
  const translateBodyType = (value: string) =>
    language === "hi" ? ({ SUV: "एसयूवी", Sedan: "सेडान", Hatchback: "हैचबैक" }[value] ?? value) : value;
  const translateFuel = (value: string | null | undefined) =>
    language === "hi" ? ({ Petrol: "पेट्रोल", Diesel: "डीज़ल", Electric: "इलेक्ट्रिक", CNG: "सीएनजी", Hybrid: "हाइब्रिड" }[value ?? ""] ?? value ?? t.notSpecified) : value || t.notSpecified;
  const translateTransmission = (value: string | null | undefined) =>
    language === "hi" ? ({ Automatic: "ऑटोमैटिक", Manual: "मैनुअल" }[value ?? ""] ?? value ?? t.notSpecified) : value || t.notSpecified;

// Navigation labels
const navLinks = [
  { href: "/cars?from=home", label: t.newCars },
  { href: "/used-cars?from=home", label: t.usedCars },
  { href: "#why-drivex", label: t.whyDriveX },
  { href: "#contact", label: t.contact },
];

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
  const models = (modelData ?? []) as CarModel[];
  const usedCars = (usedData ?? []) as UsedCar[];

  // Log errors on the server only when something actually fails
  if (modelError) console.error("NEW CAR QUERY:", modelError.message);
  if (usedError) console.error("USED CAR QUERY:", usedError.message);

  // Body type filter (works without client JS: /?body=SUV)
  // 1) collect the unique body types for the chips
  const bodyTypes = Array.from(
    new Set(models.map((m) => m.body_type).filter((type): type is string => Boolean(type)))
  ) as string[];
  // 2) keep only the models that match the selected chip (or all if none)
  const visibleModels = selectedBody
    ? models.filter((m) => m.body_type === selectedBody)
    : models;

  // The hero card shows the first model from the database
  const featured = models[0];
  const featuredPrice = featured ? getLucknowPrice(featured) : null;

  return (
    <main
      className={`${display.variable} ${body.variable} min-h-screen overflow-x-hidden bg-white font-[family-name:var(--font-body)] text-neutral-900 antialiased`}
      style={{
        fontFamily:
          language === "hi"
            ? "var(--font-hindi), sans-serif"
            : "var(--font-body), sans-serif",
      }}
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
          <div className="hidden md:block">
            <LanguageSwitcher language={language} />
          </div>

          <Link
            href="/book-test-drive?from=home"
            className={`hidden rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-orange-400 md:inline-block ${focusRing}`}
          >
            {t.bookTestDrive}
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
              <div className="px-4 py-3">
              <LanguageSwitcher language={language} />
              </div>
                <Link
                href="/book-test-drive?from=home"
                className="mt-2 block rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-neutral-950"
              >
                {t.bookTestDrive}
              </Link>
            </div>
          </details>
        </div>
      </nav>

     
{/* PREMIUM HERO */}
<section className="relative isolate min-h-[720px] overflow-hidden bg-[#090909] lg:min-h-[780px]">

  {/* Cinematic background */}
  <img
    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=2000&q=90"
    alt="Premium automobile"
    className="absolute inset-0 -z-30 h-full w-full object-cover object-center animate-hero-zoom"
  />

  {/* Dark cinematic overlays */}
  <div className="absolute inset-0 -z-20 bg-black/50" />
  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/75 to-transparent" />
  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-transparent to-black/20" />

  <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:min-h-[780px] lg:grid-cols-[1.25fr_0.75fr] lg:gap-10 lg:px-10">

    {/* Left content */}
    <div className="max-w-3xl">

      <div
        className={`animate-fade-in inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md ${
          language === "hi" ? "tracking-normal" : "uppercase tracking-[0.2em]"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-orange-500" />
        {t.heroEyebrow}
      </div>

      <p className="mt-9 flex items-center gap-2 text-sm font-medium text-neutral-300 animate-fade-in">
        <MapPin size={16} className="text-orange-500" />
        {t.showrooms} · Lucknow, Uttar Pradesh
      </p>

      <h1
        className={`${heading} mt-5 font-extrabold text-white animate-fade-up ${
          language === "hi"
            ? "text-5xl leading-[1.28] sm:text-6xl lg:text-7xl xl:text-7xl"
            : "text-5xl leading-[1.02] sm:text-6xl lg:text-7xl xl:text-8xl"
        }`}
      >
        {t.heroTitleFirst}
        <br />
        <span className="text-orange-500">{t.heroTitleAccent}</span> {t.heroTitleSecond}
        <br />
        {t.heroTitleLast}
      </h1>

      <p className="mt-7 max-w-xl text-base leading-8 text-neutral-300 sm:text-lg">
        {t.heroDescription}
      </p>

      <div className="mt-9 flex flex-col gap-4 sm:flex-row">
        <a
          href="#new-cars"
          className={`group inline-flex items-center justify-center gap-3 rounded-full bg-orange-500 px-8 py-4 font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:shadow-[0_12px_35px_rgba(249,115,22,0.3)] ${focusRing}`}
        >
          {t.exploreVehicles}
          <ArrowRight size={19} className="transition-transform duration-300 group-hover:translate-x-1" />
        </a>

        <Link
          href="/used-cars?from=home"
          className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-black ${focusRing}`}
        >
          {t.explorePreOwned}
          <ChevronRight size={18} />
        </Link>
      </div>

      {/* Dealership highlights */}
      <div className="mt-14 flex flex-wrap gap-8 border-t border-white/20 pt-7 text-white sm:gap-12">
        <div>
          <p className={`${heading} text-3xl font-bold`}>03</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-neutral-400">{t.showrooms}</p>
        </div>

        <div>
          <p className={`${heading} text-3xl font-bold`}>02</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-neutral-400">{t.serviceCentres}</p>
        </div>

        <div>
          <p className={`${heading} text-3xl font-bold`}>100%</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-neutral-400">{t.priceClarity}</p>
        </div>
      </div>
    </div>

    {/* {t.featuredVehicle} card */}
    {featured && (
      <Link
        href={`/cars/${featured.id}`}
        className={`group relative block w-full max-w-md justify-self-center rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-orange-500/60 hover:bg-white/15 lg:justify-self-end animate-float ${focusRing}`}
      >
        <div className="flex items-center justify-between px-2 py-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300">
            {t.featuredVehicle}
          </span>
          <span className="rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
            {t.explore}
          </span>
        </div>

        <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-900">
          <img
            src={featured.image_url || photos[0]}
            alt={featured.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-2 pb-2 pt-5 text-white">
          <div>
            <p className="text-sm text-neutral-400">{t.featuredVehicle}</p>
            <h2 className={`${heading} mt-1 text-2xl font-bold`}>
              {featured.name}
            </h2>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500 text-black transition-transform duration-300 group-hover:rotate-[-45deg]">
            <ArrowRight size={22} />
          </div>
        </div>

        <div className="mx-2 mt-4 border-t border-white/15 pt-4">
          <p className="text-xs uppercase tracking-wider text-neutral-400">
            {t.onRoadPrice} · Lucknow
          </p>
          <p className={`${heading} mt-1 text-2xl font-bold text-white`}>
            {featuredPrice?.onRoad != null
              ? formatPrice(featuredPrice.onRoad)
              : t.priceOnRequest}
          </p>
        </div>
      </Link>
    )}

  </div>

  {/* Bottom scroll indicator */}
  <a
    href="#new-cars"
    aria-label={t.scrollToNewCars}
    className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-orange-500 sm:flex"
  >
    {t.scrollToExplore}
    <ChevronDown size={18} className="animate-bounce" />
  </a>
</section>


     
{/* NEW CARS */}
<section
  id="new-cars"
  className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
>
  {/* Section heading and filters */}
  <div className="mb-12 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-orange-600">
        {t.findPerfectMatch}
      </p>

      <h2 className={`${heading} text-4xl font-extrabold sm:text-5xl`}>
        {t.exploreCollection}
      </h2>

      <p className="mt-3 max-w-md text-base leading-7 text-neutral-500">
        {t.discoverRange}
      </p>
    </div>

    {/* Body type filters */}
    {bodyTypes.length > 0 && (
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <Link
          href="/#new-cars"
          scroll={false}
          className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
            !selectedBody
              ? "border-neutral-950 bg-neutral-950 text-white shadow-lg"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-orange-500 hover:text-orange-600"
          } ${focusRing}`}
        >
          {t.all}
        </Link>

        {bodyTypes.map((type) => (
          <Link
            key={type}
            href={`/?body=${encodeURIComponent(type)}#new-cars`}
            scroll={false}
            className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
              selectedBody === type
                ? "border-neutral-950 bg-neutral-950 text-white shadow-lg"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-orange-500 hover:text-orange-600"
            } ${focusRing}`}
          >
            {translateBodyType(type)}
          </Link>
        ))}
      </div>
    )}
  </div>

  {/* Database error */}
  {modelError && (
    <p
      role="alert"
      className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
    >
      We couldn&apos;t load new cars. Check the database connection and
      access policies, then refresh.
    </p>
  )}

  {/* Empty state or car listings */}
  {visibleModels.length === 0 ? (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center sm:p-16">
      <p className={`${heading} text-2xl font-bold`}>
        {selectedBody
          ? t.noBodyTypeCars.replace("{type}", translateBodyType(selectedBody))
          : t.noNewCars}
      </p>

      <p className="mt-3 text-sm text-neutral-500">
        {selectedBody
          ? t.tryAnotherBodyType
          : t.addActiveModels}
      </p>
    </div>
  ) : (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {visibleModels.map((car, index) => {
        const { variant, price, onRoad } = getLucknowPrice(car);

        return (
          <article
            key={car.id}
            className="group/car stagger-item animate-hover flex flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-500 hover:border-orange-200 hover:shadow-2xl motion-reduce:transition-none"
          >
            {/* Car image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
              <img
                src={car.image_url || photos[index % photos.length]}
                alt={car.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/car:scale-110 motion-reduce:transition-none"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

              {car.body_type && (
                <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/95 px-4 py-1.5 text-xs font-bold text-neutral-800 shadow-sm backdrop-blur">
                  {translateBodyType(car.body_type)}
                </span>
              )}

              <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-black opacity-0 shadow-lg transition-all duration-300 group-hover/car:translate-x-0 group-hover/car:opacity-100">
                <ArrowRight size={19} />
              </div>
            </div>

            {/* Car information */}
            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <div>
                <h3 className={`${heading} text-2xl font-bold`}>
                  {car.name}
                </h3>

                <p className="mt-2 min-h-[2.5rem] text-sm leading-6 text-neutral-500">
                  {car.description || t.exploreModelAtDriveX}
                </p>
              </div>

              {/* Specifications */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-600">
                <span className="flex items-center gap-2">
                  <Fuel size={17} className="text-orange-500" />
                  {variant?.fuel_type ? translateFuel(variant.fuel_type) : t.multipleFuels}
                </span>

                <span className="flex items-center gap-2">
                  <Settings2 size={17} className="text-orange-500" />
                  {variant?.transmission ? translateTransmission(variant.transmission) : t.multipleOptions}
                </span>
              </div>

              {/* Pricing */}
              <div className="mt-6 border-t border-neutral-100 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  {t.onRoadPrice} · Lucknow
                </p>

                <p className={`${heading} mt-2 text-2xl font-bold text-neutral-950`}>
                  {onRoad !== null
                    ? formatPrice(onRoad)
                    : t.priceOnRequest}
                </p>

                {/* Price breakdown */}
                {price ? (
                  <details className="group/price mt-4 text-sm">
                    <summary
                      className={`flex cursor-pointer list-none items-center gap-2 font-semibold text-orange-700 transition-colors hover:text-orange-500 [&::-webkit-details-marker]:hidden ${focusRing}`}
                    >
                      {t.priceBreakdown}

                      <ChevronDown
                        size={16}
                        className="transition-transform duration-300 group-open/price:rotate-180"
                      />
                    </summary>

                    <dl className="mt-3 divide-y divide-neutral-100 rounded-xl bg-neutral-50 px-4">
                      <PriceRow
                        label={t.exShowroom}
                        value={Number(price.ex_showroom_price)}
                      />

                      <PriceRow
                        label={t.roadTax}
                        value={Number(price.road_tax)}
                      />

                      <PriceRow
                        label={t.insurance}
                        value={Number(price.insurance)}
                      />

                      <PriceRow
                        label={t.accessories}
                        value={Number(price.accessories)}
                      />
                    </dl>

                    <p className="mt-2 text-xs text-neutral-400">
                      {t.validUntil} {price.valid_until}
                    </p>
                  </details>
                ) : (
                  <p className="mt-3 text-sm text-neutral-500">
                    {t.contactSalesForPricing}
                  </p>
                )}
              </div>

              {/* Details button */}
              <Link
                href={`/cars/${car.id}`}
                className={`mt-6 flex items-center justify-between rounded-xl bg-neutral-950 px-5 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-500 hover:text-neutral-950 hover:shadow-lg ${focusRing}`}
              >
                <span>{t.exploreVehicle}</span>

                <ChevronRight
                  size={19}
                  className="transition-transform duration-300 group-hover/car:translate-x-1"
                />
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
  className="scroll-mt-20 bg-[#101010] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28"
>
  <div className="mx-auto w-full max-w-7xl">

    {/* Section heading */}
    <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-orange-500">
          {t.usedCollectionEyebrow}
        </p>

        <h2 className={`${heading} text-4xl font-extrabold sm:text-5xl`}>
          {t.preOwnedTitle}
          <br className="hidden sm:block" />
          <span className="text-orange-500"> {t.carefullyChosen}</span>
        </h2>

        <p className="mt-4 max-w-lg text-base leading-7 text-neutral-400">
          {t.usedCollectionDescription}
        </p>
      </div>

      <div className="flex items-center gap-3 text-sm text-neutral-400">
        <span className="h-2 w-2 rounded-full bg-orange-500" />
        {t.availableInventory}
      </div>
    </div>

    {/* Database error */}
    {usedError && (
      <p
        role="alert"
        className="mb-6 rounded-2xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-300"
      >
        {t.usedCarsLoadError}
      </p>
    )}

    {/* Empty state */}
    {usedCars.length === 0 ? (
      <div className="rounded-3xl border border-dashed border-neutral-700 bg-neutral-900 p-12 text-center sm:p-16">
        <h3 className={`${heading} text-2xl font-bold`}>
          {t.noUsedCars}
        </h3>

        <p className="mt-3 text-sm text-neutral-400">
          {t.usedCarsCheckBack}
        </p>
      </div>
    ) : (

      /* Three-column vehicle grid */
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {usedCars.map((car, index) => (
          <article
            key={car.id}
            className="group/car stagger-item animate-hover flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#191919] shadow-lg transition-all duration-500 hover:border-orange-500/40 hover:shadow-2xl motion-reduce:transition-none"
          >
            {/* Vehicle image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-800">
              <img
                src={car.image_url || photos[index % photos.length]}
                alt={`${car.model_name} used car`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/car:scale-110 motion-reduce:transition-none"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/70 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                {t.available}
              </span>

              <span className="absolute bottom-4 right-4 rounded-full bg-orange-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black">
                {t.preOwned}
              </span>
            </div>

            {/* Vehicle details */}
            <div className="flex flex-1 flex-col p-6">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  {t.usedInventory}
                </p>

                <h3 className={`${heading} mt-2 text-2xl font-bold text-white`}>
                  {car.model_name} {car.variant_name}
                </h3>
              </div>

              {/* Specifications */}
              <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/10 py-5">
                <div>
                  <p className="text-xs text-neutral-500">{t.year}</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {car.manufacturing_year}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">{t.driven}</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {Number(car.kilometres_driven ?? 0).toLocaleString("en-IN")} km
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">{t.fuel}</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {translateFuel(car.fuel_type)}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {t.askingPrice}
                </p>

                <p className={`${heading} mt-2 text-2xl font-bold text-white`}>
                  {formatPrice(Number(car.selling_price))}
                </p>
              </div>

              {/* View vehicle */}
              <Link
                href={`/used-cars/${car.stock_id}`}
                className={`mt-6 flex items-center justify-between rounded-xl bg-orange-500 px-5 py-4 text-sm font-bold text-black transition-all duration-300 hover:bg-orange-400 hover:shadow-[0_10px_30px_rgba(249,115,22,0.15)] ${focusRing}`}
              >
                <span>{t.viewVehicle}</span>

                <ArrowRight
                  size={19}
                  className="transition-transform duration-300 group-hover/car:translate-x-1"
                />
              </Link>

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
className="relative scroll-mt-20 overflow-hidden bg-[#f7f7f5] px-4 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-24 lg:pb-12">
  <div className="mx-auto max-w-7xl">

    {/* Section heading */}
    <div className="mb-14 grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
      <div>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-orange-600">
          {t.theDriveXDifference}
        </p>

        <h2 className={`${heading} max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl`}>
          {t.betterWayToFind}
          <span className="text-orange-500"> {t.nextCar}</span>
        </h2>
      </div>

      <p className="max-w-lg text-base leading-8 text-neutral-500 lg:justify-self-end">
        {t.whyDriveXDescription}
      </p>
    </div>

    {/* Feature cards */}
    <div className="grid gap-5 md:grid-cols-3">

      {[
        {
          icon: ShieldCheck,
          number: "01",
          title: t.clearPricing,
          description: t.clearPricingDescription,
          tag: t.noPricingSurprises,
        },
        {
          icon: Gauge,
          number: "02",
          title: t.compareVariants,
          description: t.compareVariantsDescription,
          tag: t.chooseWithConfidence,
        },
        {
          icon: CalendarDays,
          number: "03",
          title: t.bookOnline,
          description: t.bookOnlineDescription,
          tag: t.yourTimeYourChoice,
        },
      ].map((item, index) => {
        const Icon = item.icon;

        return (
          <article
            key={item.title}
            className="stagger-item group relative flex min-h-[290px] flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl sm:p-9"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Decorative number */}
            <span className={`${heading} absolute right-6 top-5 text-6xl font-bold text-neutral-100 transition-colors duration-300 group-hover:text-orange-100`}>
              {item.number}
            </span>

            {/* Icon */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-black">
              <Icon size={25} strokeWidth={1.8} />
            </div>

            {/* Text */}
            <div className="relative mt-9">
              <h3 className={`${heading} text-2xl font-bold text-neutral-950`}>
                {item.title}
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-7 text-neutral-500">
                {item.description}
              </p>
            </div>

            {/* Bottom label */}
            <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {item.tag}
              </span>

              <ArrowRight
                size={19}
                className="text-orange-500 transition-transform duration-300 group-hover:translate-x-2"
              />
            </div>
          </article>
        );
      })}

    </div>

    {/* Bottom statement */}
    <div className="mt-10 flex flex-col justify-between gap-4 border-t border-neutral-200 pt-7 sm:flex-row sm:items-center">
      <p className={`${heading} text-xl font-bold text-neutral-900`}>
        {t.lessGuesswork}
      </p>

      <Link
        href="/book-test-drive?from=home"
        className={`inline-flex items-center gap-2 text-sm font-bold text-orange-600 transition-colors hover:text-orange-700 ${focusRing}`}
      >
        {t.experienceDriveX}
        <ArrowRight size={17} />
      </Link>
    </div>

  </div>
</section>

      {/* TEST DRIVE CTA */}
<section id="book-test-drive" className="scroll-mt-20 bg-[#f7f7f5] px-4 pb-16 pt-0 sm:px-6 sm:pb-20 lg:px-8 lg:pb-20">        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl bg-orange-500 px-6 py-10 text-neutral-950 shadow-xl shadow-orange-950/10 sm:px-12 sm:py-12 md:flex-row md:items-center">
          <div>
            <h2 className={`${heading} text-3xl font-extrabold sm:text-5xl`}>
              {t.driveBeforeDecide}
            </h2>
            <p className="mt-3 max-w-md text-neutral-900/80">
              {t.testDriveDescription}
            </p>
          </div>

          <Link
            href="/book-test-drive?from=home"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-8 py-4 font-semibold text-white transition-colors hover:bg-neutral-800 md:w-auto ${focusRing}`}
          >
            {t.bookTestDrive} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

     
{/* FOOTER */}
<footer
  id="contact"
  className="border-t border-white/10 bg-[#090909] px-4 pb-8 pt-16 text-white sm:px-6 lg:px-8"
>
  <div className="mx-auto max-w-7xl">

    <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">

      {/* Brand */}
      <div>
        <Link
          href="/"
          className={`${heading} inline-block text-3xl font-extrabold ${focusRing}`}
        >
          DRIVE<span className="text-orange-500">X.</span>
        </Link>

        <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-400">
          {t.footerDescription}
        </p>

        <p className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          {t.lessGuesswork}
        </p>
      </div>

      {/* Browse */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-white">
          {t.explore}
        </h3>

        <ul className="mt-5 space-y-4 text-sm text-neutral-400">
          <li>
            <Link
              href="/cars?from=home"
              className="transition-colors hover:text-orange-500"
            >
              {t.newCars}
            </Link>
          </li>

          <li>
            <a
              href="#used-cars"
              className="transition-colors hover:text-orange-500"
            >
              {t.usedCars}
            </a>
          </li>

          <li>
            <a
              href="#why-drivex"
              className="transition-colors hover:text-orange-500"
            >
              {t.whyDriveX}
            </a>
          </li>

          <li>
            <Link
              href="/book-test-drive?from=home"
              className="transition-colors hover:text-orange-500"
            >
              {t.bookTestDrive}
            </Link>
          </li>
        </ul>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-white">
          {t.visitUs}
        </h3>

        <p className="mt-5 flex items-start gap-3 text-sm leading-7 text-neutral-400">
          <MapPin size={18} className="mt-1 shrink-0 text-orange-500" />
          Lucknow, Uttar Pradesh
        </p>
      </div>

    </div>

    {/* Bottom bar */}
    <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center">
      <p className="text-xs text-neutral-500">
        © 2026 DriveX. Demonstration dealership platform.
      </p>

      <a
        href="#"
        className="text-xs font-semibold text-neutral-400 transition-colors hover:text-orange-500"
      >
        {t.backToTop} ↑
      </a>
    </div>

  </div>
</footer>

    </main>
  );
}
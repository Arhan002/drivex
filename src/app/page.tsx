export const instant = false;
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Search,
  CalendarDays,
  ShieldCheck,
  Gauge,
  Fuel,
  Settings2,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default async function Home() {
  const supabase = await createClient();

  // Fetch active new car models and their variants/prices
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

  // Fetch available certified used cars
  const { data: usedData, error: usedError } = await supabase
    .from("used_cars")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  // Temporary fallback for display if the database is unavailable.
  // The UI will show a warning rather than silently pretending
  // these fallback records came from the database.
  const models = modelData ?? [];
  const usedCars = usedData ?? [];
console.log("NEW CAR QUERY:", {
  data: modelData,
  error: modelError?.message,
  details: modelError?.details,
  hint: modelError?.hint,
  code: modelError?.code,
});

console.log("USED CAR QUERY:", {
  data: usedData,
  error: usedError?.message,
  details: usedError?.details,
  hint: usedError?.hint,
  code: usedError?.code,
});
  return (
    <main className="min-h-screen bg-white text-neutral-900">

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">

          <Link href="/" className="text-2xl font-black tracking-tight">
            DRIVE<span className="text-orange-500">X.</span>
          </Link>

          <div className="hidden items-center gap-9 text-sm font-medium text-neutral-600 md:flex">
            <a href="#new-cars" className="hover:text-orange-500">New Cars</a>
            <a href="#used-cars" className="hover:text-orange-500">Used Cars</a>
            <a href="#why-drivex" className="hover:text-orange-500">About Us</a>
            <a href="#contact" className="hover:text-orange-500">Contact</a>
          </div>

          <Link
            href="#test-drive"
            className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Book a Test Drive
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative isolate flex min-h-[570px] items-center overflow-hidden bg-neutral-950">

        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=2000&q=85"
          alt="Premium automobile"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/65 to-black/10" />

        <div className="mx-auto w-full max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-2xl">

            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Your journey starts here
            </span>

            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
              Find the car
              <br />
              that moves
              <br />
              <span className="text-orange-500">you.</span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-neutral-300 md:text-lg">
              Discover your next car with confidence. Explore our collection,
              compare prices and experience your favourite model.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#new-cars"
                className="inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 font-semibold text-white transition hover:bg-orange-600"
              >
                Explore Cars <ArrowRight size={18} />
              </a>

              <a
                href="#used-cars"
                className="rounded-full border border-white/50 px-7 py-4 font-semibold text-white transition hover:bg-white hover:text-black"
              >
                View Used Cars
              </a>
            </div>

            <div className="mt-14 flex flex-wrap gap-8 text-white">
              <div>
                <p className="text-3xl font-bold">03</p>
                <p className="mt-1 text-sm text-neutral-400">Showrooms</p>
              </div>
              <div>
                <p className="text-3xl font-bold">02</p>
                <p className="mt-1 text-sm text-neutral-400">Service centres</p>
              </div>
              <div>
                <p className="text-3xl font-bold">01</p>
                <p className="mt-1 text-sm text-neutral-400">Trusted destination</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* QUICK SEARCH */}
      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-5">
        <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl md:grid-cols-[1fr_1fr_auto] md:items-center md:p-7">

          <div className="flex items-center gap-3">
            <Search className="text-orange-500" />
            <div>
              <p className="text-xs text-neutral-500">I'm looking for</p>
              <p className="font-semibold">Explore all cars</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:border-l md:border-neutral-200 md:pl-6">
            <MapPin className="text-orange-500" />
            <div>
              <p className="text-xs text-neutral-500">Your location</p>
              <p className="font-semibold">Lucknow, Uttar Pradesh</p>
            </div>
          </div>

          <a
            href="#new-cars"
            className="rounded-xl bg-neutral-950 px-8 py-4 text-center font-semibold text-white transition hover:bg-orange-500"
          >
            Find My Car
          </a>

        </div>
      </section>

      {/* NEW CARS */}
      <section id="new-cars" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">

        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Find your match
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Explore new cars
            </h2>
            <p className="mt-3 text-neutral-500">
              Discover our latest models and variants.
            </p>
          </div>

          <span className="text-sm text-neutral-500">
            {models.length} models available
          </span>
        </div>

        {modelError && (
          <p className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Unable to load new cars. Please check the database connection and access policies.
          </p>
        )}

        {models.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
            <p className="font-semibold">No new cars available yet.</p>
            <p className="mt-2 text-sm text-neutral-500">
              Add active models through the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {models.map((car: any, index: number) => {
              const variant = car.car_variants?.[0];
              const price = variant?.car_prices?.find(
                (p: any) => p.city === "Lucknow"
              );

              const onRoadPrice = price
                ? Number(price.ex_showroom_price) +
                  Number(price.road_tax) +
                  Number(price.insurance) +
                  Number(price.accessories)
                : null;

              const photos = [
                "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80",
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80",
                "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=80",
              ];

              return (
                <article
                  key={car.id}
                  className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-56 overflow-hidden bg-neutral-100">
                    <img
                      src={car.image_url || photos[index % photos.length]}
                      alt={car.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-2 text-xs font-bold">
                      NEW ARRIVAL
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{car.name}</h3>
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                        {car.body_type || "Car"}
                      </span>
                    </div>

                    <p className="mt-2 min-h-10 text-sm text-neutral-500">
                      {car.description || "Explore this model at DriveX."}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-4 border-y border-neutral-100 py-4 text-xs text-neutral-600">
                      <span className="flex items-center gap-2">
                        <Fuel size={15} /> {variant?.fuel_type || "Multiple"}
                      </span>
                      <span className="flex items-center gap-2">
                        <Settings2 size={15} /> {variant?.transmission || "Multiple"}
                      </span>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs text-neutral-500">
                        Lucknow on-road price
                      </p>
                      <p className="mt-1 text-2xl font-bold">
                        {onRoadPrice !== null
                          ? formatPrice(onRoadPrice)
                          : "Price on request"}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {price
                          ? `Price valid until ${price.valid_until}. Includes listed charges.`
                          : "Contact our sales team for pricing."}
                      </p>
                    </div>

                    <Link
                      href={`/cars/${car.id}`}
                      className="mt-6 flex items-center justify-between rounded-xl bg-neutral-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-orange-500"
                    >
                      View Details <ChevronRight size={18} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* USED CARS */}
      <section id="used-cars" className="bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">

          <div className="mb-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Drive with confidence
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Certified pre-owned cars
            </h2>
            <p className="mt-3 text-neutral-500">
              Carefully selected vehicles for your next journey.
            </p>
          </div>

          {usedError && (
            <p className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              Unable to load used-car inventory.
            </p>
          )}

          {usedCars.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
              No used cars are currently available.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {usedCars.map((car: any) => (
                <article
                  key={car.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white md:flex-row"
                >
                  <div className="h-56 bg-neutral-200 md:h-auto md:w-2/5">
                    <img
                      src={
                        car.image_url ||
                        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80"
                      }
                      alt={`${car.model_name} used car`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-center p-6">
                    <span className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-500">
                      Certified pre-owned
                    </span>
                    <h3 className="text-xl font-bold">
                      {car.model_name} {car.variant_name}
                    </h3>

                    <p className="mt-3 text-sm text-neutral-500">
                      {car.manufacturing_year} ·
                      {" "}{car.kilometres_driven.toLocaleString("en-IN")} km ·
                      {" "}{car.fuel_type}
                    </p>

                    <p className="mt-5 text-2xl font-bold">
                      {formatPrice(Number(car.selling_price))}
                    </p>

                    <Link
                      href={`/used-cars/${car.stock_id}`}
                      className="mt-5 inline-flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700"
                    >
                      View vehicle <ArrowRight size={17} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY DRIVEX */}
      <section id="why-drivex" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mb-14 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            The DriveX difference
          </p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            A better way to buy your car.
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Trusted dealership",
              description: "Explore vehicles with clear details and transparent pricing.",
            },
            {
              icon: Gauge,
              title: "Find the right fit",
              description: "Compare vehicle specifications and explore available variants.",
            },
            {
              icon: CalendarDays,
              title: "Book with ease",
              description: "Schedule your showroom visit and test drive online.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <Icon size={28} />
                </div>
                <h3 className="mt-6 text-lg font-bold">{item.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-neutral-500">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TEST DRIVE CTA */}
      <section id="test-drive" className="bg-neutral-950 px-5 py-20 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Experience it yourself
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Your next car is waiting.
            </h2>
            <p className="mt-4 text-neutral-400">
              Book a test drive and get one step closer to your next journey.
            </p>
          </div>

          <Link
            href="/test-drive"
            className="inline-flex items-center gap-3 rounded-full bg-orange-500 px-8 py-4 font-semibold transition hover:bg-orange-600"
          >
            Book a Test Drive <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-white px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 border-t border-neutral-200 pt-8 md:flex-row">
          <div>
            <p className="text-xl font-black">
              DRIVE<span className="text-orange-500">X.</span>
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Your journey starts here.
            </p>
          </div>

          <p className="text-sm text-neutral-400">
            © 2026 DriveX. Demonstration dealership platform.
          </p>
        </div>
      </footer>

    </main>
  );
}

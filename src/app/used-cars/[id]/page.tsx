
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import EnquiryForm from "@/components/EnquiryForm";
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  Fuel,
  Gauge,
  CalendarDays,
  Users,
  ShieldCheck,
  MapPin,
  ClipboardCheck,
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
  status: string;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function UsedCarDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
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
  const cookieStore = await cookies();
  const language = cookieStore.get("drivex-language")?.value === "hi" ? "hi" : "en";
  const copy = language === "hi" ? {
    backToUsedCars: "पुरानी कारों पर वापस जाएँ",
    bookTestDrive: "टेस्ट ड्राइव बुक करें",
    preOwned: "ड्राइवएक्स पुरानी कारें",
    available: "पूछताछ के लिए उपलब्ध",
    location: "लखनऊ, उत्तर प्रदेश",
    listedPrice: "सूचीबद्ध बिक्री मूल्य",
    priceNote: "दिखाई गई कीमत स्पष्ट है। अधिक जानकारी के लिए हमारी टीम से संपर्क करें।",
    exploreDetails: "कार की जानकारी देखें",
    specifications: "कार की विशेषताएँ",
    knowVehicle: "अपनी कार को जानें",
    specificationsNote: "इस पुरानी कार की ज़रूरी जानकारी यहाँ साफ़ तौर पर दी गई है।",
    manufacturingYear: "निर्माण वर्ष",
    kilometresDriven: "चलाई गई दूरी",
    fuelType: "ईंधन का प्रकार",
    numberOfOwners: "पिछले मालिकों की संख्या",
    stockId: "स्टॉक आईडी",
    registration: "रजिस्ट्रेशन",
    notDisclosed: "उपलब्ध नहीं",
    vehicleInformation: "कार की जानकारी",
    inspectionNotes: "इंस्पेक्शन विवरण",
    inspectionIntro: "अपना निर्णय लेने से पहले उपलब्ध वाहन निरीक्षण की जानकारी देखें।",
    inspectionReport: "वाहन निरीक्षण रिपोर्ट",
    availableInformation: "उपलब्ध वाहन जानकारी",
    inspectionUnavailable: "निरीक्षण रिपोर्ट अभी उपलब्ध नहीं है। कृपया जानकारी के लिए हमारी टीम से संपर्क करें।",
    exploreMore: "और पुरानी कारें देखें",
    footerBack: "पुरानी कारों पर वापस जाएँ ↑",
    footer: "© 2026 DriveX. डेमो डीलरशिप प्लेटफ़ॉर्म।",
    petrol: "पेट्रोल",
    diesel: "डीज़ल",
    electric: "इलेक्ट्रिक",
    cng: "सीएनजी",
    hybrid: "हाइब्रिड",
  } : {
    backToUsedCars: "Back to Used Cars",
    bookTestDrive: "Book a test drive",
    preOwned: "DriveX Pre-Owned",
    available: "Available for enquiry",
    location: "Lucknow, Uttar Pradesh",
    listedPrice: "Listed selling price",
    priceNote: "Price displayed upfront. Contact our team for more details.",
    exploreDetails: "Explore vehicle details",
    specifications: "Vehicle specifications",
    knowVehicle: "Know your",
    specificationsNote: "Everything you need to know about this pre-owned vehicle, presented clearly.",
    manufacturingYear: "Manufacturing year",
    kilometresDriven: "Kilometres driven",
    fuelType: "Fuel type",
    numberOfOwners: "Number of owners",
    stockId: "Stock ID",
    registration: "Registration",
    notDisclosed: "Not disclosed",
    vehicleInformation: "Vehicle information",
    inspectionNotes: "Inspection",
    inspectionIntro: "Review the available vehicle inspection information before making your decision.",
    inspectionReport: "Vehicle inspection report",
    availableInformation: "Available vehicle information",
    inspectionUnavailable: "Inspection report is currently unavailable. Please contact our team for details.",
    exploreMore: "Explore more used cars",
    footerBack: "Back to used cars ↑",
    footer: "© 2026 DriveX. Demonstration dealership platform.",
    petrol: "Petrol",
    diesel: "Diesel",
    electric: "Electric",
    cng: "CNG",
    hybrid: "Hybrid",
  };
  const supabase = await createClient();

  const { data: car, error } = await supabase
    .from("used_cars")
    .select("*")
    .eq("id", id)
    .eq("status", "available")
    .maybeSingle();

  if (error) {
    console.error("Error fetching used car:", error.message);
    throw new Error("Unable to load vehicle details.");
  }

  if (!car) {
    notFound();
  }

  const vehicle = car as UsedCar;

  const fuelKey = vehicle.fuel_type.toLowerCase();
  const displayedFuel = fuelKey.includes("petrol") ? copy.petrol
    : fuelKey.includes("diesel") ? copy.diesel
    : fuelKey.includes("electric") || fuelKey.includes("ev") ? copy.electric
    : fuelKey.includes("cng") ? copy.cng
    : fuelKey.includes("hybrid") ? copy.hybrid
    : vehicle.fuel_type;


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

  const showrooms = showroomData ?? [];

  // Load the signed-in user's contact details for the enquiry form.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("User lookup error:", userError.message);
  }

  let buyerDetails = null;
  let userRole: string | null = null;

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, phone, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Buyer profile query error:", profileError.message);
    } else {
      buyerDetails = {
        fullName: profile?.full_name ?? user.user_metadata?.full_name ?? "",
        email: user.email ?? "",
        phone: profile?.phone ?? user.user_metadata?.phone ?? "",
      };
      userRole = profile?.role ?? null;
    }
  }

  const specifications = [
    {
      label: copy.manufacturingYear,
      value: vehicle.manufacturing_year,
      icon: CalendarDays,
    },
    {
      label: copy.kilometresDriven,
      value: `${vehicle.kilometres_driven.toLocaleString("en-IN")} km`,
      icon: Gauge,
    },
    {
      label: copy.fuelType,
      value: displayedFuel,
      icon: Fuel,
    },
    {
      label: copy.numberOfOwners,
      value: vehicle.number_of_owners,
      icon: Users,
    },
    {
      label: copy.stockId,
      value: vehicle.stock_id,
      icon: ShieldCheck,
    },
    {
      label: copy.registration,
      value: vehicle.registration_masked || copy.notDisclosed,
      icon: ClipboardCheck,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950" style={language === "hi" ? { fontFamily: "var(--font-hindi), sans-serif" } : undefined}>

      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link
            href={`/used-cars?from=${from}`}
            className="flex items-center gap-2 text-sm font-semibold text-neutral-500 transition hover:text-orange-600"
          >
            <ArrowLeft size={17} />
            {copy.backToUsedCars}
          </Link>

          <Link
            href={backHref}
            className="text-2xl font-extrabold tracking-tight text-neutral-950"
          >
            DRIVE<span className="text-orange-500">X.</span>
          </Link>

          <LanguageSwitcher language={language} />

          <Link
            href={`/book-test-drive?from=${from}`}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-xs font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-lg sm:text-sm"
          >
            {copy.bookTestDrive}
            <ArrowRight size={16} />
          </Link>

        </div>
      </header>

      {/* Premium vehicle hero */}
      <section className="relative isolate overflow-hidden bg-[#090909] px-5 py-14 text-white sm:px-8 lg:py-20">

        <div className="pointer-events-none absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full bg-orange-500/15 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">

          {/* Vehicle image */}
          <div className="motion-safe:animate-fade-in group relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 shadow-2xl">

            <img
              src={
                vehicle.image_url ||
                "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200"
              }
              alt={`${vehicle.model_name} ${vehicle.variant_name}`}
              className="h-[300px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[420px] lg:h-[490px]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
              <CarFront size={16} className="text-orange-500" />
              {copy.preOwned}
            </div>

          </div>

          {/* Vehicle information */}
          <div className="motion-safe:animate-fade-in lg:pl-5">

            <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-500/10 px-4 py-2 text-xs font-bold text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              {copy.available}
            </div>

            <p className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-orange-500">
              <MapPin size={15} />
              {copy.location}
            </p>

            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
              {copy.preOwned} · {vehicle.stock_id}
            </p>

            <h1 className="mt-3 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              {vehicle.model_name}
              <span className="text-orange-500">.</span>
            </h1>

            <p className="mt-3 text-xl text-neutral-400">
              {vehicle.variant_name}
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md sm:p-8">

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                {copy.listedPrice}
              </p>

              <p className="mt-3 text-4xl font-extrabold tracking-tight text-orange-500 sm:text-5xl">
                {formatPrice(Number(vehicle.selling_price))}
              </p>

              <p className="mt-3 text-sm text-neutral-500">
                {copy.priceNote}
              </p>

            </div>

            <Link
              href="#vehicle-overview"
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400 hover:shadow-[0_12px_35px_rgba(249,115,22,0.25)]"
            >
              {copy.exploreDetails}
              <ArrowRight size={18} />
            </Link>

          </div>
        </div>
      </section>

      {/* Vehicle specifications */}
      <section
        id="vehicle-overview"
        className="scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-600">
              {copy.specifications}
            </p>

            <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {copy.knowVehicle} <span className="text-orange-500">{language === "hi" ? "कार।" : "vehicle."}</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-500">
              {copy.specificationsNote}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {specifications.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl motion-safe:animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white">
                    <Icon size={22} />
                  </div>

                  <p className="mt-6 text-sm text-neutral-500">
                    {item.label}
                  </p>

                  <p className="mt-2 break-words text-xl font-bold text-neutral-950">
                    {item.value}
                  </p>

                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* Inspection information */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:py-20">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-600">
                {copy.vehicleInformation}
              </p>

              <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
                {copy.inspectionNotes} <span className="text-orange-500">{language === "hi" ? "विवरण।" : "notes."}</span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-neutral-500">
                {copy.inspectionIntro}
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-[#f8f8f6] p-7 shadow-sm sm:p-9">

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <ShieldCheck size={23} />
                </div>

                <div>
                  <h3 className="text-lg font-bold">
                    {copy.inspectionReport}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {copy.availableInformation}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-neutral-200 pt-6">
                <p className="whitespace-pre-wrap text-sm leading-8 text-neutral-600">
                  {vehicle.inspection_report ||
                    copy.inspectionUnavailable}
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Customer enquiry form */}
<section
  id="enquiry"
  className="bg-[#f7f7f5] px-5 py-16 sm:px-8 lg:py-20"
>
  <div className="mx-auto max-w-5xl">
    <EnquiryForm
      source="used_car"
      showrooms={showrooms}
      buyerDetails={buyerDetails}
      userRole={userRole}
    />

    <div className="mt-8 text-center">
      <Link
        href={`/used-cars?from=${from}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
      >
        <ArrowLeft size={16} />
        {copy.exploreMore}
      </Link>
    </div>
  </div>
</section>
      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#090909] px-5 py-9 text-white sm:px-8">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <Link
            href={backHref}
            className="text-2xl font-extrabold tracking-tight"
          >
            DRIVE<span className="text-orange-500">X.</span>
          </Link>

          <p className="text-xs text-neutral-500">
            {copy.footer}
          </p>

          <Link
            href={`/used-cars?from=${from}`}
            className="text-sm font-semibold text-neutral-400 transition hover:text-orange-500"
          >
            {copy.footerBack}
          </Link>

        </div>
      </footer>

    </main>
  );
}

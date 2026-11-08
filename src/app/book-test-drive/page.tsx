"use client";
import { createClient } from "@/lib/supabase/client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Mail,
} from "lucide-react";


type Language = "en" | "hi";

const copy = {
  en: {
    step: "Step", backBuyer: "Back to buyer dashboard", backDashboard: "Back to dashboard", backHome: "Back to home",
    experience: "DriveX Experience", title: "Book a test drive",
    intro: "Choose a showroom, pick a car, and tell us when suits you. It only takes a minute.",
    showroom: "Choose your showroom", selectShowroom: "Select showroom",
    vehicle: "Choose your vehicle", selectVehicle: "Select demo vehicle", pickShowroom: "Pick a showroom first",
    car: "Car", variant: "Variant", dateTime: "Pick a date and time", date: "Date", time: "Time",
    contact: "Your contact details", fullName: "Full name", email: "Email address", phone: "10-digit phone number",
    consent: "I agree to be contacted by DriveX regarding this test-drive booking and acknowledge the privacy notice.",
    submitting: "Submitting...", confirm: "Confirm test drive", viewDashboard: "View your dashboard",
    whatToExpect: "What to expect", expect1: "Pick a showroom and the car you want to drive.",
    expect2: "Choose a date and time that works for you.", expect3: "Our team contacts you to confirm the booking.",
    needHelp: "Need help?", helpText: "If a showroom or car is missing from the list, it may not be available for test drives right now. Try another option.",
    loading: "Loading test drive booking...", loadError: "Unable to load booking options.",
    loadOptionsError: "Unable to load options.", pastDate: "Please select today or a future date.",
    bookingFailed: "Booking failed.", unexpected: "Something went wrong. Please try again.",
    bookingSuccess: "Booking successful! Booking ID:", language: "Language",
  },
  hi: {
    step: "चरण", backBuyer: "खरीदार डैशबोर्ड पर वापस जाएँ", backDashboard: "डैशबोर्ड पर वापस जाएँ", backHome: "होम पर वापस जाएँ",
    experience: "DriveX अनुभव", title: "टेस्ट ड्राइव बुक करें",
    intro: "शोरूम चुनें, अपनी पसंद की कार चुनें और अपनी सुविधानुसार समय बताएँ। इसमें केवल एक मिनट लगेगा।",
    showroom: "अपना शोरूम चुनें", selectShowroom: "शोरूम चुनें",
    vehicle: "अपनी कार चुनें", selectVehicle: "डेमो कार चुनें", pickShowroom: "पहले शोरूम चुनें",
    car: "कार", variant: "वेरिएंट", dateTime: "तारीख और समय चुनें", date: "तारीख", time: "समय",
    contact: "आपकी संपर्क जानकारी", fullName: "पूरा नाम", email: "ईमेल पता", phone: "10 अंकों का फ़ोन नंबर",
    consent: "मैं इस टेस्ट ड्राइव बुकिंग के संबंध में DriveX से संपर्क किए जाने की सहमति देता/देती हूँ और गोपनीयता सूचना को स्वीकार करता/करती हूँ।",
    submitting: "जमा किया जा रहा है...", confirm: "टेस्ट ड्राइव की पुष्टि करें", viewDashboard: "अपना डैशबोर्ड देखें",
    whatToExpect: "आगे क्या होगा", expect1: "शोरूम और वह कार चुनें जिसे आप चलाना चाहते हैं।",
    expect2: "अपनी सुविधानुसार तारीख और समय चुनें।", expect3: "बुकिंग की पुष्टि के लिए हमारी टीम आपसे संपर्क करेगी।",
    needHelp: "मदद चाहिए?", helpText: "यदि सूची में कोई शोरूम या कार दिखाई नहीं दे रही है, तो संभव है कि वह अभी टेस्ट ड्राइव के लिए उपलब्ध न हो। कोई दूसरा विकल्प चुनें।",
    loading: "टेस्ट ड्राइव बुकिंग लोड हो रही है...", loadError: "बुकिंग विकल्प लोड नहीं हो सके।",
    loadOptionsError: "विकल्प लोड नहीं हो सके।", pastDate: "कृपया आज या भविष्य की तारीख चुनें।",
    bookingFailed: "बुकिंग नहीं हो सकी।", unexpected: "कुछ गलत हो गया। कृपया फिर से कोशिश करें।",
    bookingSuccess: "बुकिंग सफल! बुकिंग आईडी:", language: "भाषा",
  },
} as const;


type Showroom = {
  id: string;
  name: string;
  city: string;
  address: string;
};

type DemoVehicle = {
  id: string;
  showroom_id: string;
  variant_id: string;
  car_variants: {
    variant_name: string;
    car_models: {
      name: string;
    };
  };
};

// Shared input style so every field looks the same
const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/15 disabled:cursor-not-allowed disabled:opacity-60";

// Step heading with a number badge
function StepHeader({
  step,
  title,
  icon: Icon,
  language,
}: {
  step: number;
  title: string;
  icon: React.ElementType;
  language: Language;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          {copy[language].step} {step}
        </p>
        <h2 className="text-lg font-bold text-neutral-950">{title}</h2>
      </div>
    </div>
  );
}

function BookTestDriveContent() {
  const [language, setLanguage] = useState<Language>("en");
  const t = copy[language];
  const searchParams = useSearchParams();
  const source = searchParams.get("from");
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
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [vehicles, setVehicles] = useState<DemoVehicle[]>([]);

  const [showroomId, setShowroomId] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [today, setToday] = useState("");

  const [buyerName, setBuyerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isAuthenticatedBuyer, setIsAuthenticatedBuyer] = useState(false);

  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )drivex-language=(en|hi)(?:;|$)/);
    setLanguage(match?.[1] === "hi" ? "hi" : "en");
  }, []);

  function changeLanguage(nextLanguage: Language) {
    document.cookie = `drivex-language=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
    setLanguage(nextLanguage);
  }



  // Load the current local date and booking options after mounting.
  useEffect(() => {
  async function loadOptions() {
    try {
      const response = await fetch("/api/booking-options");

      const now = new Date();
      const localDate = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("-");

      setToday(localDate);

      if (!response.ok) {
        throw new Error(t.loadError);
      }

      const data = await response.json();

      setShowrooms(data.showrooms ?? []);
      setVehicles(data.vehicles ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : t.loadOptionsError
      );
    }
  }

  void loadOptions();
}, []);

  // Automatically fill contact details for logged-in buyers.
  useEffect(() => {
    async function loadBuyerDetails() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) return;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, phone, role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Unable to load buyer profile:", profileError);
          return;
        }

        if (profile?.role?.trim().toLowerCase() !== "buyer") return;

        setIsAuthenticatedBuyer(true);
        setBuyerName(
          profile.full_name || user.user_metadata?.full_name || ""
        );
        setEmail(user.email || "");
        setPhone(profile.phone || user.user_metadata?.phone || "");
      } catch (error) {
        console.error("Unable to load buyer details:", error);
      }
    }

    void loadBuyerDetails();
  }, []);

  // Show only vehicles available at the selected showroom.
  const filteredVehicles = vehicles.filter(
    (vehicle) => vehicle.showroom_id === showroomId
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      // Prevent past dates.
      if (date < today) {
        throw new Error(t.pastDate);
      }

      const scheduledAt = new Date(
        `${date}T${time}`
      ).toISOString();

      // Submit booking to the existing API.
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerName,
          email,
          phone,
          showroomId,
          demoVehicleId: vehicleId,
          scheduledAt,
          consentGiven: consent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || t.bookingFailed
        );
      }

      setIsSuccess(true);
      setMessage(
        `${t.bookingSuccess} ${result.booking.booking_id}`
      );

      // Keep authenticated buyers' contact details for their next booking.
      // Clear contact details only for guests.
      if (!isAuthenticatedBuyer) {
        setBuyerName("");
        setEmail("");
        setPhone("");
      }

      setShowroomId("");
      setVehicleId("");
      setDate("");
      setTime("");
      setConsent(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : t.unexpected
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900" style={language === "hi" ? { fontFamily: "var(--font-hindi), sans-serif" } : undefined}>
      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href={backHref}
            className="text-xl font-extrabold tracking-tight"
          >
            DRIVE<span className="text-orange-500">X.</span>
          </Link>
          <Link
  href={backHref}
  className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
>
  <ArrowLeft size={16} />
  {from === "buyer" ? "Back to buyer dashboard" : from === "dashboard" ? "Back to dashboard" : "Back to home"}
</Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
        {/* Page heading */}
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
            {t.experience}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
            {t.title}
          </h1>
          <p className="mt-4 text-neutral-600">
            {t.intro}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Booking form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-200/70 sm:p-8 md:p-10"
          >
            {/* Showroom and vehicle */}
            <section>
              <StepHeader step={1} title={t.showroom} language={language} icon={MapPin} />
              <select
                required
                value={showroomId}
                onChange={(e) => {
                  setShowroomId(e.target.value);
                  setVehicleId("");
                }}
                className={inputClass}
              >
                <option value="">{t.selectShowroom}</option>
                {showrooms.map((showroom) => (
                  <option key={showroom.id} value={showroom.id}>
                    {showroom.name} – {showroom.city}
                  </option>
                ))}
              </select>
            </section>

            <section>
              <StepHeader step={2} title={t.vehicle} language={language} icon={CarFront} />
              <select
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={!showroomId}
                className={inputClass}
              >
              <option value="">
        {showroomId
          ? t.selectVehicle
          : t.pickShowroom}
      </option>
                {filteredVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.car_variants?.car_models?.name ?? t.car} –{" "}
                    {vehicle.car_variants?.variant_name ?? t.variant}
                  </option>
                ))}
              </select>
            </section>

            {/* Date and time */}
            <section>
              <StepHeader step={3} title={t.dateTime} language={language} icon={CalendarDays} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="date"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    {t.date}
                  </label>
                  <input
                    id="date"
                    type="date"
                    required
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="time"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    {t.time}
                  </label>
                  <div className="relative">
                    <Clock
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                      id="time"
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Customer details */}
            <section>
              <StepHeader step={4} title={t.contact} language={language} icon={User} />
              <div className="space-y-4">
                <div className="relative">
                  <User
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder={t.fullName}
                    aria-label={t.fullName}
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.email}
                    aria-label={t.email}
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <div className="relative">
                  <Phone
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    required
                    type="tel"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phone}
                    aria-label={t.phone}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </section>

            {/* Consent */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-600 ring-1 ring-neutral-200 transition hover:ring-neutral-300">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                className="mt-1 h-4 w-4 shrink-0 accent-orange-500"
              />
              <span>
                {t.consent}
              </span>
            </label>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading || !today}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-4 text-base font-semibold text-neutral-950 shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:bg-orange-400 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none"
              >
                {loading ? t.submitting : t.confirm}
                {!loading && (
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>

              {/* Response message */}
              {message && (
                <div
                  role="status"
                  className={`mt-5 flex items-start gap-3 break-words rounded-2xl p-4 text-sm font-medium ${
                    isSuccess
                      ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                      : "bg-red-50 text-red-700 ring-1 ring-red-200"
                  }`}
                >
                  {isSuccess && (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  )}
                  <span>
                    {message}
                    {isSuccess && from === "buyer" && (
                      <>
                        {" "}
                        <Link
                          href="/buyer/dashboard"
                          className="font-bold underline underline-offset-2"
                        >
                          {t.viewDashboard}
                        </Link>
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </form>

          {/* Side panel */}
          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl bg-neutral-950 p-7 text-white shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
                {t.whatToExpect}
              </p>
              <ul className="mt-5 space-y-4 text-sm text-neutral-300">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-neutral-950">
                    1
                  </span>
                  {t.expect1}
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-neutral-950">
                    2
                  </span>
                  {t.expect2}
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-neutral-950">
                    3
                  </span>
                  {t.expect3}
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-neutral-200/70">
              <p className="text-sm font-semibold text-neutral-950">
                {t.needHelp}
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {t.helpText}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// Keep useSearchParams inside a Suspense boundary during prerendering.
export default function BookTestDrivePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-neutral-100 text-neutral-600">
          {copy.en.loading}
        </main>
      }
    >
      <BookTestDriveContent />
    </Suspense>
  );
}

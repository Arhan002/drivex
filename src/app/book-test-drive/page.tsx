"use client";
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
}: {
  step: number;
  title: string;
  icon: React.ElementType;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          Step {step}
        </p>
        <h2 className="text-lg font-bold text-neutral-950">{title}</h2>
      </div>
    </div>
  );
}

function BookTestDriveContent() {
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

  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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
        throw new Error("Unable to load booking options.");
      }

      const data = await response.json();

      setShowrooms(data.showrooms ?? []);
      setVehicles(data.vehicles ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load options."
      );
    }
  }

  void loadOptions();
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
        throw new Error("Please select today or a future date.");
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
          result.error || "Booking failed."
        );
      }

      setIsSuccess(true);
      setMessage(
        `Booking successful! Booking ID: ${result.booking.booking_id}`
      );

      // Reset form after successful booking.
      setBuyerName("");
      setEmail("");
      setPhone("");
      setShowroomId("");
      setVehicleId("");
      setDate("");
      setTime("");
      setConsent(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
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
            DriveX Experience
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Book a test drive
          </h1>
          <p className="mt-4 text-neutral-600">
            Choose a showroom, pick a car, and tell us when suits you. It only
            takes a minute.
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
              <StepHeader step={1} title="Choose your showroom" icon={MapPin} />
              <select
                required
                value={showroomId}
                onChange={(e) => {
                  setShowroomId(e.target.value);
                  setVehicleId("");
                }}
                className={inputClass}
              >
                <option value="">Select showroom</option>
                {showrooms.map((showroom) => (
                  <option key={showroom.id} value={showroom.id}>
                    {showroom.name} – {showroom.city}
                  </option>
                ))}
              </select>
            </section>

            <section>
              <StepHeader step={2} title="Choose your vehicle" icon={CarFront} />
              <select
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={!showroomId}
                className={inputClass}
              >
                <option value="">
                  {showroomId
                    ? "Select demo vehicle"
                    : "Pick a showroom first"}
                </option>
                {filteredVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.car_variants?.car_models?.name ?? "Car"} –{" "}
                    {vehicle.car_variants?.variant_name ?? "Variant"}
                  </option>
                ))}
              </select>
            </section>

            {/* Date and time */}
            <section>
              <StepHeader step={3} title="Pick a date and time" icon={CalendarDays} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="date"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    Date
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
                    Time
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
              <StepHeader step={4} title="Your contact details" icon={User} />
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
                    placeholder="Full name"
                    aria-label="Full name"
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
                    placeholder="Email address"
                    aria-label="Email address"
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
                    placeholder="10-digit phone number"
                    aria-label="10-digit phone number"
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
                I agree to be contacted by DriveX regarding this test-drive
                booking and acknowledge the privacy notice.
              </span>
            </label>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading || !today}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-4 text-base font-semibold text-neutral-950 shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:bg-orange-400 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none"
              >
                {loading ? "Submitting..." : "Confirm test drive"}
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
                          View your dashboard
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
                What to expect
              </p>
              <ul className="mt-5 space-y-4 text-sm text-neutral-300">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-neutral-950">
                    1
                  </span>
                  Pick a showroom and the car you want to drive.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-neutral-950">
                    2
                  </span>
                  Choose a date and time that works for you.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-neutral-950">
                    3
                  </span>
                  Our team contacts you to confirm the booking.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-neutral-200/70">
              <p className="text-sm font-semibold text-neutral-950">
                Need help?
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                If a showroom or car is missing from the list, it may not be
                available for test drives right now. Try another option.
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
          Loading test drive booking...
        </main>
      }
    >
      <BookTestDriveContent />
    </Suspense>
  );
}

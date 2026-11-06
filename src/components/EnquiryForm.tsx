
"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Fuel,
  Settings2,
  Wallet,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

type Showroom = {
  id: string;
  name: string;
  city: string;
};

type CarModel = {
  id: string;
  name: string;
};

type EnquiryFormProps = {
  source: "new_car" | "used_car";
  modelId?: string;
  showrooms: Showroom[];
  models?: CarModel[];
};

export default function EnquiryForm({
  source,
  modelId,
  showrooms,
  models=[],
}: EnquiryFormProps) {
  const [buyerName, setBuyerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showroomId, setShowroomId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(modelId || "");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fuelPreference, setFuelPreference] = useState("");
  const [transmissionPreference, setTransmissionPreference] = useState("");
  const [budget, setBudget] = useState("");
  const [purchaseTimeline, setPurchaseTimeline] = useState("");

  const inputStyle =
    "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-300 hover:border-neutral-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60";

  const labelStyle =
    "mb-2 block text-sm font-semibold text-neutral-700";

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerName,
          email,
          phone,
          showroomId,
          modelId:
  source === "new_car"
    ? selectedModelId || null
    : modelId || null,
          source,
          fuelPreference,
          transmissionPreference,
          budget,
          purchaseTimeline,
          consentGiven: consent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Enquiry submission failed.");
      }

      setMessage(
        `Enquiry submitted successfully! Reference: ${result.enquiry.enquiry_id}`
      );

      setBuyerName("");
      setEmail("");
      setPhone("");
      setShowroomId("");
      setConsent(false);
      setFuelPreference("");
      setTransmissionPreference("");
      setBudget("");
      setPurchaseTimeline("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-[#f7f7f5] px-4 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">

        {/* Keep the generic enquiry banner for used cars.
            New car details already display a model-specific enquiry banner. */}
        {source === "used_car" && (
          <div className="mb-10 overflow-hidden rounded-[2rem] bg-[#090909] p-8 text-white shadow-xl sm:p-12">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
                  <Sparkles size={15} />
                  Your next step
                </p>

                <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
                  Interested in this car
                  <span className="text-orange-500">?</span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
                  Tell us what you&apos;re looking for. Our dealership team
                  will help you with pricing, availability and the next steps.
                </p>
              </div>

              <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-orange-400 md:flex">
                <User size={36} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="stagger-item rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-500 hover:shadow-xl sm:p-8 lg:p-12">

          <div className="mb-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              Enquiry form
            </p>

            <h3 className="mt-2 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
              Let&apos;s get to know you.
            </h3>

            <p className="mt-2 text-sm text-neutral-500">
              Share your details and we&apos;ll get in touch with you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-9">

            {/* Personal information */}
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <User size={19} />
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900">
                    Personal information
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Your contact details
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelStyle}>Full name</label>
                  <input
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Enter your full name"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Email address</label>
                  <div className="relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`${inputStyle} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Phone number</label>
                  <div className="relative">
                    <Phone
                      size={17}
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
                      className={`${inputStyle} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Preferred showroom</label>
                  <div className="relative">
                    <MapPin
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <select
                      required
                      value={showroomId}
                      onChange={(e) => setShowroomId(e.target.value)}
                      className={`${inputStyle} pl-11`}
                    >
                      <option value="">Choose a showroom</option>
                      {showrooms.map((showroom) => (
                        <option key={showroom.id} value={showroom.id}>
                          {showroom.name} – {showroom.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {showrooms.length === 0 && (
                <p className="mt-3 text-sm text-red-600">
                  No showrooms are currently available. Please contact our team.
                </p>
              )}
            </div>

            <div className="border-t border-neutral-100" />
{source === "new_car" && (
  <div>
    <label
      htmlFor="carModel"
      className="mb-2 block text-sm font-semibold text-neutral-700"
    >
      Interested Car Model (Optional)
    </label>

    <select
      id="carModel"
      value={selectedModelId}
      onChange={(e) => setSelectedModelId(e.target.value)}
      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
    >
      <option value="">Not decided yet</option>

      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  </div>
)}
            {/* Preferences */}
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Settings2 size={19} />
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900">
                    Your preferences
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Help us understand what you&apos;re looking for
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelStyle}>
                    <span className="inline-flex items-center gap-2">
                      <Fuel size={15} className="text-orange-600" />
                      Fuel preference
                    </span>
                  </label>

                  <select
                    value={fuelPreference}
                    onChange={(e) => setFuelPreference(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">Select fuel type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>
                    <span className="inline-flex items-center gap-2">
                      <Settings2 size={15} className="text-orange-600" />
                      Transmission
                    </span>
                  </label>

                  <select
                    value={transmissionPreference}
                    onChange={(e) => setTransmissionPreference(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">Select transmission</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="No preference">No preference</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>
                    <span className="inline-flex items-center gap-2">
                      <Wallet size={15} className="text-orange-600" />
                      Budget
                    </span>
                  </label>

                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">Select your budget</option>
                    <option value="Under ₹5 lakh">Under ₹5 lakh</option>
                    <option value="₹5–10 lakh">₹5–10 lakh</option>
                    <option value="₹10–15 lakh">₹10–15 lakh</option>
                    <option value="₹15–25 lakh">₹15–25 lakh</option>
                    <option value="Above ₹25 lakh">Above ₹25 lakh</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={15} className="text-orange-600" />
                      Purchase timeline
                    </span>
                  </label>

                  <select
                    value={purchaseTimeline}
                    onChange={(e) => setPurchaseTimeline(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">When are you planning to buy?</option>
                    <option value="Immediately">Immediately</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="1–3 months">1–3 months</option>
                    <option value="3–6 months">3–6 months</option>
                    <option value="Just exploring">Just exploring</option>
                  </select>
                </div>
              </div>

              <p className="mt-4 text-xs text-neutral-400">
                These preferences are optional.
              </p>
            </div>

            <div className="border-t border-neutral-100" />

            {/* Consent */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-600 transition hover:bg-orange-50/60">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-orange-600"
              />
              <span>
                I agree to be contacted by DriveX regarding my enquiry.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || showrooms.length === 0}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-orange-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? "Submitting your enquiry..." : "Submit enquiry"}

              {!loading && (
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>

            {/* Response message */}
            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-medium ${
                  message.startsWith("Enquiry submitted successfully!")
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.startsWith("Enquiry submitted successfully!") && (
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                )}

                <span className="break-all">{message}</span>
              </div>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Your information will be used by the DriveX dealership team to
          respond to your enquiry.
        </p>
      </div>
    </section>
  );
}
 
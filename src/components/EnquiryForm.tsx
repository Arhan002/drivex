
"use client";

import { useEffect, useState } from "react";

type Showroom = {
  id: string;
  name: string;
  city: string;
};

type EnquiryFormProps = {
  source: "new_car" | "used_car";
  modelId?: string;
};

export default function EnquiryForm({
  source,
  modelId,
}: EnquiryFormProps) {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [buyerName, setBuyerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showroomId, setShowroomId] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fuelPreference, setFuelPreference] = useState("");
const [transmissionPreference, setTransmissionPreference] = useState("");
const [budget, setBudget] = useState("");
const [purchaseTimeline, setPurchaseTimeline] = useState("");

  useEffect(() => {
    async function loadShowrooms() {
      try {
        const response = await fetch("/api/booking-options");

        if (!response.ok) {
          throw new Error("Unable to load showrooms.");
        }

        const data = await response.json();
        console.log("API response:", data);
console.log("Showrooms:", data.showrooms);
        setShowrooms(data.showrooms ?? []);
      } catch {
        setMessage("Unable to load showrooms. Please refresh the page.");
      }
    }

    loadShowrooms();
  }, []);

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
          modelId,
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

  const inputStyle =
    "w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm md:p-8">
      <h2 className="text-2xl font-bold text-gray-900">
        Interested in this car?
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Submit your details and our sales team will contact you.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          required
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Full name"
          className={inputStyle}
        />

        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className={inputStyle}
        />

        <input
          required
          type="tel"
          pattern="[0-9]{10}"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="10-digit phone number"
          className={inputStyle}
        />

        <select
          required
          value={showroomId}
          onChange={(e) => setShowroomId(e.target.value)}
          className={`${inputStyle} ${
            showroomId ? "text-gray-900" : "text-gray-500"
          }`}
        >
          <option value="">Choose preferred showroom</option>

          {showrooms.map((showroom) => (
            <option
              key={showroom.id}
              value={showroom.id}
              className="text-gray-900"
            >
              {showroom.name} – {showroom.city}
            </option>
          ))}
        </select>

        {/* Buyer Preferences */}
        <div className="border-t border-gray-200 pt-5">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            Your Preferences
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Help our sales team understand your requirements. All fields are optional.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Fuel Preference
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Transmission Preference
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Budget
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Purchase Timeline
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
        </div>

        <label className="flex items-start gap-3 text-sm leading-6 text-gray-700">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 accent-orange-600"
          />

          <span>
            I agree to be contacted by DriveX regarding my enquiry.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Enquiry"}
        </button>

        {message && (
          <p
            role="status"
            className="break-all text-sm font-medium text-gray-800"
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

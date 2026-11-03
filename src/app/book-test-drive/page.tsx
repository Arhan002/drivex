
"use client";

import { useEffect, useState } from "react";

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

export default function BookTestDrivePage() {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [vehicles, setVehicles] = useState<DemoVehicle[]>([]);
  const [showroomId, setShowroomId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const response = await fetch("/api/booking-options");

        if (!response.ok) {
          throw new Error("Unable to load booking options.");
        }

        const data = await response.json();
        setShowrooms(data.showrooms ?? []);
        setVehicles(data.vehicles ?? []);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to load options."
        );
      }
    }

    loadOptions();
  }, []);

  const filteredVehicles = vehicles.filter(
    (vehicle) => vehicle.showroom_id === showroomId
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(result.error || "Booking failed.");
      }

      setMessage(
        `Booking successful! Booking ID: ${result.booking.booking_id}`
      );

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
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] px-6 py-12 text-[#202020] md:px-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
          DriveX Experience
        </p>

        <h1 className="mt-3 text-4xl font-bold">Book a test drive</h1>

        <p className="mt-3 text-gray-500">
          Choose your preferred showroom, vehicle and time.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10"
        >
          <section className="space-y-4">
            <h2 className="text-xl font-bold">1. Choose your showroom</h2>

            <select
              required
              value={showroomId}
              onChange={(e) => {
                setShowroomId(e.target.value);
                setVehicleId("");
              }}
              className="w-full rounded-lg border border-gray-300 p-3"
            >
              <option value="">Select showroom</option>
              {showrooms.map((showroom) => (
                <option key={showroom.id} value={showroom.id}>
                  {showroom.name} – {showroom.city}
                </option>
              ))}
            </select>

            <h2 className="pt-3 text-xl font-bold">2. Choose your vehicle</h2>

            <select
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              disabled={!showroomId}
              className="w-full rounded-lg border border-gray-300 p-3 disabled:bg-gray-100"
            >
              <option value="">Select demo vehicle</option>
              {filteredVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.car_variants?.car_models?.name ?? "Car"} –{" "}
                  {vehicle.car_variants?.variant_name ?? "Variant"}
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">3. Select date and time</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="date"
                required
                min={new Date().toLocaleDateString("en-CA")}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3"
              />

              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">4. Your contact details</h2>

            <input
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-gray-300 p-3"
            />

            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-lg border border-gray-300 p-3"
            />

            <input
              required
              type="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit phone number"
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </section>

          <label className="flex items-start gap-3 text-sm leading-6 text-gray-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              className="mt-1"
            />
            I agree to be contacted by DriveX regarding this test-drive
            booking and acknowledge the privacy notice.
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 px-6 py-4 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Confirm Test Drive"}
          </button>

          {message && (
            <p role="status" className="break-words text-sm font-medium">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

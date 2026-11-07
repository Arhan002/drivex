
"use client";

import { useState } from "react";

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

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

export default function UsedCarManagement({
  initialCars,
}: {
  initialCars: UsedCar[];
}) {
  const [cars] = useState(initialCars);

  const [id, setId] = useState("");
  const [stockId, setStockId] = useState("");
  const [modelName, setModelName] = useState("");
  const [variantName, setVariantName] = useState("");
  const [fuelType, setFuelType] = useState("Petrol");
  const [year, setYear] = useState("");
  const [kilometres, setKilometres] = useState("");
  const [owners, setOwners] = useState("1");
  const [registration, setRegistration] = useState("");
  const [price, setPrice] = useState("");
  const [inspection, setInspection] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("available");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isEditing = Boolean(id);

  function resetForm() {
    setId("");
    setStockId("");
    setModelName("");
    setVariantName("");
    setFuelType("Petrol");
    setYear("");
    setKilometres("");
    setOwners("1");
    setRegistration("");
    setPrice("");
    setInspection("");
    setImageUrl("");
    setStatus("available");
  }

  function editCar(car: UsedCar) {
    setId(car.id);
    setStockId(car.stock_id);
    setModelName(car.model_name);
    setVariantName(car.variant_name);
    setFuelType(car.fuel_type);
    setYear(String(car.manufacturing_year));
    setKilometres(String(car.kilometres_driven));
    setOwners(String(car.number_of_owners));
    setRegistration(car.registration_masked ?? "");
    setPrice(String(car.selling_price));
    setInspection(car.inspection_report ?? "");
    setImageUrl(car.image_url ?? "");
    setStatus(car.status);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/used-cars", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          stock_id: stockId,
          model_name: modelName,
          variant_name: variantName,
          fuel_type: fuelType,
          manufacturing_year: year,
          kilometres_driven: kilometres,
          number_of_owners: owners,
          registration_masked: registration,
          selling_price: price,
          inspection_report: inspection,
          image_url: imageUrl,
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save used car.");
      }

      setMessage(
        isEditing
          ? "Used car updated successfully!"
          : "Used car added successfully!"
      );

      resetForm();
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const availableCount = cars.filter(
    (car) => car.status === "available"
  ).length;

  const reservedCount = cars.filter(
    (car) => car.status === "reserved"
  ).length;

  const soldCount = cars.filter(
    (car) => car.status === "sold"
  ).length;

  function formatPrice(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function statusClass(value: string) {
    if (value === "available") return "bg-green-50 text-green-700";
    if (value === "reserved") return "bg-amber-50 text-amber-700";
    if (value === "sold") return "bg-gray-100 text-gray-600";
    return "bg-red-50 text-red-700";
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/60 via-[#f8f8f6] to-[#f8f8f6] px-4 py-8 text-[#202020] sm:px-6 md:py-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-700">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
              DriveX Administration
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Used Car Management
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage certified pre-owned vehicles and dealership stock.
            </p>
          </div>

          <a
            href="/dashboard/inventory"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            ← Back to Inventory
          </a>
        </header>

        {/* Statistics */}
        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Stock", value: cars.length },
            { label: "Available", value: availableCount },
            { label: "Reserved", value: reservedCount },
            { label: "Sold", value: soldCount },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </section>

        {/* Feedback */}
        {message && (
          <p
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
          >
            {error}
          </p>
        )}

        {/* Add/Edit Form */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold">
              {isEditing ? "Edit Used Car" : "Add Used Car"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter vehicle details, inspection information and selling price.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Stock ID *
              </label>
              <input
                required
                value={stockId}
                onChange={(e) => setStockId(e.target.value)}
                placeholder="e.g. DX-UC-001"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Model Name *
              </label>
              <input
                required
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. VELTOR"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Variant *
              </label>
              <input
                required
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                placeholder="e.g. ZX Automatic"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Fuel Type *
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className={inputClass}
              >
                <option>Petrol</option>
                <option>Diesel</option>
                <option>CNG</option>
                <option>Electric</option>
                <option>Hybrid</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Manufacturing Year *
              </label>
              <input
                required
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2023"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Kilometres Driven *
              </label>
              <input
                required
                type="number"
                min="0"
                value={kilometres}
                onChange={(e) => setKilometres(e.target.value)}
                placeholder="e.g. 25000"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Number of Owners *
              </label>
              <select
                required
                value={owners}
                onChange={(e) => setOwners(e.target.value)}
                className={inputClass}
              >
                {[1, 2, 3, 4, 5].map((number) => (
                  <option key={number} value={number}>
                    {number} {number === 1 ? "Owner" : "Owners"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Masked Registration
              </label>
              <input
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                placeholder="e.g. UP32 ** 1234"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Selling Price (₹) *
              </label>
              <input
                required
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 650000"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Listing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="booked">Booked</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Vehicle Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/car.jpg"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Inspection Report
              </label>
              <textarea
                rows={3}
                value={inspection}
                onChange={(e) => setInspection(e.target.value)}
                placeholder="Describe vehicle inspection and condition..."
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : isEditing
                    ? "Update Used Car"
                    : "Add Used Car"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Existing Stock */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold">Used Car Stock</h2>
              <p className="mt-1 text-sm text-gray-500">
                All dealership pre-owned vehicles.
              </p>
            </div>

            <span className="rounded-full bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-700">
              {cars.length} vehicles
            </span>
          </div>

          {cars.length === 0 ? (
            <p className="p-10 text-center text-sm text-gray-500">
              No used cars found. Add your first vehicle above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Stock / Model</th>
                    <th className="px-5 py-4">Year</th>
                    <th className="px-5 py-4">Kilometres</th>
                    <th className="px-5 py-4">Owners</th>
                    <th className="px-5 py-4">Registration</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-orange-50/40">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{car.model_name}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {car.stock_id} · {car.variant_name}
                        </p>
                      </td>

                      <td className="px-5 py-4">{car.manufacturing_year}</td>

                      <td className="px-5 py-4">
                        {car.kilometres_driven.toLocaleString("en-IN")} km
                      </td>

                      <td className="px-5 py-4">
                        {car.number_of_owners}
                      </td>

                      <td className="px-5 py-4">
                        {car.registration_masked || "—"}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {formatPrice(car.selling_price)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(car.status)}`}
                        >
                          {car.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => editCar(car)}
                          className="font-semibold text-orange-600 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="py-8 text-center text-xs text-gray-400">
          © 2026 DriveX Dealership Management
        </footer>
      </div>
    </main>
  );
}

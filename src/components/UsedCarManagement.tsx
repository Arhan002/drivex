
"use client";

import { useMemo, useState, type FormEvent } from "react";

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
  "w-full rounded-xl border border-[#e9e5df] bg-white px-4 py-3 text-sm text-[#202020] outline-none transition placeholder:text-[#aaa39b] focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-wider text-[#746e66]";

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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isEditing = Boolean(id);

  const availableCount = cars.filter(
    (car) => car.status === "available"
  ).length;

  const reservedCount = cars.filter(
    (car) => car.status === "reserved" || car.status === "booked"
  ).length;

  const soldCount = cars.filter(
    (car) => car.status === "sold"
  ).length;

  const filteredCars = useMemo(() => {
    const term = search.trim().toLowerCase();

    return cars.filter((car) => {
      const matchesSearch =
        !term ||
        [
          car.stock_id,
          car.model_name,
          car.variant_name,
          car.fuel_type,
          car.registration_masked ?? "",
        ].some((value) => value.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "reserved" &&
          (car.status === "reserved" || car.status === "booked")) ||
        car.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cars, search, statusFilter]);

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
    setMessage("");
    setError("");
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
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function statusClass(value: string) {
    if (value === "available")
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    if (value === "reserved" || value === "booked")
      return "border border-amber-200 bg-amber-50 text-amber-700";
    if (value === "sold")
      return "border border-gray-200 bg-gray-100 text-gray-600";

    return "border border-red-200 bg-red-50 text-red-700";
  }

  const stats = [
    {
      label: "Total stock",
      value: cars.length,
      description: "Vehicles in inventory",
      icon: "◇",
      tone: "bg-orange-50 text-orange-600",
    },
    {
      label: "Available",
      value: availableCount,
      description: "Ready for customers",
      icon: "✓",
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Reserved / booked",
      value: reservedCount,
      description: "Currently on hold",
      icon: "◷",
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Sold",
      value: soldCount,
      description: "Completed sales",
      icon: "↗",
      tone: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-8 text-[#191919] sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1480px]">
        {/* Header */}
        <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <a
              href="/dashboard"
              className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[#77716a] transition hover:text-orange-600"
            >
              <span>←</span> Dashboard
            </a>

            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              <span className="h-2 w-2 rounded-full bg-orange-600" />
              DriveX Administration
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Used car inventory
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#817b74] sm:text-base">
              Manage certified pre-owned vehicles, inspect stock details and
              keep your dealership listings up to date.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start rounded-2xl border border-[#e9e5df] bg-white px-4 py-3 sm:self-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#191919] text-lg font-black text-white">
              DX
            </div>
            <div>
              <p className="text-sm font-bold">DriveX Admin</p>
              <p className="mt-0.5 text-xs text-[#8b847c]">
                Pre-owned inventory
              </p>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative mt-10 overflow-hidden rounded-[28px] bg-[#191817] px-7 py-9 text-white sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-24 h-64 w-64 rounded-full border border-white/10" />

          <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                Certified pre-owned
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Your used-car collection, under control.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                Maintain accurate vehicle details, transparent pricing and
                availability across your dealership.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                {cars.length} vehicles
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                {availableCount} available
              </span>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-[22px] border border-[#e9e5df] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#77716a]">
                  {item.label}
                </p>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-semibold ${item.tone}`}
                >
                  {item.icon}
                </span>
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight">
                {item.value}
              </p>
              <p className="mt-1.5 text-xs text-[#999189]">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        {/* Form heading */}
        <section className="mt-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            Inventory configuration
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            {isEditing ? "Update vehicle details" : "Add a used car"}
          </h2>
          <p className="mt-2 text-sm text-[#817b74]">
            {isEditing
              ? "Make changes to the selected vehicle in your inventory."
              : "Register a pre-owned vehicle and prepare it for your catalogue."}
          </p>
        </section>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* Add / Edit form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 overflow-hidden rounded-[24px] border border-[#e9e5df] bg-white"
        >
          <div className="border-b border-[#eeeae5] px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-sm font-bold text-orange-600">
                01
              </span>
              <div>
                <h3 className="font-bold">
                  {isEditing ? "Vehicle information" : "Vehicle details"}
                </h3>
                <p className="mt-1 text-xs text-[#918a82]">
                  Basic information used to identify the vehicle.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2 sm:p-8 xl:grid-cols-3">
            <div>
              <label className={labelClass}>Stock ID *</label>
              <input
                required
                value={stockId}
                onChange={(e) => setStockId(e.target.value)}
                placeholder="e.g. DX-UC-001"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Model name *</label>
              <input
                required
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. VELTOR"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Variant *</label>
              <input
                required
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                placeholder="e.g. ZX Automatic"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Fuel type *</label>
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
              <label className={labelClass}>Manufacturing year *</label>
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
              <label className={labelClass}>Kilometres driven *</label>
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
              <label className={labelClass}>Number of owners *</label>
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
              <label className={labelClass}>Masked registration</label>
              <input
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                placeholder="e.g. UP32 ** 1234"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Selling price (₹) *</label>
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
              <label className={labelClass}>Listing status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="booked">Booked</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            <div className="sm:col-span-2 xl:col-span-3">
              <div className="mb-5 mt-2 border-t border-[#eeeae5]" />
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-sm font-bold text-orange-600">
                  02
                </span>
                <div>
                  <h3 className="font-bold">Media and inspection</h3>
                  <p className="mt-1 text-xs text-[#918a82]">
                    Add a vehicle image and its inspection information.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Vehicle image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/car.jpg"
                className={inputClass}
              />
              <p className="mt-2 text-xs text-[#999189]">
                Provide a publicly accessible image URL.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Inspection report</label>
              <textarea
                rows={3}
                value={inspection}
                onChange={(e) => setInspection(e.target.value)}
                placeholder="Describe vehicle inspection, condition and important observations..."
                className={`${inputClass} resize-y`}
              />
            </div>

            {imageUrl && (
              <div className="sm:col-span-2 xl:col-span-3">
                <p className={labelClass}>Image preview</p>
                <div className="flex items-center gap-4 rounded-xl border border-[#eeeae5] bg-[#faf9f7] p-3">
                  <div
                    className="h-20 w-32 shrink-0 rounded-lg bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${imageUrl}")` }}
                  />
                  <div>
                    <p className="text-sm font-semibold">Vehicle image</p>
                    <p className="mt-1 break-all text-xs text-[#999189]">
                      {imageUrl}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-[#eeeae5] pt-6 sm:col-span-2 xl:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#191817] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : isEditing
                    ? "Save vehicle changes →"
                    : "Add used car →"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-[#e9e5df] px-6 py-3.5 text-sm font-semibold text-[#6f6962] transition hover:bg-[#f7f6f3]"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Inventory list */}
        <section className="mt-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            Inventory records
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Your used-car stock
          </h2>
          <p className="mt-2 text-sm text-[#817b74]">
            Search, review and manage your dealership&apos;s pre-owned vehicles.
          </p>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-[#e9e5df] bg-white">
            {/* Table toolbar */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#eeeae5] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
              <div>
                <h3 className="font-bold">Vehicle listings</h3>
                <p className="mt-1 text-xs text-[#918a82]">
                  {filteredCars.length} of {cars.length} vehicles
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999189]">
                    ⌕
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search stock or model..."
                    className="w-full rounded-full border border-[#e9e5df] bg-[#faf9f7] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 sm:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-full border border-[#e9e5df] bg-[#faf9f7] px-4 py-3 text-sm outline-none focus:border-orange-500"
                >
                  <option value="all">All statuses</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved / Booked</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            {filteredCars.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl text-orange-600">
                  ◇
                </div>
                <h3 className="mt-4 font-bold">No vehicles found</h3>
                <p className="mt-2 text-sm text-[#918a82]">
                  {cars.length === 0
                    ? "Add your first used vehicle using the form above."
                    : "Try changing your search or status filter."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-[#faf9f7] text-[11px] font-semibold uppercase tracking-[0.13em] text-[#817b74]">
                    <tr>
                      <th className="px-6 py-4">Vehicle</th>
                      <th className="px-5 py-4">Year</th>
                      <th className="px-5 py-4">Kilometres</th>
                      <th className="px-5 py-4">Owners</th>
                      <th className="px-5 py-4">Registration</th>
                      <th className="px-5 py-4">Selling price</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#eeeae5]">
                    {filteredCars.map((car) => (
                      <tr
                        key={car.id}
                        className="transition hover:bg-[#fcfaf7]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-14 w-20 shrink-0 rounded-xl border border-[#eeeae5] bg-[#f3f1ed] bg-cover bg-center"
                              style={
                                car.image_url
                                  ? {
                                      backgroundImage: `url("${car.image_url}")`,
                                    }
                                  : undefined
                              }
                            >
                              {!car.image_url && (
                                <div className="flex h-full items-center justify-center text-xl text-[#b2aaa1]">
                                  ◇
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-bold text-[#24211e]">
                                {car.model_name}
                              </p>
                              <p className="mt-1 text-xs text-[#8e877f]">
                                {car.stock_id} · {car.variant_name}
                              </p>
                              <p className="mt-1 text-[11px] text-[#aaa39b]">
                                {car.fuel_type}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-medium">
                          {car.manufacturing_year}
                        </td>

                        <td className="px-5 py-4 text-[#68625b]">
                          {car.kilometres_driven.toLocaleString("en-IN")} km
                        </td>

                        <td className="px-5 py-4 text-[#68625b]">
                          {car.number_of_owners}
                        </td>

                        <td className="px-5 py-4 text-[#68625b]">
                          {car.registration_masked || "—"}
                        </td>

                        <td className="px-5 py-4 font-bold">
                          {formatPrice(car.selling_price)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusClass(car.status)}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {car.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => editCar(car)}
                            className="rounded-full border border-[#e9e5df] px-4 py-2 text-xs font-semibold text-[#4d4842] transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
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
          </div>
        </section>

        <footer className="py-10 text-center text-xs text-[#aaa39b]">
          © 2026 DriveX Dealership Management
        </footer>
      </div>
    </main>
  );
}

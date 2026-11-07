
"use client";

import { useMemo, useState, type FormEvent } from "react";

type Model = {
  id: string;
  name: string;
};

type Variant = {
  id: string;
  model_id: string;
  variant_name: string;
  fuel_type: string;
  transmission: string;
};

type Price = {
  id: string;
  variant_id: string;
  city: string;
  ex_showroom_price: number;
  road_tax: number;
  insurance: number;
  accessories: number;
  valid_until: string;
};

const inputClass =
  "w-full rounded-xl border border-[#e9e5df] bg-white px-4 py-3 text-sm text-[#202020] outline-none transition placeholder:text-[#aaa39b] focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-wider text-[#746e66]";

export default function PricingManagement({
  initialModels,
  initialVariants,
  initialPrices,
}: {
  initialModels: Model[];
  initialVariants: Variant[];
  initialPrices: Price[];
}) {
  const [prices] = useState(initialPrices);

  const [editingId, setEditingId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [city, setCity] = useState("Lucknow");
  const [exShowroom, setExShowroom] = useState("");
  const [roadTax, setRoadTax] = useState("");
  const [insurance, setInsurance] = useState("");
  const [accessories, setAccessories] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedVariant = initialVariants.find(
    (variant) => variant.id === variantId
  );

  const onRoadPrice = useMemo(
    () =>
      Number(exShowroom || 0) +
      Number(roadTax || 0) +
      Number(insurance || 0) +
      Number(accessories || 0),
    [exShowroom, roadTax, insurance, accessories]
  );

  const today = new Date().toLocaleDateString("en-CA");

  const activePrices = prices.filter(
    (price) => price.valid_until >= today
  );

  const expiredPrices = prices.length - activePrices.length;

  const cities = Array.from(
    new Set(prices.map((price) => price.city))
  ).sort();

  const filteredPrices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return prices.filter((price) => {
      const variant = initialVariants.find(
        (item) => item.id === price.variant_id
      );
      const model = initialModels.find(
        (item) => item.id === variant?.model_id
      );

      const searchableText = [
        price.city,
        model?.name ?? "",
        variant?.variant_name ?? "",
        variant?.fuel_type ?? "",
        variant?.transmission ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!term || searchableText.includes(term)) &&
        (cityFilter === "all" || price.city === cityFilter)
      );
    });
  }, [prices, search, cityFilter, initialModels, initialVariants]);

  function formatPrice(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function getVariantLabel(id: string) {
    const variant = initialVariants.find((item) => item.id === id);

    if (!variant) return "Unknown variant";

    const model = initialModels.find(
      (item) => item.id === variant.model_id
    );

    return `${model?.name ?? "Unknown model"} - ${variant.variant_name} (${variant.fuel_type}, ${variant.transmission})`;
  }

  function resetForm() {
    setEditingId("");
    setVariantId("");
    setCity("Lucknow");
    setExShowroom("");
    setRoadTax("");
    setInsurance("");
    setAccessories("");
    setValidUntil("");
    setMessage("");
    setError("");
  }

  function editPrice(price: Price) {
    setEditingId(price.id);
    setVariantId(price.variant_id);
    setCity(price.city);
    setExShowroom(String(price.ex_showroom_price));
    setRoadTax(String(price.road_tax));
    setInsurance(String(price.insurance));
    setAccessories(String(price.accessories));
    setValidUntil(price.valid_until);
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
      const response = await fetch("/api/admin/prices", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId || undefined,
          variant_id: variantId,
          city,
          ex_showroom_price: exShowroom,
          road_tax: roadTax,
          insurance,
          accessories,
          valid_until: validUntil,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save pricing.");
      }

      setMessage(
        editingId
          ? "Pricing updated successfully!"
          : "Pricing created successfully!"
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

  const stats = [
    {
      label: "Total price records",
      value: prices.length,
      description: "Configured vehicle prices",
      icon: "◇",
      tone: "bg-orange-50 text-orange-600",
    },
    {
      label: "Currently valid",
      value: activePrices.length,
      description: "Prices within validity date",
      icon: "✓",
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Expired records",
      value: expiredPrices,
      description: "Require price review",
      icon: "◷",
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Cities covered",
      value: cities.length,
      description: "Configured pricing locations",
      icon: "⌖",
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
              City-wise pricing
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#817b74] sm:text-base">
              Manage vehicle prices, city-specific charges and on-road price
              calculations from one central workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start rounded-2xl border border-[#e9e5df] bg-white px-4 py-3 sm:self-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#191919] text-lg font-black text-white">
              DX
            </div>
            <div>
              <p className="text-sm font-bold">DriveX Admin</p>
              <p className="mt-0.5 text-xs text-[#8b847c]">
                Pricing control
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
                Dealership pricing centre
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Transparent pricing. Accurate on-road costs.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                Configure ex-showroom prices, road tax, insurance and
                accessories for every supported city.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                {initialModels.length} models
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                {initialVariants.length} variants
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                {cities.length} cities
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
            Pricing configuration
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            {editingId ? "Update vehicle pricing" : "Configure vehicle pricing"}
          </h2>
          <p className="mt-2 text-sm text-[#817b74]">
            Select a variant, enter city-wise charges and review the live
            on-road price before saving.
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

        {/* Pricing form */}
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
                  {editingId ? "Edit price record" : "Vehicle and city"}
                </h3>
                <p className="mt-1 text-xs text-[#918a82]">
                  Select which vehicle variant and city this pricing applies
                  to.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2 sm:p-8">
            <div className="sm:col-span-2">
              <label className={labelClass}>Car variant *</label>
              <select
                required
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a vehicle variant</option>
                {initialVariants.map((variant) => {
                  const model = initialModels.find(
                    (item) => item.id === variant.model_id
                  );

                  return (
                    <option key={variant.id} value={variant.id}>
                      {model?.name ?? "Unknown model"} - {variant.variant_name} (
                      {variant.fuel_type}, {variant.transmission})
                    </option>
                  );
                })}
              </select>
              {selectedVariant && (
                <p className="mt-2 text-xs text-[#918a82]">
                  Selected vehicle: {getVariantLabel(selectedVariant.id)}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>City *</label>
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Lucknow"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Price valid until *</label>
              <input
                required
                type="date"
                min={today}
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <div className="mb-2 mt-2 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-sm font-bold text-orange-600">
                  02
                </span>
                <div>
                  <h3 className="font-bold">Price components</h3>
                  <p className="mt-1 text-xs text-[#918a82]">
                    Enter the individual amounts used to calculate the final
                    price.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Ex-showroom price (₹) *</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={exShowroom}
                onChange={(e) => setExShowroom(e.target.value)}
                placeholder="e.g. 1200000"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Road tax (₹) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={roadTax}
                onChange={(e) => setRoadTax(e.target.value)}
                placeholder="e.g. 120000"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Insurance (₹) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                placeholder="e.g. 45000"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Accessories (₹) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={accessories}
                onChange={(e) => setAccessories(e.target.value)}
                placeholder="e.g. 25000"
                className={inputClass}
              />
            </div>

            {/* Live calculator */}
            <div className="overflow-hidden rounded-[22px] bg-[#191817] text-white sm:col-span-2">
              <div className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                    Live on-road price
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    {formatPrice(onRoadPrice)}
                  </p>
                  <p className="mt-2 text-xs text-white/50">
                    Automatically calculated from all four price components.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Auto calculated
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 bg-white/[0.03] px-6 py-5 sm:grid-cols-4 sm:px-8">
                {[
                  {
                    label: "Ex-showroom",
                    value: Number(exShowroom || 0),
                  },
                  { label: "Road tax", value: Number(roadTax || 0) },
                  { label: "Insurance", value: Number(insurance || 0) },
                  {
                    label: "Accessories",
                    value: Number(accessories || 0),
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] text-white/45">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-white/90">
                      {formatPrice(item.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-[#eeeae5] pt-6 sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#191817] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Save pricing changes →"
                    : "Save pricing →"}
              </button>

              {editingId && (
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

        {/* Existing records */}
        <section className="mt-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            Pricing records
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Your city-wise prices
          </h2>
          <p className="mt-2 text-sm text-[#817b74]">
            Review, search and update configured vehicle prices.
          </p>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-[#e9e5df] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#eeeae5] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
              <div>
                <h3 className="font-bold">Existing pricing records</h3>
                <p className="mt-1 text-xs text-[#918a82]">
                  Showing {filteredPrices.length} of {prices.length} records
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search model or variant..."
                  className="w-full rounded-full border border-[#e9e5df] bg-[#faf9f7] px-4 py-3 text-sm outline-none transition focus:border-orange-500 sm:w-64"
                />

                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="rounded-full border border-[#e9e5df] bg-[#faf9f7] px-4 py-3 text-sm outline-none focus:border-orange-500"
                >
                  <option value="all">All cities</option>
                  {cities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredPrices.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl text-orange-600">
                  ◇
                </div>
                <h3 className="mt-4 font-bold">No pricing records found</h3>
                <p className="mt-2 text-sm text-[#918a82]">
                  Try changing your search or city filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] text-left text-sm">
                  <thead className="bg-[#faf9f7] text-[11px] font-semibold uppercase tracking-[0.13em] text-[#817b74]">
                    <tr>
                      <th className="px-6 py-4">Vehicle variant</th>
                      <th className="px-5 py-4">City</th>
                      <th className="px-5 py-4">Ex-showroom</th>
                      <th className="px-5 py-4">Road tax</th>
                      <th className="px-5 py-4">Insurance</th>
                      <th className="px-5 py-4">Accessories</th>
                      <th className="px-5 py-4">On-road price</th>
                      <th className="px-5 py-4">Validity</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#eeeae5]">
                    {filteredPrices.map((price) => {
                      const total =
                        Number(price.ex_showroom_price) +
                        Number(price.road_tax) +
                        Number(price.insurance) +
                        Number(price.accessories);

                      const expired = price.valid_until < today;

                      return (
                        <tr
                          key={price.id}
                          className="transition hover:bg-[#fcfaf7]"
                        >
                          <td className="px-6 py-4">
                            <p className="max-w-[240px] font-semibold text-[#24211e]">
                              {getVariantLabel(price.variant_id)}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-[#68625b]">
                            {price.city}
                          </td>

                          <td className="px-5 py-4">
                            {formatPrice(Number(price.ex_showroom_price))}
                          </td>

                          <td className="px-5 py-4">
                            {formatPrice(Number(price.road_tax))}
                          </td>

                          <td className="px-5 py-4">
                            {formatPrice(Number(price.insurance))}
                          </td>

                          <td className="px-5 py-4">
                            {formatPrice(Number(price.accessories))}
                          </td>

                          <td className="px-5 py-4 font-bold text-[#191817]">
                            {formatPrice(total)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                expired
                                  ? "border border-red-200 bg-red-50 text-red-700"
                                  : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {expired ? "Expired" : "Valid"}
                            </span>
                            <p className="mt-1.5 text-[11px] text-[#918a82]">
                              {price.valid_until}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => editPrice(price)}
                              className="rounded-full border border-[#e9e5df] px-4 py-2 text-xs font-semibold text-[#4d4842] transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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

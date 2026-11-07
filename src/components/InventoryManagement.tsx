
"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
type CarModel = {
  id: string;
  name: string;
  description: string | null;
  body_type: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

type CarVariant = {
  id: string;
  model_id: string;
  variant_name: string;
  fuel_type: string;
  transmission: string;
  engine_cc: number | null;
  mileage: string | null;
  specifications: Record<string, unknown> | null;
};

const inputClass =
  "w-full rounded-xl border border-[#e8e5df] bg-white px-4 py-3 text-sm text-[#25231f] outline-none transition placeholder:text-[#aaa49b] hover:border-[#d8d2c8] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-[#f5f4f1]";

const labelClass =
  "mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#716b63]";

function SectionLabel({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-700">
        {number}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#89837b]">
        {label}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
  accent,
}: {
  label: string;
  value: number;
  detail: string;
  icon: string;
  accent: string;
}) {
  return (
    <div className="group rounded-2xl border border-[#eae7e2] bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(0,0,0,0.06)] sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#77716a]">{label}</p>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${accent}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-[#191816]">
        {value.toLocaleString("en-IN")}
      </p>
      <p className="mt-1.5 text-xs text-[#99938d]">{detail}</p>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f2ed] text-xl text-[#a69d91]">
        ◇
      </div>
      <p className="mt-4 text-sm font-bold text-[#34312c]">{title}</p>
      <p className="mt-1 text-xs text-[#969087]">{description}</p>
    </div>
  );
}

export default function InventoryManagement({
  initialModels,
  initialVariants,
}: {
  initialModels: CarModel[];
  initialVariants: CarVariant[];
}) {
  const [models] = useState(initialModels);
  const [variants] = useState(initialVariants);

  const [modelName, setModelName] = useState("");
  const [description, setDescription] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingModelId, setEditingModelId] = useState<string | null>(null);

  const [selectedModel, setSelectedModel] = useState("");
  const [variantName, setVariantName] = useState("");
  const [fuelType, setFuelType] = useState("Petrol");
  const [transmission, setTransmission] = useState("Manual");
  const [engineCc, setEngineCc] = useState("");
  const [mileage, setMileage] = useState("");
  const [editingVariantId, setEditingVariantId] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [variantSearch, setVariantSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"models" | "variants">("models");

  const activeCount = models.filter((model) => model.is_active).length;
  const inactiveCount = models.length - activeCount;

  const filteredModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();

    if (!query) return models;

    return models.filter((model) =>
      [
        model.name,
        model.body_type ?? "",
        model.description ?? "",
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [models, modelSearch]);

  const filteredVariants = useMemo(() => {
    const query = variantSearch.trim().toLowerCase();

    if (!query) return variants;

    return variants.filter((variant) => {
      const model = models.find((item) => item.id === variant.model_id);

      return [
        model?.name ?? "",
        variant.variant_name,
        variant.fuel_type,
        variant.transmission,
        String(variant.engine_cc ?? ""),
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [variants, models, variantSearch]);

  async function sendRequest(
    method: "POST" | "PATCH",
    body: Record<string, unknown>
  ) {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/inventory", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save inventory.");
      }

      setMessage("Inventory updated successfully.");
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetModelForm() {
    setModelName("");
    setDescription("");
    setBodyType("");
    setImageUrl("");
    setEditingModelId(null);
  }

  function resetVariantForm() {
    setSelectedModel("");
    setVariantName("");
    setFuelType("Petrol");
    setTransmission("Manual");
    setEngineCc("");
    setMileage("");
    setEditingVariantId(null);
  }

  function editModel(model: CarModel) {
    setEditingModelId(model.id);
    setModelName(model.name);
    setDescription(model.description ?? "");
    setBodyType(model.body_type ?? "");
    setImageUrl(model.image_url ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editVariant(variant: CarVariant) {
    setEditingVariantId(variant.id);
    setSelectedModel(variant.model_id);
    setVariantName(variant.variant_name);
    setFuelType(variant.fuel_type);
    setTransmission(variant.transmission);
    setEngineCc(
      variant.engine_cc === null ? "" : String(variant.engine_cc)
    );
    setMileage(variant.mileage ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleModelSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await sendRequest(editingModelId ? "PATCH" : "POST", {
      action: editingModelId ? "update_model" : "create_model",
      ...(editingModelId ? { id: editingModelId } : {}),
      name: modelName,
      description,
      body_type: bodyType,
      image_url: imageUrl,
    });
  }

  async function handleVariantSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!editingVariantId && !selectedModel) {
      setError("Please select a car model.");
      return;
    }

    await sendRequest(editingVariantId ? "PATCH" : "POST", {
      action: editingVariantId ? "update_variant" : "create_variant",
      ...(editingVariantId ? { id: editingVariantId } : {}),
      model_id: selectedModel,
      variant_name: variantName,
      fuel_type: fuelType,
      transmission,
      engine_cc: engineCc,
      mileage,
    });
  }

  async function toggleModel(model: CarModel) {
    const confirmed = window.confirm(
      `Are you sure you want to ${
        model.is_active ? "deactivate" : "activate"
      } ${model.name}?`
    );

    if (!confirmed) return;

    await sendRequest("PATCH", {
      action: "toggle_model",
      id: model.id,
      is_active: !model.is_active,
    });
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 pb-16 pt-7 text-[#191816] sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/dashboard"
              className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#827b72] transition hover:text-orange-700"
            >
              <span>←</span> Dashboard
            </Link>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-700">
                DriveX administration
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Inventory management
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#817b73]">
              Manage your dealership catalogue, vehicle models and variants
              from one central workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start rounded-2xl border border-[#e9e5de] bg-white px-4 py-3 sm:self-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#191816] text-sm font-black tracking-tight text-white">
              DX
            </div>
            <div>
              <p className="text-xs font-bold text-[#282520]">DriveX Admin</p>
              <p className="mt-0.5 text-[10px] text-[#99938d]">
                Catalogue control
              </p>
            </div>
          </div>
        </header>

        {/* Dark banner */}
        <section className="relative mb-7 overflow-hidden rounded-[24px] bg-[#191816] px-6 py-7 text-white sm:px-9 sm:py-8">
          <div className="pointer-events-none absolute -right-12 -top-28 h-64 w-64 rounded-full border border-white/[0.08]" />
          <div className="pointer-events-none absolute -right-2 -top-20 h-48 w-48 rounded-full border border-white/[0.08]" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">
              Catalogue overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Your vehicle catalogue, organised.
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Keep model information and variant specifications accurate
              across the DriveX customer experience.
            </p>
          </div>
          <div className="relative z-10 mt-5 flex flex-wrap gap-2 sm:absolute sm:bottom-8 sm:right-9 sm:mt-0">
            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold text-white/75">
              {models.length} models
            </span>
            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold text-white/75">
              {variants.length} variants
            </span>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total models"
            value={models.length}
            detail="Models in the catalogue"
            icon="◇"
            accent="bg-orange-50 text-orange-600"
          />
          <StatCard
            label="Active models"
            value={activeCount}
            detail="Currently available on website"
            icon="✓"
            accent="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Inactive models"
            value={inactiveCount}
            detail="Hidden from active catalogue"
            icon="−"
            accent="bg-[#f1f0ed] text-[#77716a]"
          />
          <StatCard
            label="Total variants"
            value={variants.length}
            detail="Configured vehicle variants"
            icon="⌁"
            accent="bg-blue-50 text-blue-600"
          />
        </section>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
              ✓
            </span>
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
              !
            </span>
            {error}
          </div>
        )}

        {/* Forms */}
        <section className="mb-10">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-700">
              Catalogue configuration
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Manage vehicles
            </h2>
            <p className="mt-1 text-sm text-[#89837b]">
              Add new models and configure their available variants.
            </p>
          </div>

          <div className="grid items-start gap-5 xl:grid-cols-2">
            {/* Model form */}
            <section className="overflow-hidden rounded-2xl border border-[#eae7e2] bg-white">
              <div className="border-b border-[#efede9] px-6 py-5 sm:px-7">
                <SectionLabel number="01" label="Vehicle model" />
                <h3 className="mt-3 text-xl font-bold tracking-tight">
                  {editingModelId ? "Edit car model" : "Add a car model"}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#8d867e]">
                  Set up the main vehicle information displayed in your
                  catalogue.
                </p>
              </div>

              <form
                onSubmit={handleModelSubmit}
                className="space-y-5 p-6 sm:p-7"
              >
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
                  <label className={labelClass}>Body type</label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select body type</option>
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="MUV">MUV</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/car.jpg"
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-[10px] text-[#aaa39a]">
                    Provide a publicly accessible image URL.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the vehicle model..."
                    rows={3}
                    className={`${inputClass} resize-y`}
                  />
                </div>

                <div className="flex flex-wrap gap-3 border-t border-[#f0eeeb] pt-5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingModelId
                        ? "Save model changes →"
                        : "Add car model →"}
                  </button>

                  {editingModelId && (
                    <button
                      type="button"
                      onClick={resetModelForm}
                      className="rounded-full border border-[#e8e5df] px-5 py-3 text-xs font-semibold text-[#625d55] transition hover:bg-[#f7f6f3]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Variant form */}
            <section className="overflow-hidden rounded-2xl border border-[#eae7e2] bg-white">
              <div className="border-b border-[#efede9] px-6 py-5 sm:px-7">
                <SectionLabel number="02" label="Vehicle configuration" />
                <h3 className="mt-3 text-xl font-bold tracking-tight">
                  {editingVariantId ? "Edit variant" : "Add a variant"}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#8d867e]">
                  Configure engine, fuel and transmission details for a model.
                </p>
              </div>

              <form
                onSubmit={handleVariantSubmit}
                className="space-y-5 p-6 sm:p-7"
              >
                <div>
                  <label className={labelClass}>Car model *</label>
                  <select
                    required
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={!!editingVariantId}
                    className={inputClass}
                  >
                    <option value="">Select car model</option>
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Variant name *</label>
                  <input
                    required
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    placeholder="e.g. ZX Automatic"
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                    <label className={labelClass}>Transmission *</label>
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                      className={inputClass}
                    >
                      <option>Manual</option>
                      <option>Automatic</option>
                      <option>AMT</option>
                      <option>CVT</option>
                      <option>DCT</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Engine capacity (CC)</label>
                    <input
                      type="number"
                      min="1"
                      value={engineCc}
                      onChange={(e) => setEngineCc(e.target.value)}
                      placeholder="e.g. 1498"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Mileage</label>
                    <input
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      placeholder="e.g. 18 km/l"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 border-t border-[#f0eeeb] pt-5">
                  <button
                    type="submit"
                    disabled={loading || models.length === 0}
                    className="inline-flex items-center justify-center rounded-full bg-[#191816] px-6 py-3 text-xs font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingVariantId
                        ? "Save variant changes →"
                        : "Add variant →"}
                  </button>

                  {editingVariantId && (
                    <button
                      type="button"
                      onClick={resetVariantForm}
                      className="rounded-full border border-[#e8e5df] px-5 py-3 text-xs font-semibold text-[#625d55] transition hover:bg-[#f7f6f3]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>
          </div>
        </section>

        {/* Inventory tables */}
        <section>
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-700">
              Catalogue records
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Your inventory
            </h2>
            <p className="mt-1 text-sm text-[#89837b]">
              Search, review and manage your existing models and variants.
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("models")}
              className={`rounded-full px-5 py-2.5 text-xs font-bold transition ${
                activeTab === "models"
                  ? "bg-[#191816] text-white"
                  : "border border-[#e8e5df] bg-white text-[#706a62] hover:border-orange-300"
              }`}
            >
              Car models <span className="ml-1 opacity-65">({models.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("variants")}
              className={`rounded-full px-5 py-2.5 text-xs font-bold transition ${
                activeTab === "variants"
                  ? "bg-[#191816] text-white"
                  : "border border-[#e8e5df] bg-white text-[#706a62] hover:border-orange-300"
              }`}
            >
              Variants <span className="ml-1 opacity-65">({variants.length})</span>
            </button>
          </div>

          {activeTab === "models" ? (
            <section className="overflow-hidden rounded-2xl border border-[#eae7e2] bg-white">
              <div className="flex flex-col justify-between gap-4 border-b border-[#efede9] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                <div>
                  <h3 className="text-lg font-bold">Car models</h3>
                  <p className="mt-1 text-xs text-[#969087]">
                    Manage models and their website availability.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a29b91]">
                    ⌕
                  </span>
                  <input
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Search models..."
                    className="w-full rounded-full border border-[#e8e5df] bg-[#faf9f7] py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              {filteredModels.length === 0 ? (
                <EmptyState
                  title="No models found"
                  description="Try a different search or add a new car model."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-[#faf9f7] text-[10px] font-bold uppercase tracking-[0.14em] text-[#938c82]">
                      <tr>
                        <th className="px-6 py-4">Model</th>
                        <th className="px-6 py-4">Body type</th>
                        <th className="px-6 py-4">Variants</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0eeeb]">
                      {filteredModels.map((model) => {
                        const modelVariants = variants.filter(
                          (variant) => variant.model_id === model.id
                        );

                        return (
                          <tr
                            key={model.id}
                            className="transition hover:bg-[#fdfbf8]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f2f0ec]">
                                  {model.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={model.image_url}
                                      alt={model.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-lg text-[#a69d91]">◇</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-[#292622]">
                                    {model.name}
                                  </p>
                                  <p className="mt-1 max-w-xs truncate text-[11px] text-[#99938d]">
                                    {model.description || "No description added"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-xs text-[#716b63]">
                              {model.body_type || "—"}
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-[#f4f2ee] px-2.5 py-1.5 text-xs font-bold text-[#555047]">
                                {modelVariants.length}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${
                                  model.is_active
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-[#e8e5df] bg-[#f5f4f1] text-[#77716a]"
                                }`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {model.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => editModel(model)}
                                  className="rounded-full border border-[#e8e5df] px-3.5 py-2 text-[11px] font-bold text-[#575149] transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleModel(model)}
                                  disabled={loading}
                                  className="rounded-full px-3 py-2 text-[11px] font-bold text-[#817a71] transition hover:bg-[#f4f2ee] hover:text-[#282520] disabled:opacity-50"
                                >
                                  {model.is_active ? "Deactivate" : "Activate"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="border-t border-[#efede9] px-6 py-3.5 text-[10px] text-[#99938d]">
                Showing {filteredModels.length} of {models.length} models
              </div>
            </section>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-[#eae7e2] bg-white">
              <div className="flex flex-col justify-between gap-4 border-b border-[#efede9] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                <div>
                  <h3 className="text-lg font-bold">Vehicle variants</h3>
                  <p className="mt-1 text-xs text-[#969087]">
                    Review and edit configured vehicle variants.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a29b91]">
                    ⌕
                  </span>
                  <input
                    value={variantSearch}
                    onChange={(e) => setVariantSearch(e.target.value)}
                    placeholder="Search variants..."
                    className="w-full rounded-full border border-[#e8e5df] bg-[#faf9f7] py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              {filteredVariants.length === 0 ? (
                <EmptyState
                  title="No variants found"
                  description="Try a different search or add a new vehicle variant."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-[#faf9f7] text-[10px] font-bold uppercase tracking-[0.14em] text-[#938c82]">
                      <tr>
                        <th className="px-6 py-4">Model</th>
                        <th className="px-6 py-4">Variant</th>
                        <th className="px-6 py-4">Fuel</th>
                        <th className="px-6 py-4">Transmission</th>
                        <th className="px-6 py-4">Engine</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0eeeb]">
                      {filteredVariants.map((variant) => {
                        const model = models.find(
                          (item) => item.id === variant.model_id
                        );

                        return (
                          <tr
                            key={variant.id}
                            className="transition hover:bg-[#fdfbf8]"
                          >
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#292622]">
                                {model?.name || "Unknown model"}
                              </p>
                            </td>
                            <td className="px-6 py-4 font-medium text-[#48433d]">
                              {variant.variant_name}
                            </td>
                            <td className="px-6 py-4">
                              <span className="rounded-full bg-[#f4f2ee] px-3 py-1.5 text-[10px] font-semibold text-[#686158]">
                                {variant.fuel_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-[#716b63]">
                              {variant.transmission}
                            </td>
                            <td className="px-6 py-4 text-xs text-[#716b63]">
                              {variant.engine_cc
                                ? `${variant.engine_cc.toLocaleString("en-IN")} CC`
                                : "—"}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => editVariant(variant)}
                                className="rounded-full border border-[#e8e5df] px-4 py-2 text-[11px] font-bold text-[#575149] transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                              >
                                Edit variant
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="border-t border-[#efede9] px-6 py-3.5 text-[10px] text-[#99938d]">
                Showing {filteredVariants.length} of {variants.length} variants
              </div>
            </section>
          )}
        </section>

        <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#e8e5df] pt-7 text-center sm:flex-row">
          <Link
            href="/dashboard"
            className="text-lg font-black tracking-[-0.06em] text-[#191816]"
          >
            DRIVE<span className="text-orange-600">X.</span>
          </Link>
          <p className="text-[11px] text-[#99938d]">
            Dealership operations · Inventory management
          </p>
        </footer>
      </div>
    </main>
  );
}

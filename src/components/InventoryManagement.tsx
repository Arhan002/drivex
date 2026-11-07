
"use client";

import { useState } from "react";

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
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

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

  async function handleModelSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleVariantSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  const activeCount = models.filter((model) => model.is_active).length;

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
              Inventory Management
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage car models, variants and dealership inventory.
            </p>
          </div>

          <a
            href="/dashboard"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            ← Back to Dashboard
          </a>
        </header>

        {/* Statistics */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Total Models", value: models.length },
            { label: "Active Models", value: activeCount },
            { label: "Total Variants", value: variants.length },
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

        {/* Add/Edit Model */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold">
              {editingModelId ? "Edit Car Model" : "Add New Car Model"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add a new vehicle model to the dealership catalogue.
            </p>
          </div>

          <form onSubmit={handleModelSubmit} className="grid gap-5 p-6 md:grid-cols-2">
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
                Body Type
              </label>
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
              <label className="mb-2 block text-sm font-semibold">
                Image URL
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
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the car model"
                rows={3}
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editingModelId
                    ? "Update Model"
                    : "Add Car Model"}
              </button>

              {editingModelId && (
                <button
                  type="button"
                  onClick={resetModelForm}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Add/Edit Variant */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold">
              {editingVariantId ? "Edit Variant" : "Add New Variant"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add a variant under an existing car model.
            </p>
          </div>

          <form onSubmit={handleVariantSubmit} className="grid gap-5 p-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Car Model *
              </label>
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
              <label className="mb-2 block text-sm font-semibold">
                Variant Name *
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
                Transmission *
              </label>
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

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Engine Capacity (CC)
              </label>
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
              <label className="mb-2 block text-sm font-semibold">
                Mileage
              </label>
              <input
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g. 18 km/l"
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={loading || models.length === 0}
                className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editingVariantId
                    ? "Update Variant"
                    : "Add Variant"}
              </button>

              {editingVariantId && (
                <button
                  type="button"
                  onClick={resetVariantForm}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Existing Models */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold">Existing Car Models</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage models and their availability on the website.
            </p>
          </div>

          {models.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">
              No car models found. Add your first model above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Model</th>
                    <th className="px-6 py-4">Body Type</th>
                    <th className="px-6 py-4">Variants</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {models.map((model) => {
                    const modelVariants = variants.filter(
                      (variant) => variant.model_id === model.id
                    );

                    return (
                      <tr key={model.id} className="hover:bg-orange-50/40">
                        <td className="px-6 py-4">
                          <p className="font-semibold">{model.name}</p>
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                            {model.description || "No description"}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {model.body_type || "—"}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {modelVariants.length}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              model.is_active
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {model.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => editModel(model)}
                              className="font-semibold text-orange-600 hover:underline"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleModel(model)}
                              disabled={loading}
                              className="font-semibold text-gray-600 hover:underline disabled:opacity-50"
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
        </section>

        {/* Existing Variants */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold">Existing Variants</h2>
            <p className="mt-1 text-sm text-gray-500">
              View and edit all vehicle variants.
            </p>
          </div>

          {variants.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">
              No variants found. Add a variant above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Model</th>
                    <th className="px-6 py-4">Variant</th>
                    <th className="px-6 py-4">Fuel</th>
                    <th className="px-6 py-4">Transmission</th>
                    <th className="px-6 py-4">Engine</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {variants.map((variant) => {
                    const model = models.find(
                      (item) => item.id === variant.model_id
                    );

                    return (
                      <tr key={variant.id} className="hover:bg-orange-50/40">
                        <td className="px-6 py-4 font-semibold">
                          {model?.name || "Unknown model"}
                        </td>

                        <td className="px-6 py-4">
                          {variant.variant_name}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {variant.fuel_type}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {variant.transmission}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {variant.engine_cc
                            ? `${variant.engine_cc} CC`
                            : "—"}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => editVariant(variant)}
                            className="font-semibold text-orange-600 hover:underline"
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
        </section>

        <footer className="py-8 text-center text-xs text-gray-400">
          © 2026 DriveX Dealership Management
        </footer>
      </div>
    </main>
  );
}

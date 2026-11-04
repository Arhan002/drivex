"use client";

import { useState } from "react";

type Showroom = {
  id: string;
  name: string;
  city: string;
};

type Consultant = {
  id: string;
  full_name: string;
  phone: string | null;
  showroom_id: string | null;
  created_at: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

export default function ConsultantManagement({
  showrooms,
  consultants,
}: {
  showrooms: Showroom[];
  consultants: Consultant[];
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [showroomId, setShowroomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/consultants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          showroomId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to create consultant.");
      }

      setMessage("Invitation sent successfully!");
      setFullName("");
      setEmail("");
      setShowroomId("");

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const assignedCount = consultants.filter((c) => c.showroom_id).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/60 via-[#f8f8f6] to-[#f8f8f6] px-4 py-8 text-[#202020] sm:px-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-700">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
              DriveX Administration
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Consultant Management
            </h1>
            <p className="mt-2 max-w-xl text-gray-500">
              Create consultant accounts and assign them to dealership
              showrooms.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 md:min-w-[360px]">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-bold">{consultants.length}</p>
              <p className="text-xs font-medium text-gray-500">Consultants</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-bold">{assignedCount}</p>
              <p className="text-xs font-medium text-gray-500">Assigned</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-bold">{showrooms.length}</p>
              <p className="text-xs font-medium text-gray-500">Showrooms</p>
            </div>
          </div>
        </header>

        {/* Add consultant */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold">Add New Consultant</h2>
            <p className="mt-1 text-sm text-gray-500">
              An invitation will be emailed so they can set up their account.
            </p>
          </div>

          <div className="p-6">
            {showrooms.length === 0 && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>
                  No active showrooms available. Add a showroom before inviting
                  consultants.
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter consultant name"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="consultant@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="showroom"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Assign Showroom
                </label>
                <select
                  id="showroom"
                  required
                  value={showroomId}
                  onChange={(e) => setShowroomId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select showroom</option>
                  {showrooms.map((showroom) => (
                    <option key={showroom.id} value={showroom.id}>
                      {showroom.name} - {showroom.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || showrooms.length === 0}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-600/20 transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && (
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  )}
                  {loading ? "Sending Invitation..." : "Send Invitation"}
                </button>
              </div>
            </form>

            {message && (
              <p
                role="status"
                className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700"
              >
                {message}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}
          </div>
        </section>

        {/* Existing consultants */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold">Existing Consultants</h2>
              <p className="mt-1 text-sm text-gray-500">
                Newest consultants appear first.
              </p>
            </div>
            <span className="rounded-full bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-700 ring-1 ring-orange-100">
              {consultants.length}{" "}
              {consultants.length === 1 ? "consultant" : "consultants"}
            </span>
          </div>

          {consultants.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              </div>
              <p className="mt-4 font-semibold text-gray-800">
                No consultants found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Invite your first consultant using the form above.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-3 font-semibold">Name</th>
                      <th className="px-6 py-3 font-semibold">Phone</th>
                      <th className="px-6 py-3 font-semibold">Showroom</th>
                      <th className="px-6 py-3 font-semibold">Joined</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {consultants.map((consultant) => {
                      const showroom = showrooms.find(
                        (item) => item.id === consultant.showroom_id
                      );

                      return (
                        <tr
                          key={consultant.id}
                          className="transition hover:bg-orange-50/40"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                                {getInitials(consultant.full_name)}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {consultant.full_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {consultant.phone || (
                              <span className="text-gray-400">
                                Not provided
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {showroom ? (
                              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                {showroom.name}
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                                Not assigned
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(consultant.created_at).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="divide-y divide-gray-100 md:hidden">
                {consultants.map((consultant) => {
                  const showroom = showrooms.find(
                    (item) => item.id === consultant.showroom_id
                  );

                  return (
                    <li key={consultant.id} className="p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                          {getInitials(consultant.full_name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
                            {consultant.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {consultant.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                        {showroom ? (
                          <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                            {showroom.name}
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
                            Not assigned
                          </span>
                        )}
                        <span className="text-gray-500">
                          Joined{" "}
                          {new Date(consultant.created_at).toLocaleDateString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
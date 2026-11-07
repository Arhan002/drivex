import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import BookingStatusControl from "@/components/BookingStatusControl";

export const instant = false;

type SearchParams = {
  q?: string;
  status?: string;
};

type Booking = {
  id: string;
  buyer_id: string | null;
  lead_id: string;
  showroom_id: string;
  demo_vehicle_id: string;
  scheduled_at: string;
  status: string;
  created_at: string;
};

type Lead = {
  id: string;
  buyer_name: string;
  email: string;
  phone: string;
  showroom_id: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

export default async function TestDrivesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await connection();

  const { q = "", status: selectedStatus = "all" } = await searchParams;
  const supabase = await createClient();

  // Use the same authentication and profile checks as the working dashboard.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Test Drive Management authentication failed:", authError);
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, showroom_id")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !["consultant", "admin"].includes(profile.role)
  ) {
    console.error("Test Drive Management profile check failed:", {
      userId: user.id,
      profileError,
      profile,
    });
    redirect("/login");
  }

  let bookings: Booking[] = [];
  let errorMessage = "";

  if (profile.role === "admin") {
    // RLS determines which bookings this Admin is authorised to retrieve.
    const { data, error } = await supabase
      .from("test_drive_bookings")
      .select(
        "id, buyer_id, lead_id, showroom_id, demo_vehicle_id, scheduled_at, status, created_at"
      )
      .order("scheduled_at", { ascending: false });

    if (error) errorMessage = error.message;
    else bookings = (data ?? []) as Booking[];
  } else {
    // Consultants start with their own lead assignments.
    const { data: assignmentRows, error: assignmentError } = await supabase
      .from("lead_assignments")
      .select("lead_id")
      .eq("consultant_id", user.id);

    if (assignmentError) {
      errorMessage = assignmentError.message;
    } else {
      const leadIds = [...new Set((assignmentRows ?? []).map((row) => row.lead_id))];

      if (leadIds.length > 0) {
        const { data, error } = await supabase
          .from("test_drive_bookings")
          .select(
            "id, buyer_id, lead_id, showroom_id, demo_vehicle_id, scheduled_at, status, created_at"
          )
          .in("lead_id", leadIds)
          .order("scheduled_at", { ascending: false });

        if (error) errorMessage = error.message;
        else bookings = (data ?? []) as Booking[];
      }
    }
  }

  const leadIdsForDetails = [...new Set(bookings.map((booking) => booking.lead_id))];
  const { data: leadRows, error: leadError } = leadIdsForDetails.length
    ? await supabase
        .from("leads")
        .select("id, buyer_name, email, phone, showroom_id")
        .in("id", leadIdsForDetails)
    : { data: [], error: null };

  if (leadError && !errorMessage) errorMessage = leadError.message;

  const leadMap = new Map<string, Lead>(
    ((leadRows ?? []) as Lead[]).map((lead) => [lead.id, lead])
  );

  const showroomIds = [...new Set(bookings.map((booking) => booking.showroom_id))];
  const { data: showroomRows } = showroomIds.length
    ? await supabase.from("showrooms").select("id, name").in("id", showroomIds)
    : { data: [] };
  const showroomMap = new Map(
    (showroomRows ?? []).map((showroom) => [showroom.id, showroom.name])
  );

  const demoVehicleIds = [...new Set(bookings.map((booking) => booking.demo_vehicle_id))];
  const { data: demoVehicleRows } = demoVehicleIds.length
    ? await supabase
        .from("demo_vehicles")
        .select("id, variant_id")
        .in("id", demoVehicleIds)
    : { data: [] };
  const demoVehicleMap = new Map(
    (demoVehicleRows ?? []).map((vehicle) => [vehicle.id, vehicle.variant_id])
  );

  const variantIds = [
    ...new Set((demoVehicleRows ?? []).map((vehicle) => vehicle.variant_id)),
  ];
  const { data: variantRows } = variantIds.length
    ? await supabase
        .from("car_variants")
        .select("id, variant_name, model_id")
        .in("id", variantIds)
    : { data: [] };
  const variantMap = new Map(
    (variantRows ?? []).map((variant) => [variant.id, variant])
  );

  const modelIds = [
    ...new Set(
      (variantRows ?? [])
        .map((variant) => variant.model_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const { data: modelRows } = modelIds.length
    ? await supabase.from("car_models").select("id, name").in("id", modelIds)
    : { data: [] };
  const modelMap = new Map((modelRows ?? []).map((model) => [model.id, model.name]));

  // Show assignment information to Admin, including unassigned bookings.
  const { data: assignmentDetails } = leadIdsForDetails.length
    ? await supabase
        .from("lead_assignments")
        .select("lead_id, consultant_id")
        .in("lead_id", leadIdsForDetails)
    : { data: [] };
  const consultantIds = [
    ...new Set((assignmentDetails ?? []).map((item) => item.consultant_id)),
  ];
  const { data: consultantRows } = consultantIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", consultantIds)
    : { data: [] };
  const consultantMap = new Map(
    (consultantRows ?? []).map((consultant) => [consultant.id, consultant.full_name])
  );
  const assignmentMap = new Map(
    (assignmentDetails ?? []).map((assignment) => [
      assignment.lead_id,
      consultantMap.get(assignment.consultant_id) ?? "Assigned consultant",
    ])
  );

  const counts = {
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
    cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
  };

  const normalizedQuery = q.trim().toLowerCase();
  const filteredBookings = bookings.filter((booking) => {
    const lead = leadMap.get(booking.lead_id);
    const vehicle = demoVehicleMap.get(booking.demo_vehicle_id);
    const variant = vehicle ? variantMap.get(vehicle) : undefined;
    const modelName = variant?.model_id ? modelMap.get(variant.model_id) ?? "" : "";
    const variantName = variant?.variant_name ?? "";
    const showroomName = showroomMap.get(booking.showroom_id) ?? "";

    const matchesSearch =
      !normalizedQuery ||
      [
        lead?.buyer_name ?? "",
        lead?.email ?? "",
        lead?.phone ?? "",
        modelName,
        variantName,
        showroomName,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));

    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900">
      <main className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              <Link
                href="/dashboard"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                <span>←</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="hidden h-9 w-px bg-slate-200 sm:block" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                  DriveX CRM
                </p>
                <h1 className="truncate text-lg font-bold sm:text-xl">
                  Test Drive Management
                </h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="max-w-44 truncate text-sm font-semibold text-slate-800">
                  {profile.full_name || "DriveX Staff"}
                </p>
                <p className="text-xs capitalize text-slate-500">{profile.role}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-sm font-bold text-orange-700">
                {getInitials(profile.full_name || "DriveX")}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10">
          <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3.5 py-2 text-[11px] font-bold tracking-wide text-orange-700">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                CUSTOMER RELATIONSHIP MANAGEMENT
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-[42px]">
                Test Drive Bookings
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Review customer appointments, check vehicle availability details and manage booking statuses.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-500">Workspace access</p>
              <p className="mt-1 text-sm font-bold capitalize">{profile.role} view</p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total bookings", value: counts.total, description: "Authorised bookings", accent: "border-l-slate-800", icon: "▤", iconStyle: "bg-slate-100 text-slate-700" },
              { label: "Pending", value: counts.pending, description: "Awaiting confirmation", accent: "border-l-amber-500", icon: "◷", iconStyle: "bg-amber-50 text-amber-700" },
              { label: "Confirmed", value: counts.confirmed, description: "Scheduled appointments", accent: "border-l-emerald-500", icon: "✓", iconStyle: "bg-emerald-50 text-emerald-700" },
              { label: "Cancelled", value: counts.cancelled, description: "Cancelled appointments", accent: "border-l-red-500", icon: "×", iconStyle: "bg-red-50 text-red-700" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`group rounded-2xl border border-slate-200 border-l-4 ${stat.accent} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${stat.iconStyle}`}>
                    {stat.icon}
                  </span>
                </div>
                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950 tabular-nums">{stat.value}</p>
                <p className="mt-2 text-xs text-slate-400">{stat.description}</p>
              </div>
            ))}
          </section>

          <section className="mt-10">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600">Appointment workspace</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Customer Test Drives</h3>
                <p className="mt-1.5 text-sm text-slate-500">Bookings visible under your current staff permissions.</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {filteredBookings.length} of {bookings.length} bookings
              </span>
            </div>

            <form method="GET" action="/dashboard/test-drives" className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_210px_auto]">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">⌕</span>
                  <input
                    type="search"
                    name="q"
                    defaultValue={q}
                    placeholder="Search buyer, phone, email, vehicle or showroom..."
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>
                <select
                  name="status"
                  defaultValue={selectedStatus}
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="min-h-12 flex-1 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200">
                    Search
                  </button>
                  <Link href="/dashboard/test-drives" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
                    Reset
                  </Link>
                </div>
              </div>
            </form>

            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
                <p className="font-semibold text-red-800">Unable to load test-drive bookings</p>
                <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl text-orange-600">▣</div>
                <h4 className="mt-5 text-lg font-bold text-slate-900">
                  {bookings.length === 0 ? "No authorised bookings yet" : "No matching bookings"}
                </h4>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {bookings.length === 0
                    ? profile.role === "admin"
                      ? "Customer test-drive bookings will appear here when they are created."
                      : "Bookings linked to leads assigned to you will appear here."
                    : "Try changing your search term or status filter."}
                </p>
                <Link href="/dashboard/test-drives" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">
                  View all bookings
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredBookings.map((booking) => {
                  const lead = leadMap.get(booking.lead_id);
                  const vehicleVariantId = demoVehicleMap.get(booking.demo_vehicle_id);
                  const variant = vehicleVariantId ? variantMap.get(vehicleVariantId) : undefined;
                  const modelName = variant?.model_id ? modelMap.get(variant.model_id) : null;
                  const showroomName = showroomMap.get(booking.showroom_id) ?? "Showroom unavailable";
                  const assignedConsultant = assignmentMap.get(booking.lead_id);

                  return (
                    <article key={booking.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:shadow-lg">
                      <div className="p-5 sm:p-7">
                        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                          <div className="flex min-w-0 gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 text-lg font-bold text-orange-700 ring-1 ring-orange-100">
                              {getInitials(lead?.buyer_name || "Buyer")}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">{lead?.buyer_name || "Customer details unavailable"}</h4>
                                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[booking.status] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                                  {formatStatus(booking.status)}
                                </span>
                              </div>
                              {lead?.email && <p className="mt-2 break-all text-sm text-slate-500">{lead.email}</p>}
                              {lead?.phone && (
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                  <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-orange-600">
                                    <span className="text-orange-600">☎</span>{lead.phone}
                                  </a>
                                  {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-orange-600">✉ Email customer</a>}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm sm:grid-cols-2 xl:min-w-[390px]">
                            <div>
                              <p className="text-xs text-slate-400">Scheduled date & time</p>
                              <p className="mt-1 font-semibold text-slate-700">{formatDate(booking.scheduled_at)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Showroom</p>
                              <p className="mt-1 font-semibold text-slate-700">{showroomName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Booking created</p>
                              <p className="mt-1 font-semibold text-slate-700">{formatDate(booking.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Consultant assignment</p>
                              <p className="mt-1 font-semibold text-slate-700">{assignedConsultant ?? "Unassigned — Admin review"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50/80 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">Booked vehicle</p>
                            <p className="mt-1 text-base font-bold text-slate-900">
                              {modelName ?? "Vehicle model unavailable"}{variant?.variant_name ? ` · ${variant.variant_name}` : ""}
                            </p>
                          </div>
                          <span className="w-fit rounded-lg border border-orange-100 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                            Booking #{booking.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                          <div className="mb-3">
                            <h5 className="text-sm font-bold text-slate-900">Booking status</h5>
                            <p className="mt-1 text-xs text-slate-500">Update the appointment status. Your staff permissions are checked by the database.</p>
                          </div>
                          <BookingStatusControl bookingId={booking.id} currentStatus={booking.status} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <footer className="mt-12 border-t border-slate-200 py-7 text-center">
            <p className="text-xs text-slate-400">© 2026 DriveX Dealership Management. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}


import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type Lead = {
  id: string;
  buyer_name: string;
  status: string;
  interested_model_id: string | null;
  showroom_id: string | null;
  created_at: string;
};

const statusStyles: Record<string, string> = {
  new: "bg-orange-50 text-orange-700 ring-orange-200",
  contacted: "bg-blue-50 text-blue-700 ring-blue-200",
  qualified: "bg-purple-50 text-purple-700 ring-purple-200",
  test_drive_scheduled: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  converted: "bg-green-50 text-green-700 ring-green-200",
  lost: "bg-red-50 text-red-700 ring-red-200",
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Authenticate the user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch the user's profile
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
    redirect("/login");
  }

  const roleLabel =
    profile.role === "admin" ? "Administrator" : "Sales Consultant";

  // 3. Fetch leads according to the user's role
  let leads: Lead[] = [];

  if (profile.role === "admin") {
    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, buyer_name, status, interested_model_id, showroom_id, created_at"
      )
      .order("created_at", { ascending: false });

    if (!error) {
      leads = (data ?? []) as Lead[];
    }
  } else {
    const { data: assignments, error: assignmentError } = await supabase
      .from("lead_assignments")
      .select("lead_id")
      .eq("consultant_id", user.id);

    if (!assignmentError && assignments?.length) {
      const leadIds = assignments.map((item) => item.lead_id);

      const { data, error } = await supabase
        .from("leads")
        .select(
          "id, buyer_name, status, interested_model_id, showroom_id, created_at"
        )
        .in("id", leadIds)
        .order("created_at", { ascending: false });

      if (!error) {
        leads = (data ?? []) as Lead[];
      }
    }
  }

  // 4. Calculate live dashboard statistics
  const countByStatus = (status: string) =>
    leads.filter((lead) => lead.status === status).length;

  const stats = [
    {
      label: "Total Leads",
      value: leads.length,
      description: "Customer enquiries",
      icon: "👥",
      style: "bg-blue-50 text-blue-700",
      accent: "border-l-blue-500",
    },
    {
      label: "New Enquiries",
      value: countByStatus("new"),
      description: "Awaiting first contact",
      icon: "✦",
      style: "bg-orange-50 text-orange-700",
      accent: "border-l-orange-500",
    },
    {
      label: "Contacted",
      value: countByStatus("contacted"),
      description: "Customers reached",
      icon: "↗",
      style: "bg-purple-50 text-purple-700",
      accent: "border-l-purple-500",
    },
    {
      label: "Converted",
      value: countByStatus("converted"),
      description: "Successful conversions",
      icon: "✓",
      style: "bg-green-50 text-green-700",
      accent: "border-l-green-500",
    },
  ];

  // 5. Fetch related showroom and model names
  const showroomIds = [
    ...new Set(
      leads
        .map((lead) => lead.showroom_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const modelIds = [
    ...new Set(
      leads
        .map((lead) => lead.interested_model_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const [{ data: showrooms }, { data: models }] = await Promise.all([
    showroomIds.length
      ? supabase.from("showrooms").select("id, name").in("id", showroomIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),

    modelIds.length
      ? supabase.from("car_models").select("id, name").in("id", modelIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const showroomMap = new Map(
    (showrooms ?? []).map((item) => [item.id, item.name])
  );

  const modelMap = new Map(
    (models ?? []).map((item) => [item.id, item.name])
  );

  const recentLeads = leads.slice(0, 5);

  const initials = profile.full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-gray-900">
      {/* Main workspace */}
      <div className="min-h-screen">
        {/* Top navigation */}
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-9">
            <div>
              <p className="text-xs text-gray-400">Workspace / Overview</p>
              <h2 className="mt-0.5 text-base font-bold">Sales Dashboard</h2>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/"
                className="hidden rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-orange-400 hover:text-orange-600 sm:inline-flex"
              >
                View Website ↗
              </Link>

              <div className="flex items-center gap-2.5 border-l border-gray-200 pl-3 sm:pl-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                  {initials || "DX"}
                </div>

                <div className="hidden sm:block">
                  <p className="max-w-36 truncate text-sm font-semibold">
                    {profile.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{roleLabel}</p>
                </div>
              </div>
            </div>
          </div>

        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-9">
          {/* Welcome section */}
          <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                Dealership Overview
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Welcome back, {profile.full_name.split(" ")[0]}!
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Here&apos;s what&apos;s happening with your customer enquiries.
                Keep track of your leads and stay on top of every opportunity.
              </p>
            </div>

            <Link
              href="/cars"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              <span className="text-lg">+</span>
              Explore Inventory
            </Link>
          </section>

          {/* KPI cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border border-gray-200 border-l-4 ${stat.accent} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>

                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${stat.style}`}
                  >
                    {stat.icon}
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-tight tabular-nums">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {stat.description}
                </p>
              </div>
            ))}
          </section>

          {/* Pipeline and quick actions */}
          <section className="mt-7 grid gap-6 xl:grid-cols-3">
            {/* Lead pipeline */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Lead Pipeline</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Current distribution of your customer enquiries
                  </p>
                </div>

                <Link
                  href="/dashboard/leads"
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  View inbox →
                </Link>
              </div>

              <div className="mt-7 space-y-5">
                {[
                  { label: "New", status: "new", color: "bg-orange-500" },
                  {
                    label: "Contacted",
                    status: "contacted",
                    color: "bg-blue-500",
                  },
                  {
                    label: "Qualified",
                    status: "qualified",
                    color: "bg-purple-500",
                  },
                  {
                    label: "Test Drive Scheduled",
                    status: "test_drive_scheduled",
                    color: "bg-indigo-500",
                  },
                  {
                    label: "Converted",
                    status: "converted",
                    color: "bg-green-500",
                  },
                  { label: "Lost", status: "lost", color: "bg-red-400" },
                ].map((item) => {
                  const count = countByStatus(item.status);
                  const percentage =
                    leads.length > 0 ? (count / leads.length) * 100 : 0;

                  return (
                    <div key={item.status}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-gray-700">
                          {item.label}
                        </span>
                        <span className="font-semibold tabular-nums text-gray-900">
                          {count}
                        </span>
                      </div>

                      <div
                        className="h-2 overflow-hidden rounded-full bg-gray-100"
                        role="progressbar"
                        aria-label={`${item.label} leads`}
                        aria-valuenow={count}
                        aria-valuemin={0}
                        aria-valuemax={leads.length || 1}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {leads.length === 0 && (
                <p className="mt-5 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                  No lead activity yet. New enquiries will appear here.
                </p>
              )}
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold">Quick Actions</h2>
              <p className="mt-1 text-sm text-gray-500">
                Your frequently used tools
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: "Lead Inbox",
                    description: "Review and manage enquiries",
                    href: "/dashboard/leads",
                    icon: "☷",
                  },
                  {
                    title: "Follow-ups",
                    description: "Track customer reminders",
                    href: "/dashboard/follow-ups",
                    icon: "◷",
                  },
                  {
                    title: "New Car Inventory",
                    description: "Explore new car models",
                    href: "/cars",
                    icon: "🚘",
                  },
                  {
                    title: "Used Cars",
                    description: "Browse pre-owned vehicles",
                    href: "/used-cars",
                    icon: "🚙",
                  },
                  {
                    title: "Book Test Drive",
                    description: "Open the booking experience",
                    href: "/book-test-drive",
                    icon: "▣",
                  },
                ].map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group flex min-h-[66px] items-center gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-orange-200 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg transition group-hover:bg-orange-100">
                      {action.icon}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-gray-800">
                        {action.title}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {action.description}
                      </span>
                    </span>

                    <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-orange-600">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Recent enquiries */}
          <section className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="text-lg font-bold">Recent Enquiries</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your latest customer enquiries
                </p>
              </div>

              <Link
                href="/dashboard/leads"
                className="inline-flex min-h-10 items-center text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                View all leads →
              </Link>
            </div>

            {recentLeads.length > 0 ? (
              <>
                {/* Mobile-friendly enquiry cards */}
                <div className="divide-y divide-gray-100 md:hidden">
                  {recentLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/dashboard/leads?leadId=${lead.id}#lead-${lead.id}`}
                      className="block p-5 transition hover:bg-orange-50/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {lead.buyer_name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {lead.interested_model_id
                              ? modelMap.get(lead.interested_model_id) ??
                                "Model enquiry"
                              : "General enquiry"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                            statusStyles[lead.status] ??
                            "bg-gray-100 text-gray-600 ring-gray-200"
                          }`}
                        >
                          {formatStatus(lead.status)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-500">
                        <span className="truncate">
                          {lead.showroom_id
                            ? showroomMap.get(lead.showroom_id) ?? "Showroom"
                            : "Not assigned"}
                        </span>
                        <span className="shrink-0">
                          {formatDate(lead.created_at)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Desktop enquiry table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Customer</th>
                        <th className="px-6 py-4 font-semibold">
                          Interested In
                        </th>
                        <th className="px-6 py-4 font-semibold">Showroom</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {recentLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="transition hover:bg-orange-50/40"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">
                              {lead.buyer_name}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              Customer enquiry
                            </p>
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {lead.interested_model_id
                              ? modelMap.get(lead.interested_model_id) ??
                                "Model enquiry"
                              : "General enquiry"}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {lead.showroom_id
                              ? showroomMap.get(lead.showroom_id) ?? "Showroom"
                              : "Not assigned"}
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {formatDate(lead.created_at)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                                statusStyles[lead.status] ??
                                "bg-gray-100 text-gray-600 ring-gray-200"
                              }`}
                            >
                              {formatStatus(lead.status)}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <Link
                              href={`/dashboard/leads?leadId=${lead.id}#lead-${lead.id}`}
                              className="font-semibold text-orange-600 hover:text-orange-700"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="px-5 py-14 text-center sm:px-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                  ☷
                </div>
                <h3 className="mt-4 font-semibold text-gray-800">
                  No enquiries yet
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Customer enquiries assigned to you will appear here.
                </p>
                <Link
                  href="/dashboard/leads"
                  className="mt-4 inline-flex font-semibold text-orange-600 hover:underline"
                >
                  Open Lead Inbox →
                </Link>
              </div>
            )}
          </section>

          <footer className="py-8 text-center text-xs text-gray-400">
            © 2026 DriveX Dealership Management
          </footer>
        </main>
      </div>
    </div>
  );
}

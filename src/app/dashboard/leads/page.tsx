
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

import LeadFollowup from "@/components/LeadFollowup";
import LeadStatusControl from "@/components/LeadStatusControl";
import BuyerSummary from "@/components/BuyerSummary";
import LeadResponseDraft from "@/components/LeadResponseDraft";

export const instant = false;

type Lead = {
  id: string;
  buyer_name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  showroom_id: string;
  interested_model_id: string | null;
  fuel_preference: string | null;
  transmission_preference: string | null;
  budget: string | null;
  purchase_timeline: string | null;
  created_at: string;
};

type Assignment = {
  lead_id: string;
  assigned_at: string;
  response_due_at: string;
  first_contacted_at: string | null;
};

type SearchParams = {
  leadId?: string;
  q?: string;
  status?: string;
};

const statusStyles: Record<string, string> = {
  new: "bg-orange-50 text-orange-700 ring-orange-200",
  contacted: "bg-blue-50 text-blue-700 ring-blue-200",
  qualified: "bg-purple-50 text-purple-700 ring-purple-200",
  test_drive_scheduled: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  converted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  lost: "bg-red-50 text-red-700 ring-red-200",
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

function getResponseInfo(assignment?: Assignment) {
  if (!assignment) {
    return {
      label: "Assignment details unavailable",
      description: "Response deadline not available",
      style: "bg-slate-100 text-slate-600",
      icon: "○",
    };
  }

  if (assignment.first_contacted_at) {
    return {
      label: "First contact completed",
      description: `Contacted ${formatDate(assignment.first_contacted_at)}`,
      style: "bg-emerald-50 text-emerald-700",
      icon: "✓",
    };
  }

  const deadline = new Date(assignment.response_due_at).getTime();
  const remaining = deadline - Date.now();

  if (remaining <= 0) {
    return {
      label: "Response overdue",
      description: "This enquiry needs attention",
      style: "bg-red-50 text-red-700",
      icon: "!",
    };
  }

  const minutes = Math.ceil(remaining / 60000);

  return {
    label: "Response pending",
    description: `${minutes} minute${minutes === 1 ? "" : "s"} remaining`,
    style:
      minutes <= 2
        ? "bg-amber-50 text-amber-700"
        : "bg-blue-50 text-blue-700",
    icon: "◷",
  };
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await connection();

  const {
    leadId: selectedLeadId,
    q = "",
    status: selectedStatus = "all",
  } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !["consultant", "admin"].includes(profile.role)) {
    redirect("/login");
  }

  let leads: Lead[] = [];
  let assignments: Assignment[] = [];
  let errorMessage = "";

  // Admin retrieves all leads.
  if (profile.role === "admin") {
    const { data, error } = await supabase
      .from("leads")
      .select(`
        id,
        buyer_name,
        email,
        phone,
        status,
        source,
        showroom_id,
        interested_model_id,
        fuel_preference,
        transmission_preference,
        budget,
        purchase_timeline,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      errorMessage = error.message;
    } else {
      leads = (data ?? []) as Lead[];
    }
  } else {
    // Consultants retrieve only their assigned leads.
    const { data: assignmentData, error: assignmentError } =
      await supabase
        .from("lead_assignments")
        .select(
          "lead_id, assigned_at, response_due_at, first_contacted_at"
        )
        .eq("consultant_id", user.id)
        .order("assigned_at", { ascending: false });

    if (assignmentError) {
      errorMessage = assignmentError.message;
    } else {
      assignments = (assignmentData ?? []) as Assignment[];

      const leadIds = assignments.map((item) => item.lead_id);

      if (leadIds.length > 0) {
        const { data, error } = await supabase
          .from("leads")
          .select(`
            id,
            buyer_name,
            email,
            phone,
            status,
            source,
            showroom_id,
            interested_model_id,
            fuel_preference,
            transmission_preference,
            budget,
            purchase_timeline,
            created_at
          `)
          .in("id", leadIds)
          .order("created_at", { ascending: false });

        if (error) {
          errorMessage = error.message;
        } else {
          leads = (data ?? []) as Lead[];
        }
      }
    }
  }

  // Fetch showroom names.
  const showroomIds = [
    ...new Set(leads.map((lead) => lead.showroom_id)),
  ];

  const { data: showroomData } = showroomIds.length
    ? await supabase
        .from("showrooms")
        .select("id, name")
        .in("id", showroomIds)
    : { data: [] };

  const showroomMap = new Map(
    (showroomData ?? []).map((item) => [item.id, item.name])
  );

  // Fetch car model names.
  const modelIds = [
    ...new Set(
      leads
        .map((lead) => lead.interested_model_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const { data: modelData } = modelIds.length
    ? await supabase
        .from("car_models")
        .select("id, name")
        .in("id", modelIds)
    : { data: [] };

  const modelMap = new Map(
    (modelData ?? []).map((item) => [item.id, item.name])
  );

  // Summary counts use all authorized leads.
  const countByStatus = (value: string) =>
    leads.filter((lead) => lead.status === value).length;

  // Search and filter only authorized leads.
  const normalizedQuery = q.trim().toLowerCase();

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !normalizedQuery ||
      [
        lead.buyer_name,
        lead.email,
        lead.phone,
        modelMap.get(lead.interested_model_id ?? "") ?? "",
      ].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      );

    const matchesStatus =
      selectedStatus === "all" || lead.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Keep a selected lead at the top when it matches the current filter.
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (a.id === selectedLeadId) return -1;
    if (b.id === selectedLeadId) return 1;
    return 0;
  });

  const selectedLeadExists = leads.some(
    (lead) => lead.id === selectedLeadId
  );

  const stats = [
    {
      label: "Total leads",
      value: leads.length,
      description: "All customer enquiries",
      icon: "▤",
      accent: "border-l-slate-800",
      iconStyle: "bg-slate-100 text-slate-700",
    },
    {
      label: "New enquiries",
      value: countByStatus("new"),
      description: "Awaiting first contact",
      icon: "✦",
      accent: "border-l-orange-500",
      iconStyle: "bg-orange-50 text-orange-600",
    },
    {
      label: "Contacted",
      value: countByStatus("contacted"),
      description: "Conversations started",
      icon: "↗",
      accent: "border-l-blue-500",
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      label: "Converted",
      value: countByStatus("converted"),
      description: "Successful sales",
      icon: "✓",
      accent: "border-l-emerald-500",
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
  ];

  const overdueCount = assignments.filter(
    (item) =>
      !item.first_contacted_at &&
      new Date(item.response_due_at).getTime() < Date.now()
  ).length;

  return (
  <div className="min-h-screen bg-[#f5f6f8] text-slate-900">
    <main className="min-h-screen">
        {/* Top navigation */}
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
                  Lead Inbox
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="max-w-44 truncate text-sm font-semibold text-slate-800">
                  {profile.full_name || "DriveX Staff"}
                </p>
                <p className="text-xs capitalize text-slate-500">
                  {profile.role}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-sm font-bold text-orange-700">
                {getInitials(profile.full_name || "DriveX")}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10">
          {/* Page introduction */}
          <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3.5 py-2 text-[11px] font-bold tracking-wide text-orange-700">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                CUSTOMER RELATIONSHIP MANAGEMENT
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-[42px]">
                Welcome back, {profile.full_name || "Consultant"}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Manage customer enquiries, track conversations and turn
                potential buyers into happy customers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {overdueCount > 0 && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  {overdueCount} overdue response
                  {overdueCount === 1 ? "" : "s"}
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-500">Workspace access</p>
                <p className="mt-1 text-sm font-bold capitalize">
                  {profile.role} view
                </p>
              </div>
            </div>
          </section>

          {/* KPI cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`group rounded-2xl border border-slate-200 border-l-4 ${stat.accent} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${stat.iconStyle}`}
                  >
                    {stat.icon}
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950 tabular-nums">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            ))}
          </section>

          {/* Customer enquiries */}
          <section className="mt-10">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600">
                  Your customers
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Customer Enquiries
                </h3>

                <p className="mt-1.5 text-sm text-slate-500">
                  Every customer conversation, organised in one place.
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {filteredLeads.length} of {leads.length} leads
              </span>
            </div>

            {/* Search and filters */}
            <form
              method="GET"
              action="/dashboard/leads"
              className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              {selectedLeadId && (
                <input
                  type="hidden"
                  name="leadId"
                  value={selectedLeadId}
                />
              )}

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_210px_auto]">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                    ⌕
                  </span>

                  <input
                    type="search"
                    name="q"
                    defaultValue={q}
                    placeholder="Search customer name, email, phone or model..."
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <select
                  name="status"
                  defaultValue={selectedStatus}
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                >
                  <option value="all">All statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="test_drive_scheduled">
                    Test drive scheduled
                  </option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="min-h-12 flex-1 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
                  >
                    Search
                  </button>

                  <Link
                    href="/dashboard/leads"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Reset
                  </Link>
                </div>
              </div>
            </form>

            {/* Selected lead message */}
            {selectedLeadId && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-xl border p-4 ${
                  selectedLeadExists
                    ? "border-orange-200 bg-orange-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <span className="text-lg">
                  {selectedLeadExists ? "◎" : "!"}
                </span>

                <div>
                  <p
                    className={`text-sm font-semibold ${
                      selectedLeadExists
                        ? "text-orange-800"
                        : "text-red-800"
                    }`}
                  >
                    {selectedLeadExists
                      ? "Selected customer enquiry"
                      : "Lead not found in your authorized inbox"}
                  </p>

                  {selectedLeadExists && (
                    <p className="mt-1 text-xs text-orange-700">
                      The requested customer enquiry is highlighted below.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Errors */}
            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
                <p className="font-semibold text-red-800">
                  Unable to load customer enquiries
                </p>
                <p className="mt-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>
            ) : sortedLeads.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl text-orange-600">
                  ♧
                </div>

                <h4 className="mt-5 text-lg font-bold text-slate-900">
                  {leads.length === 0
                    ? "No assigned leads yet"
                    : "No matching enquiries"}
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {leads.length === 0
                    ? "New customer enquiries assigned to you will appear here."
                    : "Try changing your search term or status filter."}
                </p>

                <Link
                  href="/dashboard/leads"
                  className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  View all leads
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedLeads.map((lead) => {
                  const assignment = assignments.find(
                    (item) => item.lead_id === lead.id
                  );

                  const isSelected = lead.id === selectedLeadId;
                  const responseInfo = getResponseInfo(assignment);

                  const preferences = [
                    {
                      label: "Fuel preference",
                      value: lead.fuel_preference,
                      icon: "⛽",
                    },
                    {
                      label: "Transmission",
                      value: lead.transmission_preference,
                      icon: "⚙",
                    },
                    {
                      label: "Budget",
                      value: lead.budget,
                      icon: "₹",
                    },
                    {
                      label: "Purchase timeline",
                      value: lead.purchase_timeline,
                      icon: "◷",
                    },
                  ];

                  const modelName = lead.interested_model_id
                    ? modelMap.get(lead.interested_model_id) ?? "New car"
                    : "Used car enquiry";

                  return (
                    <article
                      key={lead.id}
                      id={`lead-${lead.id}`}
                      className={`scroll-mt-28 overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:shadow-lg ${
                        isSelected
                          ? "border-orange-400 ring-2 ring-orange-100"
                          : "border-slate-200"
                      }`}
                    >
                      {/* Lead identity */}
                      <div className="p-5 sm:p-7">
                        {isSelected && (
                          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-[11px] font-bold tracking-wide text-orange-700">
                            ◎ SELECTED CUSTOMER
                          </div>
                        )}

                        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
                          {/* Customer details */}
                          <div className="flex min-w-0 gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 text-lg font-bold text-orange-700 ring-1 ring-orange-100">
                              {getInitials(lead.buyer_name)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
                                  {lead.buyer_name}
                                </h4>

                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${
                                    statusStyles[lead.status] ??
                                    "bg-slate-100 text-slate-700 ring-slate-200"
                                  }`}
                                >
                                  {formatStatus(lead.status)}
                                </span>
                              </div>

                              <p className="mt-2 break-all text-sm text-slate-500">
                                {lead.email}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-3">
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-orange-600"
                                >
                                  <span className="text-orange-600">☎</span>
                                  {lead.phone}
                                </a>

                                <a
                                  href={`mailto:${lead.email}`}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-orange-600"
                                >
                                  ✉ Email customer
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Enquiry information */}
                          <div className="grid gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm sm:grid-cols-2 xl:min-w-[390px]">
                            <div>
                              <p className="text-xs text-slate-400">
                                Enquiry received
                              </p>
                              <p className="mt-1 font-semibold text-slate-700">
                                {formatDate(lead.created_at)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-400">
                                Showroom
                              </p>
                              <p className="mt-1 font-semibold text-slate-700">
                                {showroomMap.get(lead.showroom_id) ??
                                  "Not available"}
                              </p>
                            </div>

                            {assignment && (
                              <>
                                <div>
                                  <p className="text-xs text-slate-400">
                                    Assigned
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-700">
                                    {formatDate(assignment.assigned_at)}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-400">
                                    Response deadline
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-700">
                                    {formatDate(assignment.response_due_at)}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Response indicator */}
                        {assignment && (
                          <div
                            className={`mt-5 flex flex-col gap-2 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${responseInfo.style}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold">
                                {responseInfo.icon}
                              </span>
                              <span className="text-sm font-semibold">
                                {responseInfo.label}
                              </span>
                            </div>

                            <span className="text-xs font-medium opacity-80">
                              {responseInfo.description}
                            </span>
                          </div>
                        )}

                        {/* Vehicle interest */}
                        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50/80 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                              Vehicle of interest
                            </p>
                            <p className="mt-1 text-base font-bold text-slate-900">
                              {modelName}
                            </p>
                          </div>

                          <span className="w-fit rounded-lg border border-orange-100 bg-white px-3 py-2 text-xs font-semibold capitalize text-slate-600">
                            {lead.source.replaceAll("_", " ")}
                          </span>
                        </div>

                        {/* Buyer preferences */}
                        <div className="mt-7">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <h5 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                              Customer preferences
                            </h5>
                            <span className="text-xs text-slate-400">
                              Buyer requirements
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {preferences.map((item) => (
                              <div
                                key={item.label}
                                className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-orange-100 hover:bg-orange-50/40"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-orange-600">
                                    {item.icon}
                                  </span>
                                  <p className="text-xs font-medium text-slate-400">
                                    {item.label}
                                  </p>
                                </div>

                                <p className="mt-2 break-words text-sm font-bold text-slate-800">
                                  {item.value || "Not specified"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status control */}
                        <div className="mt-7 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                          <div className="mb-4">
                            <h5 className="text-sm font-bold text-slate-900">
                              Lead progress
                            </h5>
                            <p className="mt-1 text-xs text-slate-500">
                              Update the customer&apos;s current sales stage.
                            </p>
                          </div>

                          <LeadStatusControl
                            leadId={lead.id}
                            currentStatus={lead.status}
                          />
                        </div>
                      </div>

                      {/* Follow-up accordion */}
                      <details className="group border-t border-slate-100">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 transition hover:bg-slate-50 sm:px-7">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
                              ◷
                            </span>

                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-900">
                                Follow-up & conversation history
                              </h5>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Schedule callbacks and manage customer
                                conversations.
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 text-xl text-slate-400 transition-transform group-open:rotate-180">
                            ⌄
                          </span>
                        </summary>

                        <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-7">
                          <LeadFollowup leadId={lead.id} />
                        </div>
                      </details>

                      {/* AI first-response accordion */}
                      <details className="group border-t border-slate-100">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 transition hover:bg-orange-50/40 sm:px-7">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg text-orange-600">
                              ✦
                            </span>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h5 className="font-bold text-slate-900">
                                  AI First-Response Draft
                                </h5>
                                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                                  AI POWERED
                                </span>
                              </div>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Generate, personalise, edit and approve
                                customer messages.
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 text-xl text-slate-400 transition-transform group-open:rotate-180">
                            ⌄
                          </span>
                        </summary>

                        <div className="border-t border-slate-100 bg-orange-50/20 p-5 sm:p-7">
                          <LeadResponseDraft leadId={lead.id} />
                        </div>
                      </details>

                      {/* AI buyer intelligence accordion */}
                      <details className="group border-t border-slate-100">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 transition hover:bg-purple-50/30 sm:px-7">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-lg text-purple-600">
                              ◈
                            </span>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h5 className="font-bold text-slate-900">
                                  AI Buyer Intelligence
                                </h5>
                                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                                  AI POWERED
                                </span>
                              </div>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Analyse customer interest and identify the
                                next best action.
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 text-xl text-slate-400 transition-transform group-open:rotate-180">
                            ⌄
                          </span>
                        </summary>

                        <div className="border-t border-slate-100 bg-purple-50/20 p-5 sm:p-7">
                          <BuyerSummary leadId={lead.id} />
                        </div>
                      </details>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="mt-12 border-t border-slate-200 py-7 text-center">
            <p className="text-xs text-slate-400">
              © 2026 DriveX Dealership Management. All rights reserved.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
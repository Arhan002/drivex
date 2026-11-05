
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type Status = "Overdue" | "Upcoming" | "Completed";
type Filter = "all" | "overdue" | "upcoming" | "completed";

type FollowUp = {
  id: string;
  lead_id: string;
  note: string;
  follow_up_at: string | null;
  created_at: string;
  completed_at: string | null;
};

type Lead = {
  id: string;
  buyer_name: string;
  phone: string | null;
  status: string;
};


const styles: Record<
  Status,
  { badge: string; bar: string; icon: string; title: string }
> = {
  Overdue: {
    badge: "bg-red-100 text-red-700",
    bar: "bg-red-500",
    icon: "🔥",
    title: "Needs immediate attention",
  },
  Upcoming: {
    badge: "bg-orange-100 text-orange-700",
    bar: "bg-orange-500",
    icon: "⏳",
    title: "Scheduled callbacks",
  },
  Completed: {
    badge: "bg-green-100 text-green-700",
    bar: "bg-green-500",
    icon: "✓",
    title: "Successfully completed",
  },
};

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ReminderCard({
  item,
  lead,
  status,
}: {
  item: FollowUp;
  lead: Lead | undefined;
  status: Status;
}) {
  const style = styles[status];

  const initials = (lead?.buyer_name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <article className="group flex min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
      <div className={`w-1.5 shrink-0 ${style.bar}`} />

      <div className="min-w-0 flex-1 p-4 sm:p-5">
        {/* Customer details */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
              {initials}
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-bold text-gray-900">
                {lead?.buyer_name ?? "Unknown customer"}
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Lead status:{" "}
                <span className="font-medium text-gray-700">
                  {formatStatus(lead?.status ?? "unknown")}
                </span>
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
          >
            {status}
          </span>
        </div>

        {/* Note */}
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Follow-up note
          </p>

          <p className="mt-2 break-words text-sm leading-6 text-gray-700">
            {item.note || "No note added."}
          </p>
        </div>

        {/* Schedule information */}
        <div className="mt-4 space-y-2 text-sm text-gray-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>🕒</span>
            <span>
              Scheduled:{" "}
              <span className="font-medium text-gray-700">
                {formatDate(item.follow_up_at)}
              </span>
            </span>
          </div>

          {item.completed_at && (
            <div className="flex flex-wrap items-center gap-2">
              <span>✅</span>
              <span>
                Completed:{" "}
                <span className="font-medium text-gray-700">
                  {formatDate(item.completed_at)}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          {lead?.phone && (
            <a
              href={`tel:${lead.phone}`}
              aria-label={`Call ${lead.buyer_name}`}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <span>☎</span>
              Call Customer
            </a>
          )}

          <Link
            href={`/dashboard/leads?leadId=${item.lead_id}#lead-${item.lead_id}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            View Lead
            <span>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function Section({
  title,
  status,
  items,
  leadMap,
  emptyText,
}: {
  title: string;
  status: Status;
  items: FollowUp[];
  leadMap: Map<string, Lead>;
  emptyText: string;
}) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">
            {title}
          </h2>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status].badge}`}
          >
            {items.length}
          </span>
        </div>

        <p className="text-xs text-gray-400">{styles[status].title}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-6 text-center">
  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-xl">
    {styles[status].icon}
  </div>

  <p className="mt-2 text-sm font-semibold text-gray-700">
    {emptyText}
  </p>

  <p className="mt-1 text-xs text-gray-400">
    Your reminder activity will appear here.
  </p>
</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <ReminderCard
              key={item.id}
              item={item}
              lead={leadMap.get(item.lead_id)}
              status={status}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;

  const allowedFilters: Filter[] = [
    "all",
    "overdue",
    "upcoming",
    "completed",
  ];

  const filter: Filter = allowedFilters.includes(params.filter as Filter)
    ? (params.filter as Filter)
    : "all";

  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Verify staff profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !["consultant", "admin"].includes(profile.role)) {
    redirect("/login");
  }

  const displayName =
    profile.full_name || user.email?.split("@")[0] || "Consultant";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word: string) => word[0])
    .join("")
    .toUpperCase();

  // 3. Fetch reminders through existing RLS permissions
  const { data: followups, error } = await supabase
    .from("lead_followups")
    .select("id, lead_id, note, follow_up_at, created_at, completed_at")
    .order("follow_up_at", { ascending: true, nullsFirst: false });

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-5">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-red-700">
            Unable to load follow-ups
          </h2>
          <p className="mt-2 break-words text-sm text-gray-600">
            {error.message}
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex font-semibold text-orange-600"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const reminders: FollowUp[] = followups ?? [];
  const now = new Date();

  // 4. Categorise reminders
  const overdue = reminders
    .filter(
      (item) =>
        !item.completed_at &&
        item.follow_up_at &&
        new Date(item.follow_up_at) < now
    )
    .sort(
      (a, b) =>
        new Date(a.follow_up_at!).getTime() -
        new Date(b.follow_up_at!).getTime()
    );

  const upcoming = reminders
    .filter(
      (item) =>
        !item.completed_at &&
        item.follow_up_at &&
        new Date(item.follow_up_at) >= now
    )
    .sort(
      (a, b) =>
        new Date(a.follow_up_at!).getTime() -
        new Date(b.follow_up_at!).getTime()
    );

  const completed = reminders
    .filter((item) => Boolean(item.completed_at))
    .sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() -
        new Date(a.completed_at!).getTime()
    );

  const leadIds = [...new Set(reminders.map((item) => item.lead_id))];

  // 5. Fetch associated leads
  const { data: leads } = leadIds.length
    ? await supabase
        .from("leads")
        .select("id, buyer_name, phone, status")
        .in("id", leadIds)
    : { data: [] as Lead[] };

  const leadMap = new Map<string, Lead>(
    (leads ?? []).map((lead) => [lead.id, lead as Lead])
  );

  // 6. Dashboard statistics
  const stats = [
    {
      label: "Overdue",
      value: overdue.length,
      hint: "Needs action now",
      icon: "🔥",
      box: "bg-red-50 text-red-700",
      border: "border-t-red-500",
    },
    {
      label: "Upcoming",
      value: upcoming.length,
      hint: "Scheduled callbacks",
      icon: "⏳",
      box: "bg-orange-50 text-orange-700",
      border: "border-t-orange-500",
    },
    {
      label: "Completed",
      value: completed.length,
      hint: "Successfully completed",
      icon: "✓",
      box: "bg-green-50 text-green-700",
      border: "border-t-green-500",
    },
  ];

  const filterOptions: { label: string; value: Filter; count: number }[] = [
    { label: "All reminders", value: "all", count: reminders.length },
    { label: "Overdue", value: "overdue", count: overdue.length },
    { label: "Upcoming", value: "upcoming", count: upcoming.length },
    { label: "Completed", value: "completed", count: completed.length },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-gray-900">
      {/* Main workspace */}
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-9">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Link
                href="/dashboard"
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <span>←</span>
                <span className="hidden xs:inline">Back</span>
              </Link>

              <div className="min-w-0">
                <p className="hidden text-xs text-gray-500 sm:block">
                  Workspace / Follow-ups
                </p>
                <h2 className="truncate text-sm font-bold sm:mt-1 sm:text-lg">
                  Follow-up Reminders
                </h2>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                {initials}
              </div>

              <div className="hidden sm:block">
                <p className="max-w-40 truncate text-sm font-semibold">
                  {displayName}
                </p>
                <p className="text-xs capitalize text-gray-500">
                  {profile.role}
                </p>
              </div>
            </div>
          </div>

        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-9">
          {/* Page introduction */}
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
              Customer Callbacks
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Follow-up Reminders
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Manage customer callbacks, track scheduled conversations and
              make sure every enquiry receives timely attention.
            </p>
          </section>

          {/* Statistics */}
          <section
            aria-label="Follow-up statistics"
            className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border border-gray-200 border-t-4 ${stat.border} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>

                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${stat.box}`}
                  >
                    {stat.icon}
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-tight tabular-nums">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-gray-500">{stat.hint}</p>
              </div>
            ))}
          </section>

          {/* Filters */}
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-gray-900">Reminder Activity</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Filter your reminders by their current status.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <Link
                    key={option.value}
                    href={
                      option.value === "all"
                        ? "/dashboard/follow-ups"
                        : `/dashboard/follow-ups?filter=${option.value}`
                    }
                    aria-current={filter === option.value ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                      filter === option.value
                        ? "bg-orange-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-700"
                    }`}
                  >
                    {option.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                        filter === option.value
                          ? "bg-white/20 text-white"
                          : "bg-white text-gray-600"
                      }`}
                    >
                      {option.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Reminder sections */}
          {(filter === "all" || filter === "overdue") && (
            <Section
              title="Overdue Follow-ups"
              status="Overdue"
              items={overdue}
              leadMap={leadMap}
              emptyText="No overdue follow-ups. You're on top of things!"
            />
          )}

          {(filter === "all" || filter === "upcoming") && (
            <Section
              title="Upcoming Follow-ups"
              status="Upcoming"
              items={upcoming}
              leadMap={leadMap}
              emptyText="No upcoming follow-ups scheduled."
            />
          )}

          {(filter === "all" || filter === "completed") && (
            <Section
              title="Completed Follow-ups"
              status="Completed"
              items={completed}
              leadMap={leadMap}
              emptyText="No completed follow-ups yet."
            />
          )}

          <footer className="py-9 text-center text-xs text-gray-400">
            © 2026 DriveX Dealership Management. All rights reserved.
          </footer>
        </main>
      </div>
    </div>
  );
}

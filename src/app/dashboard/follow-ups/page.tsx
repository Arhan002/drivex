
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function FollowUpsPage() {
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

  const { data: followups, error } = await supabase
    .from("lead_followups")
    .select(`
      id,
      lead_id,
      note,
      follow_up_at,
      created_at,
      completed_at
    `)
    .order("follow_up_at", { ascending: true });

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Unable to load follow-ups: {error.message}
      </div>
    );
  }

  const reminders = followups ?? [];
  const now = new Date();

  const overdue = reminders.filter(
    (item) =>
      !item.completed_at &&
      item.follow_up_at &&
      new Date(item.follow_up_at) < now
  );

  const upcoming = reminders.filter(
    (item) =>
      !item.completed_at &&
      item.follow_up_at &&
      new Date(item.follow_up_at) >= now
  );

  const completed = reminders.filter(
    (item) => Boolean(item.completed_at)
  );

  const leadIds = [...new Set(reminders.map((item) => item.lead_id))];

  const { data: leads } = leadIds.length
    ? await supabase
        .from("leads")
        .select("id, buyer_name, phone, status")
        .in("id", leadIds)
    : { data: [] };

  const leadMap = new Map(
    (leads ?? []).map((lead) => [lead.id, lead])
  );

  function formatDate(value: string | null) {
    if (!value) return "Not scheduled";

    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  }

  function ReminderCard({
    item,
    status,
  }: {
    item: (typeof reminders)[number];
    status: "Overdue" | "Upcoming" | "Completed";
  }) {
    const lead = leadMap.get(item.lead_id);

    const badgeStyle =
      status === "Overdue"
        ? "bg-red-100 text-red-700"
        : status === "Upcoming"
        ? "bg-orange-100 text-orange-700"
        : "bg-green-100 text-green-700";

    return (
      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-gray-900">
            {lead?.buyer_name ?? "Unknown customer"}
          </h3>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle}`}
          >
            {status}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-700">
          {item.note}
        </p>

        <div className="mt-4 space-y-1 text-sm text-gray-500">
          <p>Phone: {lead?.phone ?? "Not available"}</p>
          <p>Lead status: {lead?.status ?? "Unknown"}</p>
          <p>Scheduled: {formatDate(item.follow_up_at)}</p>

          {item.completed_at && (
            <p>
              Completed: {formatDate(item.completed_at)}
            </p>
          )}
        </div>

        <Link
  href={`/dashboard/leads?leadId=${item.lead_id}`}
  className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
>
  View This Lead →
</Link>
      </article>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Follow-up Reminders
          </h1>

          <p className="mt-2 text-gray-500">
            Manage customer callbacks and scheduled conversations.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              Overdue
            </p>
            <p className="mt-2 text-3xl font-bold text-red-800">
              {overdue.length}
            </p>
          </div>

          <div className="rounded-xl bg-orange-50 p-5">
            <p className="text-sm font-medium text-orange-700">
              Upcoming
            </p>
            <p className="mt-2 text-3xl font-bold text-orange-800">
              {upcoming.length}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 p-5">
            <p className="text-sm font-medium text-green-700">
              Completed
            </p>
            <p className="mt-2 text-3xl font-bold text-green-800">
              {completed.length}
            </p>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-red-700">
            Overdue Follow-ups
          </h2>

          {overdue.length === 0 ? (
            <p className="rounded-lg bg-white p-5 text-sm text-gray-500">
              No overdue follow-ups.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {overdue.map((item) => (
                <ReminderCard
                  key={item.id}
                  item={item}
                  status="Overdue"
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-orange-700">
            Upcoming Follow-ups
          </h2>

          {upcoming.length === 0 ? (
            <p className="rounded-lg bg-white p-5 text-sm text-gray-500">
              No upcoming follow-ups.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((item) => (
                <ReminderCard
                  key={item.id}
                  item={item}
                  status="Upcoming"
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-green-700">
            Completed Follow-ups
          </h2>

          {completed.length === 0 ? (
            <p className="rounded-lg bg-white p-5 text-sm text-gray-500">
              No completed follow-ups yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completed.map((item) => (
                <ReminderCard
                  key={item.id}
                  item={item}
                  status="Completed"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

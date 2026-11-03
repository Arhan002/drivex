
import LeadFollowup from "@/components/LeadFollowup";
import LeadStatusControl from "@/components/LeadStatusControl";
import BuyerSummary from "@/components/BuyerSummary";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  // Render this page when an actual request arrives.
  await connection();

  const { leadId: selectedLeadId } = await searchParams;

  const supabase = await createClient();

  // 1. Verify logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Get staff role
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

  // 3. Admin can view all leads
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
    // 4. Consultants retrieve only their assigned leads
    const { data: assignmentData, error: assignmentError } =
      await supabase
        .from("lead_assignments")
        .select("lead_id, assigned_at, response_due_at, first_contacted_at")
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

  // 5. Move selected lead to the top
  const sortedLeads = [...leads].sort((a, b) => {
    if (a.id === selectedLeadId) return -1;
    if (b.id === selectedLeadId) return 1;
    return 0;
  });

  // 6. Fetch showroom names
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

  // 7. Fetch car model names
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

  // 8. Calculate lead counts
  const countByStatus = (status: string) =>
    leads.filter((lead) => lead.status === status).length;

  const selectedLeadExists = leads.some(
    (lead) => lead.id === selectedLeadId
  );

  const statusStyles: Record<string, string> = {
    new: "bg-orange-100 text-orange-700",
    contacted: "bg-blue-100 text-blue-700",
    qualified: "bg-purple-100 text-purple-700",
    test_drive_scheduled: "bg-indigo-100 text-indigo-700",
    converted: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <header className="border-b border-gray-200 bg-white px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
              DriveX CRM
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Lead Management
            </h1>
          </div>

          <a
            href="/dashboard"
            className="text-sm font-semibold text-orange-600 hover:underline"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-9 md:px-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {profile.full_name}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Review and manage your assigned customer enquiries.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Leads", value: leads.length },
            { label: "New", value: countByStatus("new") },
            { label: "Contacted", value: countByStatus("contacted") },
            { label: "Converted", value: countByStatus("converted") },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Lead table */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h3 className="text-lg font-bold text-gray-900">
              Customer Enquiries
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {leads.length} lead(s) available in your inbox
            </p>
          </div>

          {selectedLeadId && (
            <div
              className={`border-b px-6 py-3 ${
                selectedLeadExists
                  ? "border-orange-100 bg-orange-50"
                  : "border-red-100 bg-red-50"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  selectedLeadExists
                    ? "text-orange-700"
                    : "text-red-700"
                }`}
              >
                {selectedLeadExists
                  ? "Selected customer lead is highlighted below."
                  : "The requested lead could not be found in your authorized inbox."}
              </p>
            </div>
          )}

          {errorMessage ? (
            <div className="p-8 text-sm text-red-600">
              Unable to load leads: {errorMessage}
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg font-semibold text-gray-800">
                No assigned leads yet
              </p>
              <p className="mt-2 text-sm text-gray-500">
                New enquiries assigned to you will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedLeads.map((lead) => {
                const assignment = assignments.find(
                  (item) => item.lead_id === lead.id
                );

                const isSelected = lead.id === selectedLeadId;

                return (
                  <article
                    key={lead.id}
                    id={`lead-${lead.id}`}
                    className={`scroll-mt-6 p-6 transition-all ${
                      isSelected
                        ? "border-l-4 border-orange-500 bg-orange-50 shadow-inner"
                        : ""
                    }`}
                  >
                    {isSelected && (
                      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-orange-600">
                        Selected Lead
                      </p>
                    )}

                    <div className="flex flex-col justify-between gap-4 lg:flex-row">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-lg font-bold text-gray-900">
                            {lead.buyer_name}
                          </h4>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[lead.status] ??
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {lead.status.replaceAll("_", " ")}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-gray-600">
                          {lead.email} · {lead.phone}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                          Interested in:{" "}
                          <span className="font-semibold text-gray-800">
                            {lead.interested_model_id
                              ? modelMap.get(lead.interested_model_id) ??
                                "New car"
                              : "Used car enquiry"}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Showroom:{" "}
                          {showroomMap.get(lead.showroom_id) ??
                            "Not available"}
                        </p>
                      </div>

                      <div className="text-sm text-gray-500 lg:text-right">
                        <p>Received: {formatDate(lead.created_at)}</p>

                        {assignment && (
                          <>
                            <p className="mt-2">
                              Assigned: {formatDate(assignment.assigned_at)}
                            </p>
                            <p className="mt-1">
                              Response due:{" "}
                              {formatDate(assignment.response_due_at)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Customer preferences */}
                    <div className="mt-5 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ["Fuel", lead.fuel_preference],
                        ["Transmission", lead.transmission_preference],
                        ["Budget", lead.budget],
                        ["Purchase timeline", lead.purchase_timeline],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {value || "Not specified"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Lead status */}
                    <LeadStatusControl
                      leadId={lead.id}
                      currentStatus={lead.status}
                    />

                    {/* Follow-up management */}
                    <div className="mt-6">
                      <LeadFollowup leadId={lead.id} />
                    </div>
                    {/* AI First-Response Draft */}
<div className="mt-6">
  <LeadResponseDraft leadId={lead.id} />
</div>

                    {/* AI Buyer Intelligence */}
                    <div className="mt-6">
                      <BuyerSummary leadId={lead.id} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

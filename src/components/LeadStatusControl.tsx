
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const statuses = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "test_drive_scheduled", label: "Test Drive Scheduled" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

export default function LeadStatusControl({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function updateStatus() {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "update_assigned_lead_status",
        {
          p_lead_id: leadId,
          p_status: status,
        }
      );

      if (error) {
        throw error;
      }

      setMessage("Status updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Status update error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update status."
      );
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={loading}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-500"
      >
        {statuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={updateStatus}
        disabled={loading || status === currentStatus}
        className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Status"}
      </button>

      {message && (
        <p
          role="status"
          className="text-sm font-medium text-green-700"
        >
          {message}
        </p>
      )}
    </div>
  );
}

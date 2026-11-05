
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BookingStatusControl({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const router = useRouter();

  async function updateStatus() {
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "update_test_drive_booking_status",
        {
          p_booking_id: bookingId,
          p_status: status,
        }
      );

      if (error) throw error;

      setMessage("Booking status updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Booking status update error:", error);

      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update booking status."
      );

      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
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
        {loading ? "Updating..." : "Update Booking"}
      </button>

      {message && (
        <p
          role="status"
          className={`text-sm font-medium ${
            isError ? "text-red-600" : "text-green-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

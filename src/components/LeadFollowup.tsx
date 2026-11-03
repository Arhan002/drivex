
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Followup = {
  id: string;
  note: string;
  follow_up_at: string | null;
  created_at: string;
  completed_at: string | null;
};

export default function LeadFollowup({
  leadId,
}: {
  leadId: string;
}) {
  const [notes, setNotes] = useState<Followup[]>([]);
  const [note, setNote] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Current time is initially unknown during prerendering
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  // Load follow-up notes from Supabase
  async function loadNotes() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("lead_followups")
      .select("id, note, follow_up_at, created_at, completed_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setNotes(data ?? []);
  }

  // Run after the component mounts in the browser
  useEffect(() => {
    setCurrentTime(Date.now());
    loadNotes();
  }, [leadId]);

  // Save a new follow-up note
  async function saveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!note.trim()) {
      setMessage("Please enter a follow-up note.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please sign in again.");
      }

      const { error } = await supabase
        .from("lead_followups")
        .insert({
          lead_id: leadId,
          consultant_id: user.id,
          note: note.trim(),
          follow_up_at: followUpAt
            ? new Date(followUpAt).toISOString()
            : null,
        });

      if (error) throw error;

      setNote("");
      setFollowUpAt("");
      setMessage("Follow-up saved successfully!");

      await loadNotes();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save follow-up."
      );
    } finally {
      setLoading(false);
    }
  }

  // Mark a follow-up as completed using the secure RPC
  async function markCompleted(id: string) {
    setCompletingId(id);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "complete_lead_followup",
        {
          p_followup_id: id,
        }
      );

      if (error) throw error;

      setMessage("Follow-up marked as completed!");
      await loadNotes();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete follow-up."
      );
    } finally {
      setCompletingId(null);
    }
  }

  // Format dates for display
  function formatDate(value: string) {
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // Determine follow-up reminder status
  function getReminderStatus(item: Followup) {
    if (item.completed_at) {
      return {
        label: "Completed",
        style: "bg-green-100 text-green-700",
      };
    }

    if (!item.follow_up_at) {
      return {
        label: "No date scheduled",
        style: "bg-gray-100 text-gray-600",
      };
    }

    if (currentTime === null) {
      return {
        label: "Checking...",
        style: "bg-gray-100 text-gray-600",
      };
    }

    const followUpDate = new Date(item.follow_up_at);

    if (followUpDate.getTime() < currentTime) {
      return {
        label: "Overdue",
        style: "bg-red-100 text-red-700",
      };
    }

    return {
      label:
        followUpDate.toDateString() ===
        new Date(currentTime).toDateString()
          ? "Due today"
          : "Upcoming",
      style: "bg-orange-100 text-orange-700",
    };
  }

  // Calculate reminder counts
  const overdueCount =
    currentTime === null
      ? 0
      : notes.filter(
          (item) =>
            !item.completed_at &&
            item.follow_up_at &&
            new Date(item.follow_up_at).getTime() < currentTime
        ).length;

  const upcomingCount =
    currentTime === null
      ? 0
      : notes.filter(
          (item) =>
            !item.completed_at &&
            item.follow_up_at &&
            new Date(item.follow_up_at).getTime() >= currentTime
        ).length;

  const completedCount = notes.filter(
    (item) => Boolean(item.completed_at)
  ).length;

  return (
    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-bold text-gray-900">
        Follow-up Notes
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Record customer conversations and schedule the next contact.
      </p>

      {/* Reminder Summary */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-sm font-medium text-red-700">Overdue</p>
          <p className="mt-1 text-2xl font-bold text-red-800">
            {overdueCount}
          </p>
        </div>

        <div className="rounded-lg bg-orange-50 p-3">
          <p className="text-sm font-medium text-orange-700">Upcoming</p>
          <p className="mt-1 text-2xl font-bold text-orange-800">
            {upcomingCount}
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-sm font-medium text-green-700">Completed</p>
          <p className="mt-1 text-2xl font-bold text-green-800">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Follow-up Form */}
      <form onSubmit={saveNote} className="mt-5 space-y-4">
        <textarea
          required
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter conversation notes..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:border-orange-500"
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Next follow-up date and time
          </label>

          <input
            type="datetime-local"
            value={followUpAt}
            onChange={(e) => setFollowUpAt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:border-orange-500 sm:w-auto"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Follow-up"}
        </button>

        {message && (
          <p
            role="status"
            className="text-sm font-medium text-green-700"
          >
            {message}
          </p>
        )}
      </form>

      {/* Conversation History */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <h4 className="font-semibold text-gray-900">
          Conversation History
        </h4>

        {notes.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No follow-up notes recorded yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {notes.map((item) => {
              const status = getReminderStatus(item);

              return (
                <article
                  key={item.id}
                  className="rounded-lg bg-gray-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${status.style}`}
                    >
                      {status.label}
                    </span>

                    {item.follow_up_at && !item.completed_at && (
                      <button
                        type="button"
                        disabled={completingId === item.id}
                        onClick={() => markCompleted(item.id)}
                        className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {completingId === item.id
                          ? "Updating..."
                          : "Mark as Completed"}
                      </button>
                    )}
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">
                    {item.note}
                  </p>

                  <p className="mt-3 text-xs text-gray-500">
                    Recorded: {formatDate(item.created_at)}
                  </p>

                  {item.follow_up_at && (
                    <p className="mt-2 text-xs font-semibold text-gray-700">
                      Scheduled: {formatDate(item.follow_up_at)}
                    </p>
                  )}

                  {item.completed_at && (
                    <p className="mt-2 text-xs font-semibold text-green-700">
                      Completed: {formatDate(item.completed_at)}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

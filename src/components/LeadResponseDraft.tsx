
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LeadResponseDraftProps = {
  leadId: string;
};

type DraftSource = "gemini" | "fallback";

type SavedDraft = {
  id: string;
  draft_content: string;
  draft_source: DraftSource;
  approved_by: string | null;
  approved_at: string | null;
};

export default function LeadResponseDraft({
  leadId,
}: LeadResponseDraftProps) {
  const [draft, setDraft] = useState("");
  const [source, setSource] = useState<DraftSource | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [approved, setApproved] = useState(false);
  const [originalDraft, setOriginalDraft] = useState("");

  const supabase = createClient();

  // Load the latest saved draft when the lead is opened.
  useEffect(() => {
    let active = true;

    async function loadSavedDraft() {
      setLoadingSaved(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("lead_response_drafts")
        .select(
          "id, draft_content, draft_source, approved_by, approved_at"
        )
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;

      if (fetchError) {
        setError("Unable to load the saved response draft.");
      } else if (data) {
        const saved = data as SavedDraft;

        setDraft(saved.draft_content);
        setOriginalDraft(saved.draft_content);
        setDraftId(saved.id);
        setSource(saved.draft_source);
        setApproved(
          Boolean(saved.approved_by && saved.approved_at)
        );
      } else {
        setDraft("");
        setOriginalDraft("");
        setDraftId(null);
        setSource(null);
        setApproved(false);
      }

      setLoadingSaved(false);
    }

    loadSavedDraft();

    return () => {
      active = false;
    };
  }, [leadId]);

  // Save a draft using the secure Supabase RPC.
  async function persistDraft(
    content: string,
    draftSource: DraftSource
  ): Promise<string> {
    const { data, error: saveError } = await supabase.rpc(
      "save_lead_response_draft",
      {
        p_lead_id: leadId,
        p_draft_content: content,
        p_draft_source: draftSource,
        p_draft_id: draftId,
      }
    );

    if (saveError) {
      throw new Error(saveError.message);
    }

    if (!data || typeof data !== "string") {
      throw new Error("Unable to confirm the saved draft.");
    }

    setDraftId(data);
    setOriginalDraft(content);
    setApproved(false);
    setCopied(false);

    return data;
  }

  // Generate a new Gemini response and save it.
  async function generateDraft() {
    setLoading(true);
    setError("");
    setNotice("");
    setDraft("");
    setOriginalDraft("");
    setDraftId(null);
    setSource(null);
    setCopied(false);
    setApproved(false);

    try {
      const response = await fetch("/api/ai/first-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to generate response draft."
        );
      }

      const generatedSource: DraftSource =
        data.source === "fallback" ? "fallback" : "gemini";

      setDraft(data.draft);
      setSource(generatedSource);
      setNotice(data.notice || "");

      await persistDraft(data.draft, generatedSource);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Save consultant edits. The RPC clears previous approval.
  async function saveChanges() {
    if (!draft.trim() || !source) {
      setError("Please enter a valid message.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await persistDraft(draft, source);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  // Save the latest text first, then record approval.
  async function approveDraft() {
    if (!draft.trim() || !source) {
      setError("Please enter a valid message before approving.");
      return;
    }

    setApproving(true);
    setError("");

    try {
      const savedId = await persistDraft(draft, source);

      const { error: approvalError } = await supabase.rpc(
        "approve_lead_response_draft",
        {
          p_draft_id: savedId,
        }
      );

      if (approvalError) {
        throw new Error(approvalError.message);
      }

      setApproved(true);
      setCopied(false);
    } catch (err) {
      setApproved(false);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve the message."
      );
    } finally {
      setApproving(false);
    }
  }

  async function copyDraft() {
    if (!approved || draft !== originalDraft) {
      setError("Save and approve the latest message before copying.");
      return;
    }

    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setError("");
    } catch {
      setError("Unable to copy the message. Please copy it manually.");
    }
  }

  const edited = draft !== originalDraft;

  return (
    <div className="mt-4 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              ✦
            </span>
            <h3 className="font-semibold text-gray-900">
              AI First-Response Draft
            </h3>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Generate, personalise and approve your customer message.
          </p>
        </div>

        <button
          type="button"
          onClick={generateDraft}
          disabled={loading || saving || approving || loadingSaved}
          className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "✦ Generate Message"}
        </button>
      </div>

      {loadingSaved && (
        <p className="mt-4 text-sm text-gray-500">
          Loading saved draft...
        </p>
      )}

      {loading && (
        <div className="mt-5 animate-pulse rounded-xl bg-orange-50 p-4">
          <div className="h-3 w-2/3 rounded bg-orange-200" />
          <div className="mt-3 h-3 w-full rounded bg-orange-100" />
          <div className="mt-2 h-3 w-5/6 rounded bg-orange-100" />
          <p className="mt-3 text-xs text-gray-500">
            Preparing a personalised customer message...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {draft && !loadingSaved && !loading && (
        <div className="mt-5 space-y-4 border-t border-gray-100 pt-5">
          {/* Status indicators */}
          <div className="flex flex-wrap items-center gap-2">
            {source === "gemini" ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ✦ Gemini AI Generated
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Template-based Fallback
              </span>
            )}

            {edited && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Edited by Consultant
              </span>
            )}

            {approved && !edited && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ✓ Approved
              </span>
            )}

            {!approved && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                Awaiting Approval
              </span>
            )}
          </div>

          {source === "fallback" && notice && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {notice}
            </div>
          )}

          {/* Editable message */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor={`response-draft-${leadId}`}
                className="text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Message Editor
              </label>

              <span className="text-xs text-gray-400">
                {draft.length}/3000
              </span>
            </div>

            <textarea
              id={`response-draft-${leadId}`}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setApproved(false);
                setCopied(false);
                setError("");
              }}
              rows={9}
              maxLength={3000}
              className="w-full resize-y rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm leading-7 text-gray-800 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
            />

            <p className="mt-2 text-xs text-gray-500">
              Edit the AI suggestion. Your changes must be saved and approved.
            </p>
          </div>

          {/* Save, approve and copy */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveChanges}
              disabled={!edited || !draft.trim() || saving || approving}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={approveDraft}
              disabled={
                !draft.trim() ||
                !source ||
                approved ||
                saving ||
                approving
              }
              className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {approving
                ? "Approving..."
                : approved
                  ? "✓ Message Approved"
                  : "Approve Final Message"}
            </button>

            <button
              type="button"
              onClick={copyDraft}
              disabled={
                !approved ||
                edited ||
                !draft.trim() ||
                saving ||
                approving
              }
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? "✓ Copied" : "Copy Approved Message"}
            </button>
          </div>

          {approved && !edited && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              ✓ This message has been approved and its approval is saved in
              Supabase.
            </div>
          )}

          {edited && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              You have unsaved changes. Save them before approval. Any saved
              edit clears the previous approval.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

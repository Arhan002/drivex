
"use client";

import { useState } from "react";

type LeadResponseDraftProps = {
  leadId: string;
};

type DraftSource = "gemini" | "fallback";

export default function LeadResponseDraft({
  leadId,
}: LeadResponseDraftProps) {
  const [draft, setDraft] = useState("");
  const [source, setSource] = useState<DraftSource | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generateDraft() {
    setLoading(true);
    setError("");
    setNotice("");
    setDraft("");
    setSource(null);
    setCopied(false);

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

      setDraft(data.draft);
      setSource(data.source === "fallback" ? "fallback" : "gemini");
      setNotice(data.notice || "");
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

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
    } catch {
      setError("Unable to copy the message. Please copy it manually.");
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            AI First-Response Draft
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Generate a personalised message for your customer.
          </p>
        </div>

        <button
          type="button"
          onClick={generateDraft}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "✦ Generate Message"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p className="mt-4 text-sm text-gray-600">
          Preparing a personalised customer message...
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Generated draft */}
      {draft && (
        <div className="mt-4 space-y-3 border-t border-blue-200 pt-4">
          {/* Source indicator */}
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
          </div>

          {/* Fallback notice */}
          {source === "fallback" && notice && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {notice}
            </div>
          )}

          {/* Editable message */}
          <div>
            <label
              htmlFor={`response-draft-${leadId}`}
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Review and edit message
            </label>

            <textarea
              id={`response-draft-${leadId}`}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setCopied(false);
              }}
              rows={9}
              maxLength={3000}
              className="w-full resize-y rounded-lg border border-gray-300 bg-white p-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {draft.length}/3000 characters
            </p>
          </div>

          {/* Copy action */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyDraft}
              disabled={!draft.trim()}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {copied ? "✓ Copied" : "Copy Message"}
            </button>

            <p className="text-xs text-gray-500">
              Review the message before sending it to the customer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

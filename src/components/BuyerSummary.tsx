
"use client";

import { useState } from "react";

type BuyerSummaryData = {
  summary: string;
  buyingIntent: "High" | "Medium" | "Low" | "Uncertain";
  confidence: "High" | "Medium" | "Low";
  recommendedAction: string;
  missingInformation: string[];
};

type SummarySource = "gemini" | "fallback";

type BuyerSummaryProps = {
  leadId: string;
};

export default function BuyerSummary({ leadId }: BuyerSummaryProps) {
  const [summary, setSummary] = useState<BuyerSummaryData | null>(null);
  const [source, setSource] = useState<SummarySource | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateSummary() {
    setLoading(true);
    setError("");
    setNotice("");
    setSummary(null);
    setSource(null);

    try {
      const response = await fetch("/api/ai/buyer-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to generate buyer summary.");
      }

      setSummary(data.buyerSummary);
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

  return (
    <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            AI Buyer Intelligence
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Analyse customer interest and identify the next best action.
          </p>
        </div>

        <button
          onClick={generateSummary}
          disabled={loading}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Analysing..." : "✦ Generate AI Summary"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p className="mt-4 text-sm text-gray-600">
          Analysing customer information...
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Generated summary */}
      {summary && (
        <div className="mt-4 space-y-4 border-t border-orange-200 pt-4">
          {/* Summary source */}
          <div className="flex flex-wrap items-center gap-2">
            {source === "gemini" ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ✦ Gemini AI Generated
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Rule-based Fallback
              </span>
            )}
          </div>

          {/* Fallback notice */}
          {source === "fallback" && notice && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {notice}
            </div>
          )}

          {/* Buyer summary */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Buyer summary
            </p>
            <p className="mt-1 text-sm leading-6 text-gray-800">
              {summary.summary}
            </p>
          </div>

          {/* Buying intent and confidence */}
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg bg-white px-3 py-2">
              <p className="text-xs text-gray-500">Buying intent</p>
              <p className="mt-1 font-semibold text-gray-900">
                {summary.buyingIntent}
              </p>
            </div>

            <div className="rounded-lg bg-white px-3 py-2">
              <p className="text-xs text-gray-500">
                {source === "gemini" ? "AI confidence" : "Confidence"}
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                {summary.confidence}
              </p>
            </div>
          </div>

          {/* Recommended action */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Recommended next action
            </p>
            <p className="mt-1 text-sm text-gray-800">
              {summary.recommendedAction}
            </p>
          </div>

          {/* Missing information */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Missing information
            </p>

            {summary.missingInformation.length > 0 ? (
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
                {summary.missingInformation.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-gray-600">
                No major missing information identified.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

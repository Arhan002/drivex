
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Fully reload the login page and clear stale UI state.
      window.location.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Unable to sign out. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
      >
        <span className="w-6 text-center text-lg">↪</span>
        {loading ? "Signing out..." : "Logout"}
      </button>

      {error && (
        <p className="mt-2 px-3 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

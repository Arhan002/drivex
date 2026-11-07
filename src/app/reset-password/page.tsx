
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const initialized = useRef(false);

  const [loading, setLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function verifyResetLink() {
      const params = new URLSearchParams(window.location.search);

      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      const authError =
        params.get("error_description") ||
        params.get("error") ||
        new URLSearchParams(window.location.hash.slice(1)).get(
          "error_description"
        );

      if (authError) {
        setError(authError.replace(/\+/g, " "));
        setLoading(false);
        return;
      }

      if (tokenHash && type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });

        if (error) {
          setError(
            "This reset link is invalid or expired. Please request a new one."
          );
          setLoading(false);
          return;
        }

        window.history.replaceState({}, "", "/reset-password");
        setValidSession(true);
        setLoading(false);
        return;
      }

      setError(
        "No valid recovery token was found. Please request a new reset link."
      );
      setLoading(false);
    }

    verifyResetLink();
  }, [supabase]);

  async function handlePasswordReset(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login?password_reset=true");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Verifying reset link...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">
          Reset your password
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Choose a new password for your staff account.
        </p>

        {!validSession ? (
          <>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <a
              href="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Request a new reset link
            </a>
          </>
        ) : (
          <form
            onSubmit={handlePasswordReset}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border px-3 py-2"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Enter password again"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-black text-white py-2.5 font-medium disabled:opacity-50"
            >
              {saving ? "Updating password..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

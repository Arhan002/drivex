"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });

      if (resetError) throw resetError;

      setSent(true);
    } catch (err) {
      console.error("Password reset request error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send the reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Drive<span className="text-orange-600">X</span>
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Sales Consultant Portal
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="mb-4 text-4xl" aria-hidden="true">✉️</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Check your email
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              If an account exists for <strong>{email}</strong>, Supabase will
              send a password-reset link. Open it in this same browser to
              continue.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-block font-semibold text-orange-600 hover:text-orange-700"
            >
              Back to Staff Login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              Forgot your password?
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Enter your staff account email address and we'll send you a
              password-reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Work email address
                </label>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Back to Staff Login
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

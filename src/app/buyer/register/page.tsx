
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function BuyerRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            account_type: "buyer",
          },
          emailRedirectTo: `${window.location.origin}/buyer/confirm`,
        },
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error("Registration failed. Please try again.");
      }

      setSuccess(true);
    } catch (err) {
      console.error("Buyer registration error:", err);

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
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Drive<span className="text-orange-600">X</span>
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Create your customer account
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mb-4 text-4xl">✉️</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Verify your email
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              We&apos;ve sent a confirmation link to{" "}
              <strong>{email}</strong>. Please verify your email before
              signing in.
            </p>
            <p className="mt-6 text-sm text-gray-600">
              Already verified?{" "}
              <Link
                href="/buyer/login"
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join DriveX to explore cars and manage your enquiries.
            </p>

            <form onSubmit={handleRegister} className="mt-7 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  required
                  type="text"
                  maxLength={100}
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <input
                  type="tel"
                  maxLength={20}
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  required
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <input
                  required
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                {loading ? "Creating account..." : "Create Buyer Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/buyer/login"
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Sign in
              </Link>
            </p>
          </>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          By registering, you agree to use DriveX responsibly.
        </p>
      </div>
    </main>
  );
}

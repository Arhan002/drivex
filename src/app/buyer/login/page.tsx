
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BuyerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) throw authError;

      if (!data.user) {
        throw new Error("Unable to authenticate. Please try again.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("Buyer profile not found. Please contact support.");
      }

      if (profile.role?.trim().toLowerCase() !== "buyer") {
        await supabase.auth.signOut();
        throw new Error("This login is only for DriveX Buyers.");
      }

      router.replace("/buyer/dashboard");
      router.refresh();

    } catch (err) {
      console.error("Buyer login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during login."
      );

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
            Buyer Portal
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back!
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Sign in to manage your car enquiries and test drives.
        </p>

        <form onSubmit={handleLogin} className="mt-7 space-y-5">

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
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/buyer/register"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Create account
          </Link>
        </p>

        <p className="mt-5 text-center text-xs text-gray-500">
          Are you a DriveX staff member?{" "}
          <Link
            href="/login"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Staff Login
          </Link>
        </p>

      </div>
    </main>
  );
}

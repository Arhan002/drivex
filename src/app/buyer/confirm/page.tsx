
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BuyerConfirmPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifyEmail() {
      const supabase = createClient();

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");

        let verificationError = null;

        if (code) {
          const result = await supabase.auth.exchangeCodeForSession(code);
          verificationError = result.error;
        } else if (tokenHash && type === "signup") {
  const result = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "signup",
  });
  verificationError = result.error;
          verificationError = result.error;
        } else {
          verificationError = new Error("Confirmation link is invalid or expired.");
        }

        if (!active) return;

        if (verificationError) {
          throw verificationError;
        }

        // Ensure this account is a Buyer before completing verification.
        const { data: { user }, error: userError } =
          await supabase.auth.getUser();

        if (userError || !user) {
          throw userError ?? new Error("Unable to verify your account.");
        }

        if (user.user_metadata?.account_type !== "buyer") {
          await supabase.auth.signOut();
          throw new Error("This confirmation link is not for a Buyer account.");
        }

        await supabase.auth.signOut();

        window.history.replaceState({}, document.title, "/buyer/confirm");

        setMessage("Email verified successfully! You can now sign in.");
        router.refresh();
      } catch (err) {
        console.error("Buyer email verification error:", err);

        if (active) {
          setError(true);
          setMessage(
            err instanceof Error
              ? err.message
              : "Email verification failed. Please try again."
          );
        }
      }
    }

    verifyEmail();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">
          Drive<span className="text-orange-600">X</span>
        </h1>

        <div className="my-6 text-4xl">
          {error ? "⚠️" : "✉️"}
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          {error ? "Verification failed" : "Email confirmation"}
        </h2>

        <p className={`mt-4 text-sm leading-6 ${error ? "text-red-600" : "text-gray-600"}`}>
          {message}
        </p>

        {!message.includes("Verifying") && (
          <Link
            href="/buyer/login"
            className="mt-7 inline-block w-full rounded-lg bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Go to Buyer Login
          </Link>
        )}
      </div>
    </main>
  );
}

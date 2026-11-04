"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your invitation...");

  useEffect(() => {
    let active = true;

    async function handleInvitation() {
      const supabase = createClient();

      try {
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(url.hash.slice(1));

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");

        let error = null;

        if (accessToken && refreshToken) {
          const result = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          error = result.error;
        } else if (code) {
          const result = await supabase.auth.exchangeCodeForSession(code);
          error = result.error;
        } else if (tokenHash && type === "invite") {
          const result = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "invite",
          });
          error = result.error;
        } else {
          const result = await supabase.auth.getSession();

          if (result.error || !result.data.session) {
            error = result.error ?? new Error("Invitation session not found.");
          }
        }

        if (!active) return;

        if (error) {
          console.error("Invitation verification failed:", error.message);
          setMessage("Your invitation could not be verified. Please request a new invitation.");
          return;
        }

        window.history.replaceState({}, document.title, "/auth/callback");
        router.replace("/set-password");
      } catch (error) {
        console.error("Invitation callback error:", error);

        if (active) {
          setMessage("Something went wrong while verifying your invitation.");
        }
      }
    }

    handleInvitation();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-4 text-lg font-semibold text-gray-900">
          {message}
        </div>
        <p className="text-sm text-gray-500">
          Please wait while we verify your account.
        </p>
      </div>
    </main>
  );
}
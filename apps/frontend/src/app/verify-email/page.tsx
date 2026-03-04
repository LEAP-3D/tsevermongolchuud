"use client";

import { withApiBase } from "@/lib/apiBase";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type VerifyState = "checking" | "success" | "already" | "invalid" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [status, setStatus] = useState<VerifyState>("checking");
  const [message, setMessage] = useState<string>("Verifying your email...");

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus("invalid");
        setMessage("Missing verification token.");
        return;
      }

      setStatus("checking");
      setMessage("Verifying your email...");
      try {
        const response = await fetch(withApiBase(`/api/auth/verify?token=${encodeURIComponent(token)}`), {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json()) as { error?: string; alreadyVerified?: boolean };

        if (!response.ok) {
          setStatus("invalid");
          setMessage(payload?.error || "Invalid or expired verification link.");
          return;
        }

        if (payload?.alreadyVerified) {
          setStatus("already");
          setMessage("Your email is already verified. You can sign in now.");
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully. You can sign in now.");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed.");
      }
    };

    void run();
  }, [token]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Email Verification</h1>
        <p className="mt-3 text-sm text-slate-700">{message}</p>

        {(status === "success" || status === "already") && (
          <button
            type="button"
            onClick={() => (window.location.href = "/login")}
            className="mt-6 h-11 w-full rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-600"
          >
            Go to Sign In
          </button>
        )}
      </div>
    </main>
  );
}

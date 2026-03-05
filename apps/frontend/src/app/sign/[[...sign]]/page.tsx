"use client";

import TeslaAuthLayout from "../../components/TeslaAuthLayout";
import { withApiBase } from "@/lib/apiBase";
import { useEffect, useState } from "react";
import SignUpForm from "../../components/SignUpForm";

export default function SignPage() {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const requestVerificationEmail = async (emailAddress: string) => {
    setResendState("sending");
    try {
      const response = await fetch(withApiBase("/api/auth/verify/resend"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddress }),
      });
      const payload = (await response.json()) as { error?: string; emailSent?: boolean };
      if (!response.ok) {
        throw new Error(payload?.error || "We couldn't send the verification email. Please try again.");
      }

      setResendState(payload?.emailSent ? "sent" : "error");
    } catch {
      setResendState("error");
    }
  };

  useEffect(() => {
    if (!pendingEmail) return;
    void requestVerificationEmail(pendingEmail);
  }, [pendingEmail]);

  const handleVerifyAccount = async () => {
    if (!pendingEmail || resendState === "sending") return;
    await requestVerificationEmail(pendingEmail);
  };

  return (
    <TeslaAuthLayout mode="signup">
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {pendingEmail ? "Verification" : "Create Account"}
          </h2>
          <p className="text-slate-600 text-sm">
            {pendingEmail ? "Verify your email to activate your account." : "Start protecting your family in minutes."}
          </p>
        </div>

        {!pendingEmail ? (
          <SignUpForm
            onSuccess={({ email }) => {
              setPendingEmail(email);
              setResendState("idle");
            }}
          />
        ) : (
          <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-slate-700">
            <p>
              Account created for <strong>{pendingEmail}</strong>.
            </p>
            <p>
              Verification link has been sent. Open your email inbox and click the link or button.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleVerifyAccount}
                disabled={resendState === "sending"}
                className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resendState === "sending" ? "Sending..." : "Resend Email"}
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = "/login")}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-white transition hover:bg-indigo-600"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        )}

        <div />
      </div>
    </TeslaAuthLayout>
  );
}

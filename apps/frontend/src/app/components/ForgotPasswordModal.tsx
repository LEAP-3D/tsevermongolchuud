"use client";

import { withApiBase } from "@/lib/apiBase";
import { useEffect, useState } from "react";

type ForgotPasswordPanelProps = {
  defaultEmail: string;
};

export default function ForgotPasswordModal({ defaultEmail }: ForgotPasswordPanelProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setEmail(defaultEmail);
    setStatus("idle");
    setMessage(null);
  }, [defaultEmail]);

  const submitForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus("error");
      setMessage("Please enter your email.");
      return;
    }

    setStatus("sending");
    setMessage(null);
    try {
      const response = await fetch(withApiBase("/api/auth/password/forgot/request"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const payload = (await response.json()) as { error?: string; emailSent?: boolean };
      if (!response.ok) {
        throw new Error(payload?.error || "We couldn't send the password reset email. Please try again.");
      }
      setStatus("sent");
      setMessage(
        payload?.emailSent
          ? "Password reset email sent. Please check your inbox."
          : "If the email is registered and verified, you'll receive a reset email shortly.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn't send the password reset email right now. Please try again.",
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Forgot Password</h2>
        <p className="text-sm text-slate-600">
          Enter your account email and we&apos;ll send a secure reset link.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            status === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : status === "sent"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-4">
        <label className="block space-y-2 text-sm text-slate-600">
          <span>Email</span>
          <input
            type="email"
            name="forgot-email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200/70"
            placeholder="you@example.com"
          />
        </label>

        <button
          type="button"
          onClick={() => void submitForgotPassword()}
          className="h-11 w-full rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending..." : status === "sent" ? "Send Again" : "Send Reset Link"}
        </button>

      </div>
    </div>
  );
}

"use client";

import TeslaAuthLayout from "../../components/TeslaAuthLayout";
import { withApiBase } from "@/lib/apiBase";
import { type FormEvent, useState } from "react";
import { setStoredUser } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setShowResend(false);
    setResendMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setFormError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(withApiBase("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      if (!response.ok) {
        let message = "Login failed. Please try again.";
        let code = "";
        try {
          const payload = (await response.json()) as { error?: string; code?: string };
          if (payload?.error) {
            message = String(payload.error);
          }
          if (payload?.code) {
            code = String(payload.code);
          }
        } catch {
          // ignore JSON parse errors
        }
        if (code === "EMAIL_NOT_VERIFIED") {
          setShowResend(true);
        }
        throw new Error(message);
      }

      const payload: { user?: { id: number; email: string; name?: string | null; expiresAt: number } } =
        await response.json();
      if (payload?.user) {
        setStoredUser(payload.user);
      }
      window.location.href = "/home";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || resendState === "sending") return;

    setResendState("sending");
    setResendMessage(null);
    try {
      const response = await fetch(withApiBase("/api/auth/verify/resend"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const payload = (await response.json()) as { error?: string; emailSent?: boolean };
      if (!response.ok) {
        throw new Error(payload?.error || "Could not resend verification email.");
      }

      setResendState("sent");
      setResendMessage(
        payload?.emailSent
          ? "Verification email sent. Please check your inbox."
          : "Resend requested. If your account exists, check your inbox.",
      );
    } catch (error) {
      setResendState("error");
      setResendMessage(
        error instanceof Error ? error.message : "Could not resend verification email.",
      );
    }
  };

  return (
    <TeslaAuthLayout mode="signin">
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Sign In</h2>
          <p className="text-slate-600 text-sm">Welcome back. Please enter your details.</p>
        </div>

        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2 text-sm text-slate-600">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200/70"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-600">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200/70"
              placeholder="Enter your password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-indigo-500 text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

          {showResend && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === "sending"}
              className="h-12 w-full rounded-xl border border-indigo-200 bg-white text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {resendState === "sending" ? "Sending verification..." : "Resend verification email"}
            </button>
          )}
        </form>
        {resendMessage && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {resendMessage}
          </div>
        )}

        <div />
      </div>
    </TeslaAuthLayout>
  );
}

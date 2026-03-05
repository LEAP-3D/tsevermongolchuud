"use client";

import PasswordField from "../components/PasswordField";
import { withApiBase } from "@/lib/apiBase";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const submitNewPassword = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing reset token.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setStatus("error");
      setMessage("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Password and confirm password must match.");
      return;
    }
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch(withApiBase("/api/auth/password/forgot/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload?.error || "We couldn't reset your password. Please try again.");
      }
      setStatus("success");
      setMessage("Password reset successful. Redirecting to sign in...");
      window.setTimeout(() => {
        router.replace("/login");
      }, 700);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn't reset your password right now. Please try again.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Set New Password</h1>
        <p className="mt-3 text-sm text-slate-700">
          Enter your new password and confirm it to complete your reset.
        </p>

        {message && (
          <div
            className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
              status === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : status === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <PasswordField
            label="New Password"
            name="new-password"
            autoComplete="new-password"
            value={newPassword}
            placeholder="Enter new password"
            show={showPasswords}
            onChange={setNewPassword}
          />
          <PasswordField
            label="Confirm New Password"
            name="confirm-new-password"
            autoComplete="new-password"
            value={confirmPassword}
            placeholder="Confirm new password"
            show={showPasswords}
            onChange={setConfirmPassword}
          />

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(event) => setShowPasswords(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-300"
            />
            <span>Show password</span>
          </label>

          <button
            type="button"
            onClick={() => void submitNewPassword()}
            disabled={status === "submitting" || status === "success"}
            className="h-11 w-full rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "submitting" ? "Saving..." : "Reset Password"}
          </button>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-16">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">Set New Password</h1>
            <p className="mt-3 text-sm text-slate-700">Loading reset request...</p>
          </div>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

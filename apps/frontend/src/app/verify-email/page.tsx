"use client";

import { withApiBase } from "@/lib/apiBase";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type VerifyState = "checking" | "success" | "already" | "invalid" | "error";
type VerifyPurpose = "email-verification" | "password-change" | "account-delete";

const VerifyPageShell = ({ title, message }: { title: string; message: string }) => (
  <main className="min-h-screen bg-slate-50 px-4 py-16">
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-3 text-sm text-slate-700">{message}</p>
    </div>
  </main>
);

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const purpose = useMemo<VerifyPurpose>(() => {
    if (searchParams.get("purpose") === "account-delete") {
      return "account-delete";
    }
    return searchParams.get("purpose") === "password-change"
      ? "password-change"
      : "email-verification";
  }, [searchParams]);
  const [status, setStatus] = useState<VerifyState>("checking");
  const [message, setMessage] = useState<string>(
    purpose === "password-change"
      ? "Verifying your password change request..."
      : purpose === "account-delete"
        ? "Verifying your account deletion request..."
      : "Verifying your email...",
  );

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus("invalid");
        setMessage(
          purpose === "password-change"
            ? "Missing password change token."
            : purpose === "account-delete"
              ? "Missing account deletion token."
            : "Missing verification token.",
        );
        return;
      }

      setStatus("checking");
      setMessage(
        purpose === "password-change"
          ? "Verifying your password change request..."
          : purpose === "account-delete"
            ? "Verifying your account deletion request..."
          : "Verifying your email...",
      );
      try {
        const endpoint =
          purpose === "password-change"
            ? `/api/auth/password/change/verify?token=${encodeURIComponent(token)}`
            : purpose === "account-delete"
              ? `/api/auth/account/delete/verify?token=${encodeURIComponent(token)}`
            : `/api/auth/verify?token=${encodeURIComponent(token)}`;
        const response = await fetch(withApiBase(endpoint), { method: "GET", cache: "no-store" });
        const payload = (await response.json()) as { error?: string; alreadyVerified?: boolean };

        if (!response.ok) {
          setStatus("invalid");
          setMessage(
            payload?.error ||
              (purpose === "password-change"
                ? "Invalid or expired password change link."
                : purpose === "account-delete"
                  ? "Invalid or expired account deletion link."
                : "Invalid or expired verification link."),
          );
          return;
        }

        if (purpose === "email-verification" && payload?.alreadyVerified) {
          setStatus("already");
          setMessage("Your email is already verified. You can sign in now.");
          return;
        }

        setStatus("success");
        setMessage(
          purpose === "password-change"
            ? "Password updated successfully. You can sign in with your new password."
            : purpose === "account-delete"
              ? "Account deleted successfully."
            : "Email verified successfully. You can sign in now.",
        );
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed.");
      }
    };

    void run();
  }, [purpose, token]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          {purpose === "password-change"
            ? "Password Change"
            : purpose === "account-delete"
              ? "Account Deletion"
              : "Email Verification"}
        </h1>
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <VerifyPageShell
          title="Email Verification"
          message="Verifying your request..."
        />
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

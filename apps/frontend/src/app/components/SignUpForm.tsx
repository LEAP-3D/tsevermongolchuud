"use client";

import { type AuthUser } from "@/lib/auth";
import { withApiBase } from "@/lib/apiBase";
import { type FormEvent, useState } from "react";
import PasswordField from "./PasswordField";

type SignUpFormProps = {
  onSuccess: (user: AuthUser) => void;
};

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedEmail || !password || !confirmPassword) {
      setFormError("Please enter your email and password.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Password and confirm password must match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(withApiBase("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: trimmedName || null,
          email: trimmedEmail,
          password,
        }),
      });

      if (!response.ok) {
        let message = "Sign up failed. Please try again.";
        try {
          const payload = await response.json();
          if (payload?.error) {
            message = String(payload.error);
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      const payload: { user?: AuthUser } = await response.json();
      if (payload?.user) {
        onSuccess(payload.user);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed. Please try again.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm text-slate-600">
          <span>Full Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200/70"
            placeholder="Your name"
          />
        </label>

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

        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          value={password}
          placeholder="Create a password"
          show={showPasswords}
          onChange={setPassword}
        />

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          placeholder="Confirm your password"
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
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-indigo-500 text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

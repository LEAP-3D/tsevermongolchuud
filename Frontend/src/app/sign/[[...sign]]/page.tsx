"use client";

import TeslaAuthLayout from "@/app/components/TeslaAuthLayout";
import { type FormEvent, useState } from "react";
import { setStoredUser } from "@/lib/auth";
import Link from "next/link";

export default function SignPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedEmail || !password) {
      setFormError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const payload: { user?: { id: number; email: string; name?: string | null } } =
        await response.json();
      if (payload?.user) {
        setStoredUser(payload.user);
      }
      window.location.href = "/home";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed. Please try again.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TeslaAuthLayout mode="signup">
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-600 text-sm">Start protecting your family in minutes.</p>
        </div>

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

          <label className="block space-y-2 text-sm text-slate-600">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200/70"
              placeholder="Create a password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-indigo-500 text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div />
      </div>
    </TeslaAuthLayout>
  );
}

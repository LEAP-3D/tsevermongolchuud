"use client";

import TeslaAuthLayout from "@/app/components/TeslaAuthLayout";
import { Component, type FormEvent, type ReactNode, useState } from "react";
import { setStoredUser } from "@/lib/auth";

class LoginErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Something went wrong while loading the login form. Please refresh and try again.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setFormError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      if (!response.ok) {
        let message = "Login failed. Please try again.";
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
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TeslaAuthLayout mode="signin">
      <LoginErrorBoundary>
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
          </form>

          <div />
        </div>
      </LoginErrorBoundary>
    </TeslaAuthLayout>
  );
}

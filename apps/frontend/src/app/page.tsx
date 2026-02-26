import Link from "next/link";
import { Sora, Manrope } from "next/font/google";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";

const heading = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const STORE_URL = process.env.NEXT_PUBLIC_EXTENSION_STORE_URL ?? "";
const hasStoreUrl = /^https?:\/\//i.test(STORE_URL);

export default function LandingPage() {
  return (
    <main
      className={`${body.variable} ${heading.variable} min-h-screen bg-slate-950 text-white`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.35)_0%,_rgba(56,189,248,0)_70%)]" />
        <div className="pointer-events-none absolute -top-20 right-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.25)_0%,_rgba(168,85,247,0)_70%)]" />

        <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 md:px-8">
          <Link href="/" className="text-lg font-semibold tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>
            Safe-kid
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#install" className="transition hover:text-white">Install</a>
            <a href="#how" className="transition hover:text-white">How it works</a>
            <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full border border-white/30 px-4 py-2 text-sm text-white transition hover:border-white md:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/sign"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 pb-20 pt-10 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:pt-16">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80">
              Family digital safety
            </p>
            <h1
              className="text-4xl font-semibold leading-tight md:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Safe-kid helps parents guide screen time with clarity and control.
            </h1>
            <p className="text-base text-slate-200 md:text-lg">
              Track visited URLs and usage time, set healthy limits, and spot risky activity early. Built
              for families who want visibility without chaos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sign"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Create Parent Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={hasStoreUrl ? STORE_URL : "#"}
                aria-disabled={!hasStoreUrl}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                  hasStoreUrl
                    ? "border-white/40 text-white hover:border-white"
                    : "cursor-not-allowed border-white/20 text-white/40"
                }`}
              >
                Install Extension
              </Link>
            </div>
            {!hasStoreUrl && (
              <p className="text-xs text-white/60">
                Add your Chrome Web Store URL in NEXT_PUBLIC_EXTENSION_STORE_URL to enable the install
                button.
              </p>
            )}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <div className="grid gap-4">
              {[
                {
                  title: "Daily overview",
                  value: "3h 42m",
                  subtitle: "Today",
                  icon: Clock,
                },
                {
                  title: "Risk exposure",
                  value: "12 alerts",
                  subtitle: "This week",
                  icon: Shield,
                },
                {
                  title: "Top category",
                  value: "Education",
                  subtitle: "45% share",
                  icon: BarChart3,
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{item.title}</span>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                    {item.value}
                  </div>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">AI insights</p>
              <p className="mt-2 text-sm text-white">
                Safe-kid flags risky domains and summarizes weekly behavior so you can adjust limits
                faster.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section id="features" className="mx-auto w-full max-w-6xl px-5 pb-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Real-time activity",
              description: "See visited sites, time spent, and trends for each child in one dashboard.",
              icon: Sparkles,
            },
            {
              title: "Flexible time limits",
              description: "Set daily, weekday, weekend, and bedtime rules that match your family routine.",
              icon: Clock,
            },
            {
              title: "Safety scoring",
              description: "Risk ratings and alerts help you focus on what matters most.",
              icon: Shield,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <item.icon className="h-5 w-5 text-white/80" />
              <h3 className="mt-4 text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="install" className="mx-auto w-full max-w-6xl px-5 pb-20 md:px-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8">
          <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                Install the Safe-kid extension
              </h2>
              <p className="mt-3 text-sm text-slate-300">
                The extension runs in the child browser to capture visited URLs and usage time, then
                syncs it with the parent dashboard.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={hasStoreUrl ? STORE_URL : "#"}
                  aria-disabled={!hasStoreUrl}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    hasStoreUrl
                      ? "border-white/40 text-white hover:border-white"
                      : "cursor-not-allowed border-white/20 text-white/40"
                  }`}
                >
                  Open Chrome Web Store
                </Link>
                <Link
                  href="/sign"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Create account first
                </Link>
              </div>
            </div>
            <div className="space-y-4 text-sm text-slate-200">
              {[
                "Create a parent account and add a child profile.",
                "Install the extension in the child browser.",
                "Enter the child PIN shown in the dashboard.",
                "Start monitoring usage and adjust limits anytime.",
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900">
                    {index + 1}
                  </div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto w-full max-w-6xl px-5 pb-20 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Collect",
              description: "Extension tracks visited URLs, time spent, and safety signals.",
            },
            {
              title: "Analyze",
              description: "Safe-kid scores risk and summarizes activity in the dashboard.",
            },
            {
              title: "Act",
              description: "Set limits, block domains, and get alerts when something looks risky.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">{item.title}</p>
              <p className="mt-3 text-sm text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 md:px-8">
        <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
              Ready to keep your family safer online?
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Start with a parent account, add your child profile, and install the Safe-kid extension.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/sign"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Create account
              <CheckCircle2 className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 text-xs text-slate-400 md:flex-row md:px-8">
          <span>Safe-kid © {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/login" className="hover:text-white">Login</Link>
            <Link href="/sign" className="hover:text-white">Sign up</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

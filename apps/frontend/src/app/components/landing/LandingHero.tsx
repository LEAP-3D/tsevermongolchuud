import Link from "next/link";
import { ArrowRight, BarChart3, Clock, Shield } from "lucide-react";

export type LandingHeroProps = {
  storeUrl: string;
  hasStoreUrl: boolean;
};

const HERO_STATS = [
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
] as const;

export default function LandingHero({ storeUrl, hasStoreUrl }: LandingHeroProps) {
  return (
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
            href={hasStoreUrl ? storeUrl : "#"}
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
          {HERO_STATS.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{item.title}</span>
                <item.icon className="h-4 w-4" />
              </div>
              <div
                className="mt-2 text-2xl font-semibold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
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
  );
}

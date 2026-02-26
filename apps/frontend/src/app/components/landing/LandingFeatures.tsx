import { Clock, Shield, Sparkles } from "lucide-react";

const FEATURES = [
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
] as const;

export default function LandingFeatures() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-5 pb-16 md:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((item) => (
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
  );
}

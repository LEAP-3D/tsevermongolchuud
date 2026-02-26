const HOW_STEPS = [
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
] as const;

export default function LandingHow() {
  return (
    <section id="how" className="mx-auto w-full max-w-6xl px-5 pb-20 md:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        {HOW_STEPS.map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">{item.title}</p>
            <p className="mt-3 text-sm text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

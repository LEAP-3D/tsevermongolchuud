import Link from "next/link";

export type LandingInstallProps = {
  storeUrl: string;
  hasStoreUrl: boolean;
};

const STEPS = [
  "Create a parent account and add a child profile.",
  "Install the extension in the child browser.",
  "Enter the child PIN shown in the dashboard.",
  "Start monitoring usage and adjust limits anytime.",
] as const;

export default function LandingInstall({ storeUrl, hasStoreUrl }: LandingInstallProps) {
  return (
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
                href={hasStoreUrl ? storeUrl : "#"}
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
            {STEPS.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
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
  );
}

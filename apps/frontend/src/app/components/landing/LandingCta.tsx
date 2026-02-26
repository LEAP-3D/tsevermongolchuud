import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function LandingCta() {
  return (
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
  );
}

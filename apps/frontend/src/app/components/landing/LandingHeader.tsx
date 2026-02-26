import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingHeader() {
  return (
    <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 md:px-8">
      <Link
        href="/"
        className="text-lg font-semibold tracking-wide"
        style={{ fontFamily: "var(--font-heading)" }}
      >
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
  );
}

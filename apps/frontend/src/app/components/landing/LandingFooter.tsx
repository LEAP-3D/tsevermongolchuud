import Link from "next/link";

export default function LandingFooter() {
  return (
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
  );
}

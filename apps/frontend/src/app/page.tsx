import LandingHeader from "./components/landing/LandingHeader";
import LandingHero from "./components/landing/LandingHero";
import LandingFeatures from "./components/landing/LandingFeatures";
import LandingInstall from "./components/landing/LandingInstall";
import LandingHow from "./components/landing/LandingHow";
import LandingCta from "./components/landing/LandingCta";
import LandingFooter from "./components/landing/LandingFooter";
import { getExtensionStoreUrl } from "@/lib/extensionStore";

const bodyFamily = '"Manrope", "Segoe UI", "Helvetica Neue", Arial, sans-serif';

const STORE_URL = getExtensionStoreUrl();
const hasStoreUrl = /^https?:\/\//i.test(STORE_URL);

export default function LandingPage() {
  return (
    <main
      className="min-h-screen bg-slate-950 text-white"
      style={{ fontFamily: bodyFamily }}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.35)_0%,_rgba(56,189,248,0)_70%)]" />
        <div className="pointer-events-none absolute -top-20 right-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.25)_0%,_rgba(168,85,247,0)_70%)]" />

        <LandingHeader />
        <LandingHero storeUrl={STORE_URL} hasStoreUrl={hasStoreUrl} />
      </div>

      <LandingFeatures />
      <LandingInstall storeUrl={STORE_URL} hasStoreUrl={hasStoreUrl} />
      <LandingHow />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}

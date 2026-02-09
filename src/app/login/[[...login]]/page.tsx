 "use client";

import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import TeslaAuthLayout from "@/app/components/TeslaAuthLayout";

export default function LoginPage() {
  const router = useRouter();

  return (
    <TeslaAuthLayout
      mode="signin"
      onModeChange={(next) => router.push(next === "signin" ? "/login" : "/sign")}
    >
      <SignIn
        redirectUrl="/home"
        afterSignInUrl="/home"
        appearance={{
          variables: {
            colorPrimary: "#6f63ff",
            colorText: "#0f172a",
            colorTextSecondary: "rgba(15, 23, 42, 0.6)",
            colorBackground: "transparent",
            colorInputBackground: "#ffffff",
            colorInputText: "#0f172a",
            colorNeutral: "rgba(15, 23, 42, 0.55)",
            colorAlphaShade: "rgba(109, 94, 252, 0.12)",
            colorSuccess: "#16a34a",
          },
          elements: {
            rootBox: "w-full",
            card: "shadow-none bg-transparent border-0 p-0 gap-6",
            header: "gap-2",
            headerTitle: "text-2xl font-semibold text-slate-900 tracking-tight",
            headerSubtitle: "text-slate-600",
            socialButtonsBlockButton:
              "border border-slate-200 text-slate-800 hover:bg-slate-50 transition-all",
            dividerText: "text-slate-400",
            formFieldLabel: "text-slate-600",
            formFieldInput:
              "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/70 h-12 rounded-xl",
            formButtonPrimary:
              "bg-indigo-500 text-white hover:bg-indigo-600 h-12 rounded-xl shadow-sm",
            footerActionText: "text-slate-500",
            footerActionLink: "text-indigo-600",
          },
        }}
      />
    </TeslaAuthLayout>
  );
}

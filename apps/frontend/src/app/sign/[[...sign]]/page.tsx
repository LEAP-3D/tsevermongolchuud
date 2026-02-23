"use client";

import TeslaAuthLayout from "../../components/TeslaAuthLayout";
import { useCallback, useState } from "react";
import { setStoredUser, type AuthUser } from "@/lib/auth";
import ExtensionSetupCard from "../../components/ExtensionSetupCard";
import SignUpForm from "../../components/SignUpForm";

export default function SignPage() {
  const [signedUpUser, setSignedUpUser] = useState<AuthUser | null>(null);
  const [extensionStatus, setExtensionStatus] = useState<"checking" | "installed" | "not-installed">(
    "checking",
  );

  const checkExtensionInstalled = useCallback(() => {
    setExtensionStatus("checking");
    let timeoutId: number | null = null;

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const payload = event.data;
      if (payload?.source === "safekid-extension" && payload?.type === "SAFEKID_EXTENSION_INSTALLED") {
        setExtensionStatus("installed");
        if (timeoutId) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        window.removeEventListener("message", onMessage);
      }
    };

    window.addEventListener("message", onMessage);
    window.postMessage({ type: "SAFEKID_EXTENSION_PING" }, "*");
    timeoutId = window.setTimeout(() => {
      setExtensionStatus("not-installed");
      window.removeEventListener("message", onMessage);
    }, 1500);
  }, []);

  return (
    <TeslaAuthLayout mode="signup">
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-600 text-sm">Start protecting your family in minutes.</p>
        </div>

        {!signedUpUser ? (
          <SignUpForm
            onSuccess={(user) => {
              setStoredUser(user);
              setSignedUpUser(user);
              checkExtensionInstalled();
            }}
          />
        ) : (
          <ExtensionSetupCard
            extensionStatus={extensionStatus}
            onRecheck={checkExtensionInstalled}
            onContinue={() => (window.location.href = "/home")}
          />
        )}

        <div />
      </div>
    </TeslaAuthLayout>
  );
}

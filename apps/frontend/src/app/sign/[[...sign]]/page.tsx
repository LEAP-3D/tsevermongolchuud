"use client";

import TeslaAuthLayout from "../../components/TeslaAuthLayout";
import { useCallback, useState } from "react";
import { setStoredUser, type AuthUser } from "@/lib/auth";
import { detectSafekidExtensionInstalled } from "@/lib/extensionDetection";
import ExtensionSetupCard from "../../components/ExtensionSetupCard";
import SignUpForm from "../../components/SignUpForm";

export default function SignPage() {
  const [signedUpUser, setSignedUpUser] = useState<AuthUser | null>(null);
  const [extensionStatus, setExtensionStatus] = useState<"checking" | "installed" | "not-installed">(
    "checking",
  );

  const checkExtensionInstalled = useCallback(() => {
    const run = async () => {
      setExtensionStatus("checking");
      const installed = await detectSafekidExtensionInstalled();
      setExtensionStatus(installed ? "installed" : "not-installed");
    };
    void run();
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

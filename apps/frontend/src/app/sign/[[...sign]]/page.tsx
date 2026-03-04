"use client";

import TeslaAuthLayout from "../../components/TeslaAuthLayout";
import { useState } from "react";
import { setStoredUser, type AuthUser } from "@/lib/auth";
import ExtensionSetupCard from "../../components/ExtensionSetupCard";
import SignUpForm from "../../components/SignUpForm";
import { getExtensionStoreUrl } from "@/lib/extensionStore";

export default function SignPage() {
  const extensionStoreUrl = getExtensionStoreUrl();
  const [signedUpUser, setSignedUpUser] = useState<AuthUser | null>(null);

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
            }}
          />
        ) : (
          <ExtensionSetupCard
            storeUrl={extensionStoreUrl}
            onContinue={() => (window.location.href = "/home")}
          />
        )}

        <div />
      </div>
    </TeslaAuthLayout>
  );
}

"use client";

type ExtensionSetupCardProps = {
  extensionStatus: "checking" | "installed" | "not-installed";
  onRecheck: () => void;
  onContinue: () => void;
};

export default function ExtensionSetupCard({
  extensionStatus,
  onRecheck,
  onContinue,
}: ExtensionSetupCardProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-base font-semibold text-slate-900">Install Chrome Extension</h3>
      <p className="text-sm text-slate-600">
        Before using parental controls, install and enable the SafeKid extension in this browser.
      </p>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
        <li>Open <code>chrome://extensions</code></li>
        <li>Enable <strong>Developer mode</strong></li>
        <li>
          Click <strong>Load unpacked</strong> and select{" "}
          <code>/Users/25LP6386/Desktop/tsevermongolchuud/apps/chrome-extension</code>
        </li>
      </ol>

      <div
        className={`rounded-lg border px-3 py-2 text-sm ${
          extensionStatus === "installed"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : extensionStatus === "not-installed"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        {extensionStatus === "installed" && "Extension detected in this browser."}
        {extensionStatus === "not-installed" && "Extension not detected yet. Install it, then click Re-check."}
        {extensionStatus === "checking" && "Checking extension status..."}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRecheck}
          className="h-11 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Re-check Extension
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="h-11 rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white transition hover:bg-indigo-600"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}

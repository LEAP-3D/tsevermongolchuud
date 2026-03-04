"use client";

type ExtensionSetupCardProps = {
  storeUrl: string;
  onContinue: () => void;
};

export default function ExtensionSetupCard({
  storeUrl,
  onContinue,
}: ExtensionSetupCardProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-base font-semibold text-slate-900">Install the Safe-kid extension</h3>
      <p className="text-sm text-slate-600">
        The extension runs in the child browser to capture visited URLs and usage time, then syncs
        it with the parent dashboard.
      </p>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
        <li>Install the extension in the child browser.</li>
        <li>Enter the child PIN shown in the dashboard.</li>
        <li>Start monitoring usage and adjust limits anytime.</li>
      </ol>

      <div className="flex gap-2">
        <a
          href={storeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Open Chrome Web Store
        </a>
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

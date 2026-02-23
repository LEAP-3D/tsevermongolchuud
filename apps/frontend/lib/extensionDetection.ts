"use client";

export type ExtensionStatus = "checking" | "installed" | "not-installed";

const EXTENSION_SOURCE = "safekid-extension";
const EXTENSION_PING_TYPE = "SAFEKID_EXTENSION_PING";
const EXTENSION_INSTALLED_TYPE = "SAFEKID_EXTENSION_INSTALLED";

export const detectSafekidExtensionInstalled = (timeoutMs = 1500): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    let settled = false;
    let timeoutId: number | null = null;

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };

    const finish = (installed: boolean) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(installed);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const payload = event.data;
      if (
        payload?.source === EXTENSION_SOURCE &&
        payload?.type === EXTENSION_INSTALLED_TYPE
      ) {
        finish(true);
      }
    };

    window.addEventListener("message", onMessage);
    window.postMessage({ type: EXTENSION_PING_TYPE }, "*");
    timeoutId = window.setTimeout(() => finish(false), timeoutMs);
  });

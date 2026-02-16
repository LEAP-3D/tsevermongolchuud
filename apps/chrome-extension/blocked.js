const API_BASE = "http://localhost:5000/api";
const API_AUTH_BASE = "http://localhost:5000/api/auth";
const OVERRIDE_MS = 15 * 60 * 1000;
const POLICY_KEYS = [
  "lastBlockedUrl",
  "lastBlockReason",
  "lastBlockSource",
  "lastPolicyUpdatedAt",
];

let isChecking = false;

const statusEl = document.getElementById("auto-status");
const explanationEl = document.getElementById("block-explanation");
const noticeEl = document.getElementById("block-notice");
const errorEl = document.getElementById("unblock-error");
const passwordEl = document.getElementById("parent-pass");
const buttonEl = document.getElementById("btn-parent-unblock");

function setStatus(message, tone = "neutral") {
  if (!statusEl) return;
  statusEl.innerText = message || "";
  statusEl.classList.remove("error", "success");
  if (tone === "error") statusEl.classList.add("error");
  if (tone === "success") statusEl.classList.add("success");
}

function setButtonBusy(busy, busyLabel) {
  if (!buttonEl) return;
  if (!buttonEl.dataset.defaultLabel) {
    buttonEl.dataset.defaultLabel = buttonEl.innerText;
  }
  buttonEl.disabled = busy;
  buttonEl.innerText = busy ? busyLabel : buttonEl.dataset.defaultLabel;
}

async function goToUrl(url) {
  if (!url) return;
  const currentTab = await chrome.tabs.getCurrent().catch(() => null);
  if (currentTab?.id) {
    await chrome.tabs.update(currentTab.id, { url });
    return;
  }
  window.location.replace(url);
}

async function isOverrideActive() {
  const storage = await chrome.storage.local.get(["parentOverrideUntil"]);
  const until = Number(storage.parentOverrideUntil);
  if (!Number.isFinite(until) || until <= Date.now()) {
    if (storage.parentOverrideUntil) {
      await chrome.storage.local.remove(["parentOverrideUntil"]);
    }
    return false;
  }
  return true;
}

function applyBlockCopy(source, reason) {
  if (!explanationEl || !noticeEl) return;

  if (source === "PARENT") {
    explanationEl.textContent = "This site is blocked by parent settings.";
    noticeEl.textContent = "Parent rule is active for this site.";
    return;
  }

  if (source === "AI") {
    explanationEl.textContent = "This site is blocked by AI safety analysis.";
    noticeEl.textContent = "AI protection flagged this page as unsafe.";
    return;
  }

  if (reason === "DAILY_LIMIT_EXCEEDED") {
    explanationEl.textContent = "Daily time limit has been reached.";
    noticeEl.textContent = "Access will restore when time is refreshed.";
    return;
  }

  if (reason === "TIME_LIMIT_EXCEEDED") {
    explanationEl.textContent = "Time limit for this category has been reached.";
    noticeEl.textContent = "Please update limits from parent controls.";
    return;
  }

  explanationEl.textContent = "Access is currently blocked by SafeKid policy.";
  noticeEl.textContent = "Policy is being checked in real time.";
}

async function refreshBlockMetaFromStorage() {
  const storage = await chrome.storage.local.get([
    "lastBlockReason",
    "lastBlockSource",
  ]);
  applyBlockCopy(storage.lastBlockSource, storage.lastBlockReason);
}

async function handleParentUnblock() {
  const password = passwordEl?.value?.trim();
  if (errorEl) errorEl.innerText = "";

  if (!password) {
    if (errorEl) errorEl.innerText = "Parent password is required.";
    return;
  }

  setButtonBusy(true, "Checking...");
  setStatus("Verifying parent credentials...");
  try {
    const storage = await chrome.storage.local.get([
      "parentToken",
      "lastBlockedUrl",
      "activeChildId",
    ]);

    if (!storage.parentToken) {
      if (errorEl) errorEl.innerText = "Parent account is not logged in on this extension.";
      setStatus("Parent session is missing.", "error");
      return;
    }

    if (!storage.activeChildId) {
      if (errorEl) errorEl.innerText = "Active child is missing.";
      setStatus("Active child is missing.", "error");
      return;
    }

    const verifyResponse = await fetch(`${API_AUTH_BASE}/grant-daily-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: storage.parentToken,
        password,
        childId: storage.activeChildId,
        seconds: OVERRIDE_MS / 1000,
      }),
    });
    const verifyData = await verifyResponse.json().catch(() => ({}));
    if (!verifyResponse.ok || !verifyData?.success) {
      if (errorEl) errorEl.innerText = verifyData?.message || "Password verification failed.";
      setStatus("Parent verification failed.", "error");
      return;
    }

    const overrideResponse = await chrome.runtime.sendMessage({
      type: "PARENT_UNBLOCK_OVERRIDE",
      url: storage.lastBlockedUrl,
      durationMs: OVERRIDE_MS,
    });

    if (!overrideResponse?.success) {
      if (errorEl) errorEl.innerText = "Could not apply unblock override.";
      setStatus("Could not apply temporary unblock.", "error");
      return;
    }

    if (passwordEl) passwordEl.value = "";
    setStatus("Parent override is active. Returning to site...", "success");

    if (storage.lastBlockedUrl) {
      await goToUrl(storage.lastBlockedUrl);
    }
  } catch {
    if (errorEl) errorEl.innerText = "Server connection failed.";
    setStatus("Server connection failed.", "error");
  } finally {
    setButtonBusy(false, "Checking...");
  }
}

async function tryAutoRestore() {
  if (isChecking) return;
  isChecking = true;

  try {
    const { activeChildId, lastBlockedUrl } = await chrome.storage.local.get([
      "activeChildId",
      "lastBlockedUrl",
    ]);
    await refreshBlockMetaFromStorage();

    const overrideActive = await isOverrideActive();
    if (overrideActive && lastBlockedUrl) {
      await chrome.storage.local.remove(POLICY_KEYS);
      await goToUrl(lastBlockedUrl);
      return;
    }

    if (!activeChildId) {
      setStatus("Child account is not active.", "error");
      return;
    }

    if (!lastBlockedUrl) {
      setStatus("Blocked URL not found.", "error");
      return;
    }

    const response = await fetch(`${API_BASE}/check-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId: activeChildId,
        url: lastBlockedUrl,
        dryRun: true,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (data?.action !== "BLOCK") {
      await chrome.storage.local.remove(POLICY_KEYS);
      setStatus("Policy updated. Restoring access...", "success");
      await goToUrl(lastBlockedUrl);
      return;
    }

    await chrome.storage.local.set({
      lastBlockReason: typeof data?.reason === "string" ? data.reason : "UNKNOWN",
      lastBlockSource: typeof data?.source === "string" ? data.source : "SYSTEM",
      lastPolicyUpdatedAt: Date.now(),
    });
    await refreshBlockMetaFromStorage();
    setStatus("Blocked by active policy. Rechecking...");
  } catch {
    setStatus("Server connection failed. Retrying...", "error");
  } finally {
    isChecking = false;
  }
}

document.getElementById("btn-parent-unblock")?.addEventListener("click", () => {
  void handleParentUnblock();
});

document.getElementById("parent-pass")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    void handleParentUnblock();
  }
});

void tryAutoRestore();
setInterval(() => {
  void tryAutoRestore();
}, 1000);

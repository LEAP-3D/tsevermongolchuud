const API_BASE = "http://localhost:5000/api/auth";
let remainingTimer = null;

// DOM Elements
const views = {
  parentLogin: document.getElementById("view-parent-login"),
  childSelect: document.getElementById("view-child-select"),
  pinEntry: document.getElementById("view-pin"),
  dashboard: document.getElementById("view-dashboard"),
  logoutConfirm: document.getElementById("view-logout-confirm"),
};

let selectedChildTemp = null; // PIN хийхээр сонгосон хүүхэд

// Init
document.addEventListener("DOMContentLoaded", async () => {
  const data = await chrome.storage.local.get([
    "parentToken",
    "activeChildId",
    "activeChildName",
    "childrenList",
  ]);

  if (!data.parentToken) {
    showView("parentLogin");
  } else if (data.activeChildId) {
    document.getElementById("active-user-name").innerText =
      data.activeChildName;
    showView("dashboard");
    startRemainingPolling(data.activeChildId);
  } else {
    renderChildList(data.childrenList || []);
    showView("childSelect");
  }
});

// --- ACTIONS ---

// 1. Parent Login
document.getElementById("btn-p-login").onclick = async () => {
  const email = document.getElementById("p-email").value;
  const password = document.getElementById("p-pass").value;
  const errBox = document.getElementById("err-login");

  try {
    const res = await fetch(`${API_BASE}/parent-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success) {
      chrome.storage.local.set({
        parentToken: data.token,
        childrenList: data.children, // [{id:1, name:"Bat"}, ...]
      });
      renderChildList(data.children);
      showView("childSelect");
    } else {
      errBox.innerText = data.message || "Нэвтрэх бүтсэнгүй";
    }
  } catch (e) {
    errBox.innerText = "Сервертэй холбогдож чадсангүй";
  }
};

// 2. Child Select & PIN
function renderChildList(children) {
  const container = document.getElementById("child-list");
  container.innerHTML = "";
  children.forEach((child) => {
    const btn = document.createElement("button");
    btn.className = "child-btn";
    btn.innerText = child.name;
    btn.onclick = () => {
      selectedChildTemp = child;
      document.getElementById("pin-title").innerText =
        `${child.name} - PIN код?`;
      document.getElementById("child-pin").value = "";
      showView("pinEntry");
    };
    container.appendChild(btn);
  });
}

document.getElementById("btn-verify-pin").onclick = async () => {
  const pin = document.getElementById("child-pin").value;
  const errBox = document.getElementById("err-pin");

  try {
    const res = await fetch(`${API_BASE}/verify-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: selectedChildTemp.id, pin }),
    });
    const data = await res.json();

    if (data.success) {
      chrome.storage.local.set({
        activeChildId: selectedChildTemp.id,
        activeChildName: selectedChildTemp.name,
      });
      document.getElementById("active-user-name").innerText =
        selectedChildTemp.name;
      showView("dashboard");
      startRemainingPolling(selectedChildTemp.id);

      // "Login Required" хуудсыг хаах эсвэл refresh хийх
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.reload(tabs[0].id);
      });
    } else {
      errBox.innerText = "PIN код буруу байна";
    }
  } catch (e) {
    errBox.innerText = "Алдаа гарлаа";
  }
};

document.getElementById("btn-back-select").onclick = () =>
  showView("childSelect");

async function resetDailyTimerFor15Minutes() {
  const statusEl = document.getElementById("reset-status");
  const buttonEl = document.getElementById("btn-reset-timer");
  const storage = await chrome.storage.local.get(["parentToken", "activeChildId"]);

  if (statusEl) statusEl.innerText = "";
  if (!storage.parentToken || !storage.activeChildId) {
    if (statusEl) statusEl.innerText = "Missing parent or child session.";
    return;
  }

  const password = window.prompt("Enter parent password to reset timer (+15m):");
  if (!password) return;

  if (buttonEl) buttonEl.disabled = true;
  try {
    const res = await fetch(`${API_BASE}/grant-daily-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: storage.parentToken,
        password,
        childId: storage.activeChildId,
        seconds: 15 * 60,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      if (statusEl) statusEl.innerText = data?.message || "Timer reset failed.";
      return;
    }

    if (statusEl) statusEl.innerText = "Timer reset: 15 minutes available.";
    await updateRemaining(storage.activeChildId);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]?.id) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  } catch {
    if (statusEl) statusEl.innerText = "Server connection failed.";
  } finally {
    if (buttonEl) buttonEl.disabled = false;
  }
}

// 3. Switch User (Logout Child only)
document.getElementById("btn-switch-user").onclick = () => {
  chrome.storage.local.remove(
    ["activeChildId", "activeChildName", "lastBlockedUrl", "parentOverrideUntil"],
    () => {
      stopRemainingPolling();
      showView("childSelect");
      // Reload current tab to force block
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.reload(tabs[0].id);
      });
    },
  );
};

document.getElementById("btn-reset-timer").onclick = () => {
  void resetDailyTimerFor15Minutes();
};

// 4. Parent Logout (Full Logout)
document.getElementById("btn-p-logout").onclick = () =>
  showView("logoutConfirm");
document.getElementById("btn-cancel-logout").onclick = () =>
  showView("childSelect");

document.getElementById("btn-confirm-logout").onclick = async () => {
  const password = document.getElementById("logout-pass").value;
  // Password verify API дуудна (Security)
  // ... (API call simulation)
  // if success:
  chrome.storage.local.clear(() => {
    stopRemainingPolling();
    location.reload(); // Reset popup
  });
};

function formatSeconds(value) {
  const total = Math.max(0, Math.floor(Number(value) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

async function updateRemaining(childId) {
  const label = document.getElementById("daily-remaining");
  if (!label) return;
  try {
    const res = await fetch(`${API_BASE}/daily-remaining?childId=${encodeURIComponent(String(childId))}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      label.innerText = "Unavailable";
      return;
    }
    if (data.limitSeconds === null || data.limitSeconds === undefined) {
      label.innerText = "No daily limit";
      return;
    }
    label.innerText = data.isBlocked
      ? `Blocked (0s left of ${formatSeconds(data.limitSeconds)})`
      : `${formatSeconds(data.remainingSeconds)} left of ${formatSeconds(data.limitSeconds)}`;
  } catch {
    label.innerText = "Unavailable";
  }
}

function stopRemainingPolling() {
  if (remainingTimer) {
    clearInterval(remainingTimer);
    remainingTimer = null;
  }
}

function startRemainingPolling(childId) {
  stopRemainingPolling();
  void updateRemaining(childId);
  remainingTimer = setInterval(() => {
    void updateRemaining(childId);
  }, 1000);
}

// Helper: View Switcher
function showView(viewName) {
  if (viewName !== "dashboard") {
    stopRemainingPolling();
  }
  Object.values(views).forEach((el) => el.classList.add("hidden"));
  views[viewName].classList.remove("hidden");
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { Child } from "./types";
import { clearStoredUser, useAuthUser } from "@/lib/auth";

export default function SettingsContent() {
  const { user } = useAuthUser();
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [realtimeAlerts, setRealtimeAlerts] = useState(true);
  const [activeSecurityModal, setActiveSecurityModal] = useState<null | "password" | "2fa" | "export">(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpType, setHelpType] = useState<"Suggestion" | "Request" | "Other">("Suggestion");
  const [helpMessage, setHelpMessage] = useState("");
  const [helpPhone, setHelpPhone] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [childrenError, setChildrenError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadChildren = async () => {
    if (!user?.id) {
      setChildren([]);
      return;
    }
    setChildrenLoading(true);
    setChildrenError("");
    try {
      const response = await fetch(`/api/child?parentId=${encodeURIComponent(String(user.id))}`);
      if (!response.ok) {
        let message = "Failed to load children.";
        try {
          const payload = await response.json();
          if (payload?.error) {
            message = String(payload.error);
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }
      const data: Array<{ id: number; name: string; pin?: string | null }> = await response.json();
      const mapped: Child[] = data.map((child) => ({
        id: child.id,
        name: child.name,
        status: "Active",
        todayUsage: "0h 0m",
        pin: child.pin ?? "----",
        avatar: child.name?.[0]?.toUpperCase() ?? "C",
      }));
      setChildren(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load children.";
      setChildrenError(message);
    } finally {
      setChildrenLoading(false);
    }
  };

  useEffect(() => {
    void loadChildren();
  }, [user?.id]);

  const handleDeleteChild = async (childId: number, childName: string) => {
    const confirmed = window.confirm(`Delete ${childName}? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(childId);
    setChildrenError("");
    try {
      const response = await fetch("/api/child", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: childId }),
      });
      if (!response.ok) {
        let message = "Failed to delete child.";
        try {
          const payload = await response.json();
          if (payload?.error) {
            message = String(payload.error);
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }
      setChildren((prev) => prev.filter((child) => child.id !== childId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete child.";
      setChildrenError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const resetHelpForm = () => {
    setHelpType("Suggestion");
    setHelpMessage("");
    setHelpPhone("");
  };

  const closeHelpModal = () => {
    setShowHelpModal(false);
    resetHelpForm();
  };

  const submitHelpForm = () => {
    if (!helpMessage.trim()) {
      return;
    }
    setShowHelpModal(false);
    resetHelpForm();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-1">Settings</h1>
        <p className="text-sm md:text-base text-gray-500">Manage your ParentGuard account and preferences</p>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500">Receive alerts via email</p>
            </div>
            <button
              onClick={() => setEmailNotifications(prev => !prev)}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg ${
                emailNotifications ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {emailNotifications ? "On" : "Off"}
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Weekly Reports</p>
              <p className="text-xs text-gray-500">Get summary every Monday</p>
            </div>
            <button
              onClick={() => setWeeklyReports(prev => !prev)}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg ${
                weeklyReports ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {weeklyReports ? "On" : "Off"}
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Real-time Alerts</p>
              <p className="text-xs text-gray-500">Instant notifications for risks</p>
            </div>
            <button
              onClick={() => setRealtimeAlerts(prev => !prev)}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg ${
                realtimeAlerts ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {realtimeAlerts ? "On" : "Off"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h3>
        <div className="space-y-3">
          <button
            onClick={() => setActiveSecurityModal("password")}
            className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <p className="text-sm font-semibold text-gray-900">Change Password</p>
            <p className="text-xs text-gray-500">Update your account password</p>
          </button>
          <button
            onClick={() => setActiveSecurityModal("2fa")}
            className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
            <p className="text-xs text-gray-500">Add extra security layer</p>
          </button>
          <button
            onClick={() => setActiveSecurityModal("export")}
            className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <p className="text-sm font-semibold text-gray-900">Data Export</p>
            <p className="text-xs text-gray-500">Download your monitoring data</p>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Manage Children</h3>
          <button
            onClick={() => void loadChildren()}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
        {childrenLoading && (
          <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Loading children...
          </div>
        )}
        {childrenError && (
          <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {childrenError}
          </div>
        )}
        {children.length === 0 && !childrenLoading && !childrenError && (
          <p className="text-sm text-gray-500">No children found.</p>
        )}
        <div className="space-y-3">
          {children.map(child => (
            <div key={child.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center">
                  {child.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{child.name}</p>
                  <p className="text-xs text-gray-500">PIN: {child.pin}</p>
                </div>
              </div>
              <button
                onClick={() => void handleDeleteChild(child.id, child.name)}
                disabled={deletingId === child.id}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deletingId === child.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 md:p-6 border border-blue-100">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
        <p className="text-sm text-gray-700 mb-4">Our support team is here to assist you with any questions.</p>
        <button
          onClick={() => setShowHelpModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
        >
          Contact Support
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Account</h3>
        <p className="text-sm text-gray-500 mb-4">Sign out of your account on this device.</p>
        <button
          onClick={() => {
            clearStoredUser();
            router.push("/login");
          }}
          className="w-full sm:w-auto px-6 py-3 bg-white text-blue-600 font-medium rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors"
        >
          Log Out
        </button>
      </div>

      {activeSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900">
                {activeSecurityModal === "password" && "Change Password"}
                {activeSecurityModal === "2fa" && "Two-Factor Authentication"}
                {activeSecurityModal === "export" && "Data Export"}
              </h4>
              <button
                onClick={() => setActiveSecurityModal(null)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {activeSecurityModal === "password" && (
                <>
                  <p className="text-sm text-gray-600">Update your password to keep your account secure.</p>
                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActiveSecurityModal(null)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">
                      Update Password
                    </button>
                  </div>
                </>
              )}
              {activeSecurityModal === "2fa" && (
                <>
                  <p className="text-sm text-gray-600">
                    Enable two-factor authentication for extra account protection.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                    Use an authenticator app to scan a QR code and enter the verification code.
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActiveSecurityModal(null)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">
                      Enable 2FA
                    </button>
                  </div>
                </>
              )}
              {activeSecurityModal === "export" && (
                <>
                  <p className="text-sm text-gray-600">Export your monitoring data as a CSV file.</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActiveSecurityModal(null)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">
                      Download CSV
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900">Contact Support</h4>
              <button
                onClick={closeHelpModal}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={helpType}
                  onChange={event =>
                    setHelpType(event.target.value === "Request" ? "Request" : event.target.value === "Other" ? "Other" : "Suggestion")
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Suggestion">Suggestion</option>
                  <option value="Request">Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={helpMessage}
                  onChange={event => setHelpMessage(event.target.value)}
                  rows={4}
                  placeholder="Write your suggestion or request..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  value={helpPhone}
                  onChange={event => setHelpPhone(event.target.value)}
                  placeholder="+976 9xxxxxxx"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeHelpModal}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitHelpForm}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

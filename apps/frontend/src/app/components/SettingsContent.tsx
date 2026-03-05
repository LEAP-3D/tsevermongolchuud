"use client";
/* eslint-disable max-lines */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { Child } from "./types";
import { withApiBase } from "@/lib/apiBase";
import { clearStoredUser, useAuthUser } from "@/lib/auth";

type NotificationSettingKey = "emailNotifications" | "weeklyReports" | "realtimeAlerts";

export default function SettingsContent({
  preferredChildId = null,
}: {
  preferredChildId?: number | null;
}) {
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
  const [highlightChildId, setHighlightChildId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdateNotice, setPasswordUpdateNotice] = useState("");
  const [passwordUpdateError, setPasswordUpdateError] = useState("");
  const [passwordUpdateSubmitting, setPasswordUpdateSubmitting] = useState(false);
  const [deleteAccountSubmitting, setDeleteAccountSubmitting] = useState(false);
  const [deleteAccountNotice, setDeleteAccountNotice] = useState("");
  const [showDeleteAccountWarning, setShowDeleteAccountWarning] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [notificationSettingsLoading, setNotificationSettingsLoading] = useState(false);
  const [notificationSettingsSaving, setNotificationSettingsSaving] =
    useState<NotificationSettingKey | null>(null);
  const [notificationSettingsError, setNotificationSettingsError] = useState("");

  const loadNotificationSettings = useCallback(async () => {
    if (!user?.id) return;
    setNotificationSettingsLoading(true);
    setNotificationSettingsError("");
    try {
      const response = await fetch(withApiBase("/api/notification-settings"), {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        let message = "Failed to load notification settings.";
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

      const payload = (await response.json()) as {
        emailNotifications?: boolean;
        weeklyReports?: boolean;
        realtimeAlerts?: boolean;
      };
      setEmailNotifications(
        typeof payload.emailNotifications === "boolean" ? payload.emailNotifications : true,
      );
      setWeeklyReports(typeof payload.weeklyReports === "boolean" ? payload.weeklyReports : true);
      setRealtimeAlerts(typeof payload.realtimeAlerts === "boolean" ? payload.realtimeAlerts : true);
    } catch (error) {
      setNotificationSettingsError(
        error instanceof Error ? error.message : "Failed to load notification settings.",
      );
    } finally {
      setNotificationSettingsLoading(false);
    }
  }, [user?.id]);

  const loadChildren = useCallback(async () => {
    if (!user?.id) {
      setChildren([]);
      return;
    }
    setChildrenLoading(true);
    setChildrenError("");
    try {
      const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const response = await fetch(
        withApiBase(`/api/child?parentId=${encodeURIComponent(String(user.id))}&timeZone=${encodeURIComponent(localTimeZone)}`),
      { credentials: "include" },
      );
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
      const data: Array<{
        id: number;
        name: string;
        pin?: string | null;
        todayUsageMinutes?: number;
      }> = await response.json();
      const mapped: Child[] = data.map((child) => ({
        id: child.id,
        name: child.name,
        status: "Active",
        todayUsage: `${Math.floor((Number(child.todayUsageMinutes) || 0) / 60)}h ${
          Math.max(0, Math.round(Number(child.todayUsageMinutes) || 0)) % 60
        }m`,
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
  }, [user?.id]);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren, user?.id]);

  useEffect(() => {
    void loadNotificationSettings();
  }, [loadNotificationSettings]);

  const toggleNotificationSetting = async (key: NotificationSettingKey) => {
    if (notificationSettingsSaving || notificationSettingsLoading) return;

    const previous = {
      emailNotifications,
      weeklyReports,
      realtimeAlerts,
    };
    const nextValue = !previous[key];
    if (key === "emailNotifications") setEmailNotifications(nextValue);
    if (key === "weeklyReports") setWeeklyReports(nextValue);
    if (key === "realtimeAlerts") setRealtimeAlerts(nextValue);

    setNotificationSettingsSaving(key);
    setNotificationSettingsError("");
    try {
      const response = await fetch(withApiBase("/api/notification-settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [key]: nextValue }),
      });
      const payload = (await response.json()) as {
        error?: string;
        emailNotifications?: boolean;
        weeklyReports?: boolean;
        realtimeAlerts?: boolean;
      };

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to update notification settings.");
      }

      setEmailNotifications(
        typeof payload.emailNotifications === "boolean"
          ? payload.emailNotifications
          : previous.emailNotifications,
      );
      setWeeklyReports(
        typeof payload.weeklyReports === "boolean" ? payload.weeklyReports : previous.weeklyReports,
      );
      setRealtimeAlerts(
        typeof payload.realtimeAlerts === "boolean"
          ? payload.realtimeAlerts
          : previous.realtimeAlerts,
      );
    } catch (error) {
      setEmailNotifications(previous.emailNotifications);
      setWeeklyReports(previous.weeklyReports);
      setRealtimeAlerts(previous.realtimeAlerts);
      setNotificationSettingsError(
        error instanceof Error ? error.message : "Failed to update notification settings.",
      );
    } finally {
      setNotificationSettingsSaving(null);
    }
  };

  useEffect(() => {
    if (!preferredChildId) return;
    if (!children.some((child) => child.id === preferredChildId)) return;
    setHighlightChildId(preferredChildId);
    const target = document.getElementById(`settings-child-${preferredChildId}`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeout = window.setTimeout(() => {
      setHighlightChildId((current) => (current === preferredChildId ? null : current));
    }, 2200);
    return () => window.clearTimeout(timeout);
  }, [children, preferredChildId]);

  const handleDeleteChild = async (childId: number, childName: string) => {
    const confirmed = window.confirm(`Delete ${childName}? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(childId);
    setChildrenError("");
    try {
      const response = await fetch(withApiBase("/api/child"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  const closeSecurityModal = () => {
    setActiveSecurityModal(null);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordUpdateNotice("");
    setPasswordUpdateError("");
    setPasswordUpdateSubmitting(false);
  };

  const submitPasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordUpdateError("Please enter and confirm your new password.");
      setPasswordUpdateNotice("");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordUpdateError("Password and confirm password must match.");
      setPasswordUpdateNotice("");
      return;
    }

    setPasswordUpdateSubmitting(true);
    setPasswordUpdateError("");
    setPasswordUpdateNotice("");
    try {
      const response = await fetch(withApiBase("/api/auth/password/change/request"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const payload = (await response.json()) as { error?: string; emailSent?: boolean };
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to request password change.");
      }
      setNewPassword("");
      setConfirmPassword("");
      setPasswordUpdateNotice(
        payload?.emailSent
          ? "Password change confirmation email sent. Please check your inbox."
          : "We couldn't send the email right now. Please try again.",
      );
    } catch (err) {
      setPasswordUpdateError(
        err instanceof Error ? err.message : "Failed to request password change.",
      );
    } finally {
      setPasswordUpdateSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountSubmitting(true);
    setDeleteAccountNotice("");
    setAccountError("");
    try {
      const response = await fetch(withApiBase("/api/auth/account/delete/request"), {
        method: "POST",
        credentials: "include",
      });
      const payload = (await response.json()) as { error?: string; emailSent?: boolean };
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete account.");
      }
      setDeleteAccountNotice(
        payload?.emailSent
          ? "Account deletion confirmation email sent. Please check your inbox."
          : "We couldn't send the email right now. Please try again.",
      );
      setShowDeleteAccountWarning(false);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : "Failed to delete account.");
    } finally {
      setDeleteAccountSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-3xl font-semibold text-gray-900 mb-1">Settings</h1>
        <p className="text-xs md:text-sm text-gray-500">Manage your ParentGuard account and preferences</p>
      </div>

      <div className="bg-white rounded-2xl p-3.5 md:p-5 border border-gray-200/80">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          {notificationSettingsLoading && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Loading notification settings...
            </div>
          )}
          {notificationSettingsError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {notificationSettingsError}
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500">Receive alerts via email</p>
            </div>
            <button
              onClick={() => void toggleNotificationSetting("emailNotifications")}
              disabled={notificationSettingsLoading || notificationSettingsSaving !== null}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg disabled:cursor-not-allowed disabled:opacity-60 ${
                emailNotifications ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {notificationSettingsSaving === "emailNotifications"
                ? "Saving..."
                : emailNotifications
                  ? "On"
                  : "Off"}
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Weekly Reports</p>
              <p className="text-xs text-gray-500">Get summary every Monday</p>
            </div>
            <button
              onClick={() => void toggleNotificationSetting("weeklyReports")}
              disabled={notificationSettingsLoading || notificationSettingsSaving !== null}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg disabled:cursor-not-allowed disabled:opacity-60 ${
                weeklyReports ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {notificationSettingsSaving === "weeklyReports" ? "Saving..." : weeklyReports ? "On" : "Off"}
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Real-time Alerts</p>
              <p className="text-xs text-gray-500">Instant notifications for risks</p>
            </div>
            <button
              onClick={() => void toggleNotificationSetting("realtimeAlerts")}
              disabled={notificationSettingsLoading || notificationSettingsSaving !== null}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg disabled:cursor-not-allowed disabled:opacity-60 ${
                realtimeAlerts ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {notificationSettingsSaving === "realtimeAlerts" ? "Saving..." : realtimeAlerts ? "On" : "Off"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-3.5 md:p-5 border border-gray-200/80">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Privacy & Security</h3>
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

      <div className="bg-white rounded-2xl p-3.5 md:p-5 border border-gray-200/80">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Manage Children</h3>
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
            <div
              key={child.id}
              id={`settings-child-${child.id}`}
              className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border p-4 transition-colors ${
                highlightChildId === child.id
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
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

      <div className="bg-blue-50 rounded-2xl p-3.5 md:p-5 border border-blue-100">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">Need Help?</h3>
        <p className="text-sm text-gray-700 mb-4">Our support team is here to assist you with any questions.</p>
        <button
          onClick={() => setShowHelpModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
        >
          Contact Support
        </button>
      </div>

      <div className="bg-white rounded-2xl p-3.5 md:p-5 border border-gray-200/80">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">Account</h3>
        <p className="text-sm text-gray-500 mb-4">Sign out or permanently delete your account.</p>
        {accountError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {accountError}
          </div>
        )}
        {deleteAccountNotice && (
          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {deleteAccountNotice}
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={async () => {
              try {
                await fetch(withApiBase("/api/auth/logout"), {
                  method: "POST",
                  credentials: "include",
                });
              } catch {
                // ignore logout network errors; local state is still cleared
              }
              clearStoredUser();
              router.push("/login");
            }}
            className="w-full sm:w-auto px-6 py-3 bg-white text-blue-600 font-medium rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            Log Out
          </button>
          <button
            onClick={() => setShowDeleteAccountWarning(true)}
            disabled={deleteAccountSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-medium rounded-xl border border-red-600 hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleteAccountSubmitting ? "Sending..." : "Delete Account"}
          </button>
        </div>
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
                onClick={closeSecurityModal}
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
                  {passwordUpdateError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {passwordUpdateError}
                    </div>
                  )}
                  {passwordUpdateNotice && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                      {passwordUpdateNotice}
                    </div>
                  )}
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={closeSecurityModal}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => void submitPasswordChange()}
                      disabled={passwordUpdateSubmitting}
                      className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {passwordUpdateSubmitting ? "Sending..." : "Update Password"}
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
                      onClick={closeSecurityModal}
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
                      onClick={closeSecurityModal}
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

      {showDeleteAccountWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900">Delete Account</h4>
              <button
                onClick={() => setShowDeleteAccountWarning(false)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                aria-label="Close"
                disabled={deleteAccountSubmitting}
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-700">
                This will request permanent account deletion. We will send a confirmation link to your
                email, and deletion cannot be undone after confirmation.
              </p>
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                Warning: all child profiles and related activity history will be removed.
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteAccountWarning(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={deleteAccountSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleDeleteAccount()}
                  disabled={deleteAccountSubmitting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {deleteAccountSubmitting ? "Sending..." : "Send Delete Link"}
                </button>
              </div>
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

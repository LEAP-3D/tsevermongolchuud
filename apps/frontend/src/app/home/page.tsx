"use client";
/* eslint-disable max-lines */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuthUser } from "@/lib/auth";
import Sidebar from "../components/Sidebar";
import DashboardContent from "../components/DashboardContent";
import BlockingContent from "../components/BlockingContent";
import TimeLimitsContent from "../components/TimeLimitsContent";
import ChildrenContent from "../components/ChildrenContent";
import SettingsContent from "../components/SettingsContent";
import FloatingAIAssistant from "../components/FloatingAIAssistant";
import type {
  CategorySlice,
  CategoryWebsiteDetail,
  ChatMessage,
  Child,
  RiskPoint,
  RiskWebsiteDetail,
  UsagePoint,
} from "../components/types";
import TeslaAuthBackdrop from "../components/TeslaAuthBackdrop";

const QUICK_PROMPTS = [
  "Could you describe my children's internet activity?",
  "Are there any safety concerns today?",
  "Give me a weekly behavior summary.",
  "What limits should I adjust this week?",
];

type AssistantAction =
  | { type: "BLOCK_DOMAIN"; childId?: number; childName?: string; domain?: string }
  | { type: "BLOCK_CATEGORY"; childId?: number; childName?: string; categoryName?: string }
  | { type: "SET_DAILY_LIMIT"; childId?: number; childName?: string; minutes?: number }
  | { type: "SET_SESSION_LIMIT"; childId?: number; childName?: string; minutes?: number };

const describeAction = (action: AssistantAction) => {
  if (action.type === "BLOCK_DOMAIN") return `Block domain: ${action.domain ?? "unknown"}`;
  if (action.type === "BLOCK_CATEGORY") return `Block category: ${action.categoryName ?? "unknown"}`;
  if (action.type === "SET_DAILY_LIMIT") return `Set daily limit: ${action.minutes ?? "?"}m`;
  return `Set session limit: ${action.minutes ?? "?"}m`;
};

export default function HomeDashboard() {
  const { user, loading: authLoading } = useAuthUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddChild, setShowAddChild] = useState(false);
  const [generatedPin, setGeneratedPin] = useState("");
  const [copiedPin, setCopiedPin] = useState(false);
  const [timeFilter, setTimeFilter] = useState("7d");
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [childrenError, setChildrenError] = useState("");
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardRefreshing, setDashboardRefreshing] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [usageData, setUsageData] = useState<UsagePoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySlice[]>([]);
  const [riskData, setRiskData] = useState<RiskPoint[]>([]);
  const [categoryWebsiteDetails, setCategoryWebsiteDetails] = useState<CategoryWebsiteDetail[]>([]);
  const [riskWebsiteDetails, setRiskWebsiteDetails] = useState<RiskWebsiteDetail[]>([]);
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [blockedSites, setBlockedSites] = useState<number | null>(null);
  const [rangeUsageMinutes, setRangeUsageMinutes] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your AI parenting assistant. I can help you understand your children's online activity, answer questions about safety concerns, and provide recommendations. How can I help you today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [pendingActions, setPendingActions] = useState<AssistantAction[]>([]);

  const sendMessage = async (override?: string) => {
    const nextText = (override ?? chatInput).trim();
    if (!nextText || !user?.id || aiThinking) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: nextText,
    };
    const historySnapshot = [...chatMessages, userMessage].slice(-12).map((message) => ({
      sender: message.sender,
      text: message.text,
    }));

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setAiThinking(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: user.id,
          selectedChildId,
          message: nextText,
          chatHistory: historySnapshot,
        }),
      });

      if (!response.ok) {
        let serverError = "AI assistant request failed.";
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload?.error) {
            serverError = payload.error;
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(serverError);
      }

      const payload = (await response.json()) as { reply?: string };
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: payload.reply ?? "I could not generate a response right now. Please try again.",
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      const candidateActions = (payload as { pendingActions?: AssistantAction[] }).pendingActions;
      const needsConfirmation = Boolean(
        (payload as { requiresConfirmation?: boolean }).requiresConfirmation,
      );
      if (needsConfirmation && Array.isArray(candidateActions) && candidateActions.length > 0) {
        setPendingActions(candidateActions);
      } else {
        setPendingActions([]);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "AI assistant request failed. Please try again.";
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: `I hit an error: ${message}`,
        },
      ]);
      setPendingActions([]);
    } finally {
      setAiThinking(false);
    }
  };

  const confirmPendingActions = async () => {
    if (!user?.id || aiThinking || pendingActions.length === 0) return;
    setAiThinking(true);
    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: user.id,
          selectedChildId,
          confirmActions: true,
          actionsToConfirm: pendingActions,
        }),
      });
      if (!response.ok) {
        let serverError = "Failed to apply confirmed actions.";
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload?.error) {
            serverError = payload.error;
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(serverError);
      }
      const payload = (await response.json()) as { reply?: string };
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: payload.reply ?? "Confirmed actions have been applied.",
        },
      ]);
      setPendingActions([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to apply confirmed actions.";
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "ai", text: `I hit an error: ${message}` },
      ]);
    } finally {
      setAiThinking(false);
    }
  };

  const cancelPendingActions = () => {
    if (pendingActions.length === 0) return;
    setPendingActions([]);
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, sender: "ai", text: "Pending actions canceled. No changes were applied." },
    ]);
  };

  const formatMinutes = (minutesValue: number | null) => {
    if (!Number.isFinite(minutesValue) || minutesValue === null) return "--";
    const totalMinutes = Math.max(0, Math.round(minutesValue));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const [children, setChildren] = useState<Child[]>([]);

  const loadChildren = useCallback(async () => {
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
      const mapped: Child[] = data.map((child) => {
        return {
          id: child.id,
          name: child.name,
          status: "Active",
          todayUsage: "0h 0m",
          pin: child.pin ?? "----",
          avatar: child.name?.[0]?.toUpperCase() ?? "C",
        };
      });
      setChildren(mapped);
      if (!selectedChildId && mapped.length > 0) {
        setSelectedChildId(mapped[0].id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load children.";
      setChildrenError(message);
    } finally {
      setChildrenLoading(false);
    }
  }, [selectedChildId, user?.id]);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  const selectedChild = children.find(child => child.id === selectedChildId) ?? null;
  const rangeUsage = selectedChild ? formatMinutes(rangeUsageMinutes) : "--";

  const loadDashboard = useCallback(async (manual = false) => {
    if (!selectedChildId || !user?.id) {
      setUsageData([]);
      setCategoryData([]);
      setRiskData([]);
      setCategoryWebsiteDetails([]);
      setRiskWebsiteDetails([]);
      setSafetyScore(null);
      setBlockedSites(null);
      setRangeUsageMinutes(null);
      return;
    }
    if (manual) {
      setDashboardRefreshing(true);
    } else {
      setDashboardLoading(true);
    }
    setDashboardError("");
    try {
      const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const response = await fetch(
        `/api/dashboard?childId=${selectedChildId}&range=${timeFilter}&timeZone=${encodeURIComponent(
          localTimeZone
        )}&parentId=${encodeURIComponent(String(user.id))}`
      );
      if (response.status === 401) {
        setDashboardError("");
        return;
      }
      if (!response.ok) {
        let message = "Failed to load dashboard.";
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
      const payload: {
        usageTimeline: UsagePoint[];
        categoryData: CategorySlice[];
        riskData: RiskPoint[];
        categoryWebsiteDetails: CategoryWebsiteDetail[];
        riskWebsiteDetails: RiskWebsiteDetail[];
        safetyScore: number;
        blockedSites: number;
        rangeUsageMinutes: number;
      } = await response.json();
      setUsageData(payload.usageTimeline ?? []);
      setCategoryData(payload.categoryData ?? []);
      setRiskData(payload.riskData ?? []);
      setCategoryWebsiteDetails(payload.categoryWebsiteDetails ?? []);
      setRiskWebsiteDetails(payload.riskWebsiteDetails ?? []);
      setSafetyScore(Number.isFinite(payload.safetyScore) ? payload.safetyScore : null);
      setBlockedSites(Number.isFinite(payload.blockedSites) ? payload.blockedSites : null);
      setRangeUsageMinutes(Number.isFinite(payload.rangeUsageMinutes) ? payload.rangeUsageMinutes : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard.";
      setDashboardError(message);
      setUsageData([]);
      setCategoryData([]);
      setRiskData([]);
      setCategoryWebsiteDetails([]);
      setRiskWebsiteDetails([]);
      setSafetyScore(null);
      setBlockedSites(null);
      setRangeUsageMinutes(null);
    } finally {
      setDashboardLoading(false);
      setDashboardRefreshing(false);
    }
  }, [selectedChildId, timeFilter, user?.id]);

  useEffect(() => {
    void loadDashboard(false);
  }, [loadDashboard]);

  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedPin(pin);
  };

  const copyPin = () => {
    void navigator.clipboard.writeText(generatedPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const openAddChild = () => {
    setShowAddChild(true);
    generatePin();
  };

  const handleCreatedChild = (child: Child) => {
    setChildren(prev => [child, ...prev]);
    setSelectedChildId(child.id);
  };

  const handleViewActivity = (childId: number) => {
    setSelectedChildId(childId);
    setActiveTab("dashboard");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            {dashboardLoading && (
              <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Loading dashboard...
              </div>
            )}
            {dashboardError && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {dashboardError}
              </div>
            )}
            <DashboardContent
              childrenData={children}
              selectedChildId={selectedChildId}
              rangeUsage={rangeUsage}
              safetyScore={safetyScore}
              blockedSites={blockedSites}
              usageData={usageData}
              categoryData={categoryData}
              riskData={riskData}
              categoryWebsiteDetails={categoryWebsiteDetails}
              riskWebsiteDetails={riskWebsiteDetails}
              timeFilter={timeFilter}
              onChangeTimeFilter={setTimeFilter}
              onChangeChild={setSelectedChildId}
              onRefresh={() => {
                void loadDashboard(true);
              }}
              refreshing={dashboardRefreshing}
            />
          </>
        );
      case "blocking":
        return <BlockingContent />;
      case "time-limits":
        return <TimeLimitsContent />;
      case "children":
        return (
          <>
            {childrenLoading && (
              <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Loading children...
              </div>
            )}
            {childrenError && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {childrenError}
              </div>
            )}
            <ChildrenContent
              childrenData={children}
              showAddChild={showAddChild}
              onOpenAddChild={openAddChild}
              onCloseAddChild={() => setShowAddChild(false)}
              generatedPin={generatedPin}
              copiedPin={copiedPin}
              onCopyPin={copyPin}
              onViewActivity={handleViewActivity}
              onCreatedChild={handleCreatedChild}
            />
          </>
        );
      case "settings":
        return <SettingsContent />;
      default:
        return null;
    }
  };

  if (!authLoading && !user) {
    return (
      <TeslaAuthBackdrop>
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-2xl backdrop-blur">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">Sign in to continue</h1>
            <p className="text-sm text-slate-600 mb-6">
              Please log in to access your dashboard.
            </p>
            <Link
              href="/login"
              className="block w-full rounded-xl bg-indigo-500 px-6 py-3 text-center text-white font-medium shadow-sm hover:bg-indigo-600 transition"
            >
              Go to Login
            </Link>
            <p className="mt-4 text-xs text-slate-500">
              New here?{" "}
              <Link className="text-indigo-600 hover:text-indigo-700" href="/sign">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </TeslaAuthBackdrop>
    );
  }

  return (
    <TeslaAuthBackdrop>
      <div
        className="h-screen overflow-hidden"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div className="flex h-full flex-col md:flex-row">
          <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">{renderContent()}</div>
          </div>
        </div>
        <FloatingAIAssistant
          messages={chatMessages}
          chatInput={chatInput}
          onChangeInput={setChatInput}
          onSendMessage={(text) => {
            void sendMessage(text);
          }}
          quickPrompts={QUICK_PROMPTS}
          isThinking={aiThinking}
          pendingActionPreview={pendingActions.map(describeAction)}
          onConfirmActions={() => {
            void confirmPendingActions();
          }}
          onCancelActions={cancelPendingActions}
        />
      </div>
    </TeslaAuthBackdrop>
  );
}

"use client";
/* eslint-disable max-lines */

import { useCallback, useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { useAuthUser } from "@/lib/auth";
import Sidebar from "../components/Sidebar";
import DashboardContent from "../components/DashboardContent";
import AIAssistantContent from "../components/AIAssistantContent";
import BlockingContent from "../components/BlockingContent";
import TimeLimitsContent from "../components/TimeLimitsContent";
import ChildrenContent from "../components/ChildrenContent";
import SettingsContent from "../components/SettingsContent";
import type {
  CategorySlice,
  ChatMessage,
  Child,
  RiskPoint,
  UsagePoint,
} from "../components/types";
import TeslaAuthBackdrop from "../components/TeslaAuthBackdrop";

export default function HomeDashboard() {
  const { user, loading: authLoading } = useAuthUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddChild, setShowAddChild] = useState(false);
  const [generatedPin, setGeneratedPin] = useState("");
  const [copiedPin, setCopiedPin] = useState(false);
  const [timeFilter, setTimeFilter] = useState("7days");
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [childrenError, setChildrenError] = useState("");
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [usageData, setUsageData] = useState<UsagePoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySlice[]>([]);
  const [riskData, setRiskData] = useState<RiskPoint[]>([]);
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [blockedSites, setBlockedSites] = useState<number | null>(null);
  const [todayUsageMinutes, setTodayUsageMinutes] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your AI parenting assistant. I can help you understand your children's online activity, answer questions about safety concerns, and provide recommendations. How can I help you today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const sendMessage = (override?: string) => {
    const nextText = (override ?? chatInput).trim();
    if (!nextText) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: nextText,
    };
    setChatMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const aiResponses = [
        "Based on the recent activity, Emma has been browsing educational content for 2.5 hours today, which is great! Oliver spent 45 minutes on gaming sites, which is within the healthy limit you've set.",
        "I have analyzed the suspicious content flagged earlier. It appears to be a social media discussion that mentioned mature topics. I recommend reviewing it together with your child to provide context and guidance.",
        "Your children's safety scores are both above 85%, which is excellent. The main areas to watch are late-night usage and ensure gaming time doesn't exceed the 2-hour daily limit.",
        "I can help you set up better time limits. Would you like me to suggest an age-appropriate schedule based on Emma and Oliver's ages?",
      ];
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    }, 1000);

    setChatInput("");
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
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
  const todayUsage = selectedChild ? formatMinutes(todayUsageMinutes) : "--";

  useEffect(() => {
    const loadDashboard = async () => {
      if (!selectedChildId || !user?.id) {
        setUsageData([]);
        setCategoryData([]);
        setRiskData([]);
        setSafetyScore(null);
        setBlockedSites(null);
        setTodayUsageMinutes(null);
        return;
      }
      setDashboardLoading(true);
      setDashboardError("");
      try {
        const response = await fetch(
          `/api/dashboard?childId=${selectedChildId}&range=${timeFilter}&parentId=${encodeURIComponent(
            String(user.id)
          )}`
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
          safetyScore: number;
          blockedSites: number;
          todayUsageMinutes: number;
        } = await response.json();
        setUsageData(payload.usageTimeline ?? []);
        setCategoryData(payload.categoryData ?? []);
        setRiskData(payload.riskData ?? []);
        setSafetyScore(Number.isFinite(payload.safetyScore) ? payload.safetyScore : null);
        setBlockedSites(Number.isFinite(payload.blockedSites) ? payload.blockedSites : null);
        setTodayUsageMinutes(Number.isFinite(payload.todayUsageMinutes) ? payload.todayUsageMinutes : null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load dashboard.";
        setDashboardError(message);
        setUsageData([]);
        setCategoryData([]);
        setRiskData([]);
        setSafetyScore(null);
        setBlockedSites(null);
        setTodayUsageMinutes(null);
      } finally {
        setDashboardLoading(false);
      }
    };

    void loadDashboard();
  }, [selectedChildId, timeFilter, user?.id]);

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
              todayUsage={todayUsage}
              safetyScore={safetyScore}
              blockedSites={blockedSites}
              usageData={usageData}
              categoryData={categoryData}
              riskData={riskData}
              timeFilter={timeFilter}
              onChangeTimeFilter={setTimeFilter}
              onChangeChild={setSelectedChildId}
            />
          </>
        );
      case "ai-analysis":
        return (
          <AIAssistantContent
            messages={chatMessages}
            chatInput={chatInput}
            onChangeInput={setChatInput}
            onSendMessage={() => sendMessage()}
            onKeyPress={handleKeyPress}
            onQuickQuestion={(question) => sendMessage(question)}
          />
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
      </div>
    </TeslaAuthBackdrop>
  );
}

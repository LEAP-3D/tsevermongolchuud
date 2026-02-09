"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddChild, setShowAddChild] = useState(false);
  const [generatedPin, setGeneratedPin] = useState("");
  const [copiedPin, setCopiedPin] = useState(false);
  const [timeFilter, setTimeFilter] = useState("7days");
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

  const usageData: UsagePoint[] = [
    { day: "Mon", hours: 3.5 },
    { day: "Tue", hours: 4.2 },
    { day: "Wed", hours: 2.8 },
    { day: "Thu", hours: 5.1 },
    { day: "Fri", hours: 6.3 },
    { day: "Sat", hours: 7.5 },
    { day: "Sun", hours: 5.8 },
  ];

  const categoryData: CategorySlice[] = [
    { name: "Education", value: 30, color: "#007AFF" },
    { name: "Video", value: 25, color: "#5856D6" },
    { name: "Games", value: 20, color: "#FF2D55" },
    { name: "Social", value: 15, color: "#FF9500" },
    { name: "Other", value: 10, color: "#8E8E93" },
  ];

  const riskData: RiskPoint[] = [
    { level: "Safe", count: 245, color: "#34C759" },
    { level: "Suspicious", count: 32, color: "#FF9500" },
    { level: "Dangerous", count: 5, color: "#FF3B30" },
  ];

  const children: Child[] = [
    {
      id: 1,
      name: "Emma",
      status: "Active",
      todayUsage: "3h 45m",
      pin: "8472",
      avatar: "E",
    },
    {
      id: 2,
      name: "Oliver",
      status: "Active",
      todayUsage: "2h 12m",
      pin: "5639",
      avatar: "O",
    },
  ];

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

  const handleViewActivity = (_childId: number) => {
    setActiveTab("dashboard");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardContent
            usageData={usageData}
            categoryData={categoryData}
            riskData={riskData}
            timeFilter={timeFilter}
            onChangeTimeFilter={setTimeFilter}
          />
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
          <ChildrenContent
            childrenData={children}
            showAddChild={showAddChild}
            onOpenAddChild={openAddChild}
            onCloseAddChild={() => setShowAddChild(false)}
            generatedPin={generatedPin}
            copiedPin={copiedPin}
            onCopyPin={copyPin}
            onViewActivity={handleViewActivity}
          />
        );
      case "settings":
        return <SettingsContent />;
      default:
        return null;
    }
  };

  return (
    <>
      <SignedOut>
        <RedirectToSignIn redirectUrl="/home" />
      </SignedOut>
      <SignedIn>
        <TeslaAuthBackdrop>
          <div
            className="min-h-screen"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            <div className="flex flex-col md:flex-row">
              <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

              <div className="flex-1 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">{renderContent()}</div>
              </div>
            </div>
          </div>
        </TeslaAuthBackdrop>
      </SignedIn>
    </>
  );
}

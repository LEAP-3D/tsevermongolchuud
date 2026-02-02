"use client";

import { useState } from "react";
import {
  Shield,
  Clock,
  Users,
  Settings,
  BarChart3,
  Brain,
  Ban,
  Zap,
} from "lucide-react";
import DashboardTab from "./DashboardTab";
import AiAnalysisTab from "./AiAnalysisTab";
import BlockingTab from "./BlockingTab";
import TimeLimitsTab from "./TimeLimitsTab";
import SettingsTab from "./SettingsTab";
import ChildrenTab from "./ChildrenTab";

export default function AppleStyleDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "ai-analysis":
        return <AiAnalysisTab />;
      case "blocking":
        return <BlockingTab />;
      case "time-limits":
        return <TimeLimitsTab />;
      case "settings":
        return <SettingsTab />;
      case "children":
        return <ChildrenTab />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="flex">
        <div className="w-64 bg-white border-r border-gray-200/80 min-h-screen p-4">
          <div className="flex items-center gap-2 px-3 py-4 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">ParentGuard</h1>
          </div>

          <nav className="space-y-1">
            {[
              { id: "dashboard", icon: BarChart3, label: "Dashboard" },
              { id: "ai-analysis", icon: Brain, label: "AI Assistant" },
              { id: "blocking", icon: Ban, label: "Blocking" },
              { id: "time-limits", icon: Clock, label: "Time Limits" },
              { id: "children", icon: Users, label: "Children" },
              { id: "settings", icon: Settings, label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 px-3 py-4 bg-gray-50 rounded-xl border border-gray-200/80">
            <div className="flex items-start gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-900">
                  Upgrade to Pro
                </p>
                <p className="text-xs text-gray-600 mt-1">Advanced features</p>
              </div>
            </div>
            <button className="w-full mt-3 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

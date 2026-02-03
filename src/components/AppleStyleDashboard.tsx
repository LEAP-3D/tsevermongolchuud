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
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1eb] text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-amber-200/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl"
      />
      <div className="relative flex min-h-screen gap-6 px-6 py-6 lg:px-10">
        <div className="w-72 shrink-0 rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_60px_-40px_rgba(10,15,20,0.6)] backdrop-blur">
          <div className="flex items-center gap-3 px-3 py-4 mb-6 rounded-2xl bg-white/80 border border-white/60 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Family safety
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                ParentGuard
              </h1>
            </div>
          </div>

          <nav className="space-y-2">
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 px-4 py-4 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-amber-50 shadow-sm">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Upgrade to Pro
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Unlock family insights
                </p>
              </div>
            </div>
            <button className="w-full mt-3 px-3 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="max-w-6xl mx-auto">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

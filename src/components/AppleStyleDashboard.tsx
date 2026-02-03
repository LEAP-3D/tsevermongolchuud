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
  Sparkles,
  ChevronLeft,
  Menu,
} from "lucide-react";
import DashboardTab from "./DashboardTab";
import AiAnalysisTab from "./AiAnalysisTab";
import BlockingTab from "./BlockingTab";
import TimeLimitsTab from "./TimeLimitsTab";
import SettingsTab from "./SettingsTab";
import ChildrenTab from "./ChildrenTab";

export default function AppleStyleDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const navItems = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard", color: "primary" },
    { id: "ai-analysis", icon: Brain, label: "AI Assistant", color: "secondary" },
    { id: "blocking", icon: Ban, label: "Content Blocking", color: "danger" },
    { id: "time-limits", icon: Clock, label: "Screen Time", color: "accent" },
    { id: "children", icon: Users, label: "Family", color: "primary" },
    { id: "settings", icon: Settings, label: "Settings", color: "primary" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? "w-20" : "w-72"
          } bg-white border-r border-slate-200/80 min-h-screen transition-all duration-300 ease-in-out shadow-sm`}
        >
          <div className="sticky top-0">
            {/* Logo & Header */}
            <div className="flex items-center justify-between px-5 py-6 border-b border-slate-100">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
                    <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                      ParentGuard
                    </h1>
                    <p className="text-xs text-slate-500">Family Protection</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {sidebarCollapsed ? (
                  <Menu className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? "justify-center px-3" : "gap-3 px-4"
                  } py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5" strokeWidth={2} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              ))}
            </nav>

            {/* Upgrade Card */}
            {!sidebarCollapsed && (
              <div className="m-4 mt-6 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl border border-primary-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-soft">
                    <Sparkles className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Unlock Premium
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Advanced AI monitoring & custom alerts
                    </p>
                  </div>
                </div>
                <button className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm hover:shadow-md">
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            <div className="animate-fade-in">{renderContent()}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

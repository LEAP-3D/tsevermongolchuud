"use client";

import { useState } from "react";
import { Clock, Shield, Ban, TrendingUp, AlertCircle } from "lucide-react";
import DashboardUsageChart from "./DashboardUsageChart";
import DashboardCategoriesChart from "./DashboardCategoriesChart";

const usageData = [
  { day: "Mon", hours: 3.5 },
  { day: "Tue", hours: 4.2 },
  { day: "Wed", hours: 2.8 },
  { day: "Thu", hours: 5.1 },
  { day: "Fri", hours: 6.3 },
  { day: "Sat", hours: 7.5 },
  { day: "Sun", hours: 5.8 },
];

const categoryData = [
  { name: "Education", value: 30, color: "#3b82f6" },
  { name: "Video", value: 25, color: "#8b5cf6" },
  { name: "Games", value: 20, color: "#ef4444" },
  { name: "Social", value: 15, color: "#f59e0b" },
  { name: "Other", value: 10, color: "#64748b" },
];

export default function DashboardTab() {
  const [timeFilter, setTimeFilter] = useState("7days");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Monitor your family`s internet activity and safety
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 shadow-soft border border-slate-200">
          {["24h", "7days", "30days"].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                timeFilter === filter
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {filter === "24h" ? "24 Hours" : filter === "7days" ? "7 Days" : "30 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Usage Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft hover:shadow-soft-lg transition-all duration-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-primary-600" />
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Today`s Usage
                </p>
              </div>
              
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-linear-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      E
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Emma
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        3h 45m
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-linear-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      O
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Oliver
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        2h 12m
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
            <TrendingUp className="w-4 h-4 text-secondary-600" />
            <span className="text-sm text-secondary-600 font-semibold">
              Healthy usage today
            </span>
          </div>
        </div>

        {/* Safety Score Card */}
        <div className="bg-gradient-to-br from-secondary-50 to-secondary-100/50 rounded-2xl p-6 border border-secondary-200 shadow-soft hover:shadow-soft-lg transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-secondary-600" />
                <p className="text-sm font-semibold text-secondary-700 uppercase tracking-wide">
                  Safety Score
                </p>
              </div>
              <div className="mb-2">
                <p className="text-5xl font-bold text-secondary-900 mb-1">87%</p>
                <span className="inline-block px-3 py-1 bg-secondary-200 text-secondary-800 text-sm font-bold rounded-lg">
                  Excellent
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-linear-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center shadow-soft">
              <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-sm text-secondary-700 mt-4">
            Your family is well protected with active monitoring
          </p>
        </div>

        {/* Blocked Sites Card */}
        <div className="bg-gradient-to-br from-danger-50 to-danger-100/50 rounded-2xl p-6 border border-danger-200 shadow-soft hover:shadow-soft-lg transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Ban className="w-5 h-5 text-danger-600" />
                <p className="text-sm font-semibold text-danger-700 uppercase tracking-wide">
                  Blocked Sites
                </p>
              </div>
              <div className="mb-2">
                <p className="text-5xl font-bold text-danger-900 mb-1">37</p>
                <span className="text-sm text-danger-700 font-medium">
                  Attempts this week
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-linear-to-br from-danger-400 to-danger-600 rounded-2xl flex items-center justify-center shadow-soft">
              <Ban className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm text-danger-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">5 new threats blocked</span>
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <DashboardUsageChart data={usageData} />

      {/* Categories Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCategoriesChart data={categoryData} />
      </div>
    </div>
  );
}

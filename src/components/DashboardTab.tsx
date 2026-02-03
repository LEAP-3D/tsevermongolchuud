"use client";

import { useState } from "react";
import { Clock, Shield, Ban, TrendingUp } from "lucide-react";
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
  { name: "Education", value: 30, color: "#007AFF" },
  { name: "Video", value: 25, color: "#5856D6" },
  { name: "Games", value: 20, color: "#FF2D55" },
  { name: "Social", value: 15, color: "#FF9500" },
  { name: "Other", value: 10, color: "#8E8E93" },
];

export default function DashboardTab() {
  const [timeFilter, setTimeFilter] = useState("7days");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-5xl text-slate-900 mb-2">
            Dashboard
          </h1>
          <p className="text-base text-slate-500">
            A calm, daily snapshot of your family`s online rhythms
          </p>
        </div>
        <div className="flex items-center gap-0 bg-white/80 rounded-2xl p-1.5 border border-white/80 shadow-sm">
          {["24h", "7days", "30days"].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                timeFilter === filter
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {filter === "24h" ? "24h" : filter === "7days" ? "7d" : "30d"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/75 rounded-3xl p-6 border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 mb-3">
                Today`s usage
              </p>
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-gradient-to-br from-slate-900 to-slate-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    E
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Emma
                  </span>
                </div>
                <p className="text-2xl font-semibold text-slate-900 ml-9">
                  3h 45m
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-gradient-to-br from-slate-900 to-slate-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    O
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Oliver
                  </span>
                </div>
                <p className="text-2xl font-semibold text-slate-900 ml-9">
                  2h 12m
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md shadow-slate-900/25">
              <Clock className="w-6 h-6 text-amber-200" />
            </div>
          </div>
          <div className="flex items-center gap-1 pt-3 border-t border-slate-200/60">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-sm text-emerald-600 font-medium">
              Healthy usage today
            </span>
          </div>
        </div>

        <div className="bg-white/75 rounded-3xl p-6 border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">
                Safety Score
              </p>
              <p className="text-3xl font-semibold text-slate-900 mb-1">87%</p>
              <span className="text-sm text-emerald-600 font-medium">
                Excellent
              </span>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/25">
              <Shield className="w-6 h-6 text-emerald-50" />
            </div>
          </div>
        </div>

        <div className="bg-white/75 rounded-3xl p-6 border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">
                Blocked Sites
              </p>
              <p className="text-3xl font-semibold text-slate-900 mb-1">37</p>
              <span className="text-sm text-slate-500">This week</span>
            </div>
            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-md shadow-rose-500/25">
              <Ban className="w-6 h-6 text-rose-50" />
            </div>
          </div>
        </div>
      </div>

      <DashboardUsageChart data={usageData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCategoriesChart data={categoryData} />
      </div>
    </div>
  );
}

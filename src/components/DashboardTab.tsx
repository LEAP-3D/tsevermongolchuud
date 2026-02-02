"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Clock, Shield, Ban, TrendingUp, ArrowUpRight } from "lucide-react";

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

const riskData = [
  { level: "Safe", count: 245, color: "#34C759" },
  { level: "Suspicious", count: 32, color: "#FF9500" },
  { level: "Dangerous", count: 5, color: "#FF3B30" },
];

export default function DashboardTab() {
  const [timeFilter, setTimeFilter] = useState("7days");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-1">
            Dashboard
          </h1>
          <p className="text-base text-gray-500">
            Monitor your family's internet activity
          </p>
        </div>
        <div className="flex items-center gap-0 bg-gray-100 rounded-lg p-1">
          {["24h", "7days", "30days"].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeFilter === filter
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {filter === "24h" ? "24h" : filter === "7days" ? "7d" : "30d"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-3">
                Today's Usage
              </p>
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    E
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Emma
                  </span>
                </div>
                <p className="text-2xl font-semibold text-gray-900 ml-8">
                  3h 45m
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    O
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Oliver
                  </span>
                </div>
                <p className="text-2xl font-semibold text-gray-900 ml-8">
                  2h 12m
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            <span className="text-sm text-green-500 font-medium">
              Healthy usage today
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                Safety Score
              </p>
              <p className="text-3xl font-semibold text-gray-900 mb-1">87%</p>
              <span className="text-sm text-green-500 font-medium">
                Excellent
              </span>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                Blocked Sites
              </p>
              <p className="text-3xl font-semibold text-gray-900 mb-1">37</p>
              <span className="text-sm text-gray-500">This week</span>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <Ban className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Usage Timeline
          </h3>
          <button className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium">
            Details <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={usageData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="#8E8E93"
              axisLine={false}
              tickLine={false}
            />
            <YAxis stroke="#8E8E93" axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#007AFF"
              strokeWidth={2.5}
              dot={{ fill: "#007AFF", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#007AFF", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Categories
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={75}
                innerRadius={45}
                strokeWidth={0}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

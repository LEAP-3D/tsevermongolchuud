"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUpRight } from "lucide-react";

type UsageData = {
  day: string;
  hours: number;
};

type DashboardUsageChartProps = {
  data: UsageData[];
};

export default function DashboardUsageChart({
  data,
}: DashboardUsageChartProps) {
  return (
    <div className="bg-white/75 rounded-3xl p-6 border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Usage Timeline</h3>
        <button className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium">
          Details <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            stroke="#94a3b8"
            axisLine={false}
            tickLine={false}
          />
          <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
            }}
          />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#0f172a"
            strokeWidth={2.5}
            dot={{ fill: "#0f172a", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#0f172a", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

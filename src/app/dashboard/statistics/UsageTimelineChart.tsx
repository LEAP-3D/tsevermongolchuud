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

type UsageTimelineChartProps = {
  data: UsageData[];
};

export default function UsageTimelineChart({ data }: UsageTimelineChartProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Usage Timeline</h3>
        <button className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium">
          Details <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
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
  );
}

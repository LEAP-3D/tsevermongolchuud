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
import { TrendingUp, Clock } from "lucide-react";

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
    <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
            <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Weekly Screen Time</h3>
            <p className="text-sm text-slate-600">Daily usage patterns</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-xl">
          <TrendingUp className="w-4 h-4 text-secondary-700" />
          <span className="text-sm font-bold text-secondary-700">Healthy trend</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            stroke="#64748b"
            axisLine={false}
            tickLine={false}
            style={{ fontSize: '14px', fontWeight: 600 }}
          />
          <YAxis 
            stroke="#64748b" 
            axisLine={false} 
            tickLine={false}
            style={{ fontSize: '14px', fontWeight: 600 }}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "2px solid #e2e8f0",
              borderRadius: "16px",
              padding: "12px 16px",
              boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.08)",
            }}
            labelStyle={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: "4px",
            }}
            itemStyle={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#3b82f6",
            }}
          />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 5, strokeWidth: 0 }}
            activeDot={{ r: 7, fill: "#3b82f6", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

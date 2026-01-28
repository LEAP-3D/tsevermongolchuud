// src/app/dashboard/statistics/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface UsageStats {
  date: string;
  totalVisits: number;
  totalBlocked: number;
  totalAllowed: number;
}

interface TopDomain {
  domain: string;
  _count: { domain: number };
}

interface StatsData {
  usageStats: UsageStats[];
  topDomains: TopDomain[];
  totalVisits: number;
  totalBlocked: number;
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#f97316",
  "#06b6d4",
];

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">No statistics available</div>
      </div>
    );
  }

  // Chart data
  const dailyData = (stats.usageStats || []).map((stat) => ({
    date: new Date(stat.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    visits: stat.totalVisits,
    blocked: stat.totalBlocked,
    allowed: stat.totalAllowed,
  }));

  const blockedVsAllowed = [
    { name: "Allowed", value: stats.totalVisits - stats.totalBlocked },
    { name: "Blocked", value: stats.totalBlocked },
  ];

  const topDomainsData = (stats.topDomains || []).map((d) => ({
    name: d.domain.replace(/^www\./, ""),
    visits: d._count.domain,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Visits</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalVisits.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Blocked</div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {stats.totalBlocked.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Allowed</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {(stats.totalVisits - stats.totalBlocked).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Visits (Last 30 Days)
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Blocked vs Allowed
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={blockedVsAllowed}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Domains
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={topDomainsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                dataKey="visits"
              >
                {topDomainsData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

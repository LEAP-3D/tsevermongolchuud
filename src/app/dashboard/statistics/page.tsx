// src/app/dashboard/statistics/page.tsx
"use client";

import { useEffect, useState } from "react";
import StatsCards from "@/components/dashboard/statistics/StatsCards";
import StatsCharts from "@/components/dashboard/statistics/StatsCharts";

type UsageStats = {
  date: string;
  totalVisits: number;
  totalBlocked: number;
  totalAllowed: number;
};

type TopDomain = {
  domain: string;
  _count: {
    domain: number;
  };
};

type StatsData = {
  usageStats: UsageStats[];
  topDomains: TopDomain[];
  totalVisits: number;
  totalBlocked: number;
};

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchStats();
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
      <StatsCards
        totalVisits={stats.totalVisits}
        totalBlocked={stats.totalBlocked}
      />

      {/* Charts */}
      <StatsCharts
        dailyData={dailyData}
        blockedVsAllowed={blockedVsAllowed}
        topDomainsData={topDomainsData}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import UsageTimelineChart from "./UsageTimelineChart";
import CategoriesPieChart from "./CategoriesPieChart";

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
      <DashboardHeader timeFilter={timeFilter} setTimeFilter={setTimeFilter} />

      <DashboardStats />

      <UsageTimelineChart data={usageData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoriesPieChart data={categoryData} />
      </div>
    </div>
  );
}

"use client";

import type { CategorySlice, RiskPoint, UsagePoint } from './types';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import UsageTimeline from './UsageTimeline';
import DashboardBreakdown from './DashboardBreakdown';

export type DashboardContentProps = {
  usageData: UsagePoint[];
  categoryData: CategorySlice[];
  riskData: RiskPoint[];
  timeFilter: string;
  onChangeTimeFilter: (filter: string) => void;
};

export default function DashboardContent({
  usageData,
  categoryData,
  riskData,
  timeFilter,
  onChangeTimeFilter
}: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <DashboardHeader timeFilter={timeFilter} onChangeTimeFilter={onChangeTimeFilter} />
      <DashboardStats />
      <UsageTimeline usageData={usageData} />
      <DashboardBreakdown categoryData={categoryData} riskData={riskData} />
    </div>
  );
}

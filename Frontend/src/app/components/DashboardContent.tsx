"use client";

import type { CategorySlice, Child, RiskPoint, UsagePoint } from './types';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import UsageTimeline from './UsageTimeline';
import DashboardBreakdown from './DashboardBreakdown';

export type DashboardContentProps = {
  childrenData: Child[];
  selectedChildId: number | null;
  todayUsage: string;
  safetyScore: number | null;
  blockedSites: number | null;
  usageData: UsagePoint[];
  categoryData: CategorySlice[];
  riskData: RiskPoint[];
  timeFilter: string;
  onChangeTimeFilter: (filter: string) => void;
  onChangeChild: (childId: number) => void;
};

export default function DashboardContent({
  childrenData,
  selectedChildId,
  todayUsage,
  safetyScore,
  blockedSites,
  usageData,
  categoryData,
  riskData,
  timeFilter,
  onChangeTimeFilter,
  onChangeChild
}: DashboardContentProps) {
  const selectedChild = childrenData.find(child => child.id === selectedChildId) ?? null;
  const childOptions = childrenData.map(child => ({ id: child.id, name: child.name }));
  return (
    <div className="space-y-6">
      <DashboardHeader
        childName={selectedChild?.name}
        childrenOptions={childOptions}
        selectedChildId={selectedChildId}
        onChangeChild={onChangeChild}
        timeFilter={timeFilter}
        onChangeTimeFilter={onChangeTimeFilter}
      />
      <DashboardStats
        selectedChild={selectedChild}
        todayUsage={todayUsage}
        safetyScore={safetyScore}
        blockedSites={blockedSites}
      />
      <UsageTimeline childName={selectedChild?.name} usageData={usageData} />
      <DashboardBreakdown childName={selectedChild?.name} categoryData={categoryData} riskData={riskData} />
    </div>
  );
}

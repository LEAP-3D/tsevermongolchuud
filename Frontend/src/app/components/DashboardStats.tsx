"use client";

import { Ban, Clock, Shield, TrendingUp } from 'lucide-react';
import type { Child } from './types';

export type DashboardStatsProps = {
  selectedChild: Child | null;
  todayUsage: string;
  safetyScore: number | null;
  blockedSites: number | null;
};

const getSafetyLabel = (score: number) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  return "Low";
};

export default function DashboardStats({ selectedChild, todayUsage, safetyScore, blockedSites }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-3">Today&apos;s Usage</p>

            {!selectedChild ? (
              <p className="text-sm text-gray-500">Select a child to view usage.</p>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {selectedChild.avatar}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{selectedChild.name}</span>
                </div>
                <p className="text-xl md:text-2xl font-semibold text-gray-900 ml-8">{todayUsage}</p>
              </div>
            )}
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          <span className="text-sm text-green-500 font-medium">Healthy usage today</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Safety Score</p>
            <p className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
              {safetyScore === null ? "--" : `${safetyScore}%`}
            </p>
            {safetyScore === null ? (
              <span className="text-sm text-gray-500 font-medium">Select a child</span>
            ) : (
              <span className="text-sm text-green-500 font-medium">{getSafetyLabel(safetyScore)}</span>
            )}
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Blocked Sites</p>
            <p className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
              {blockedSites === null ? "--" : blockedSites}
            </p>
            <span className="text-sm text-gray-500">Selected range</span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500 rounded-full flex items-center justify-center">
            <Ban className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
/* eslint-disable max-lines */

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, X } from 'lucide-react';
import Image from 'next/image';
import type { CategorySlice, CategoryWebsiteDetail, RiskPoint, RiskWebsiteDetail } from './types';

export type DashboardBreakdownProps = {
  childName?: string;
  categoryData: CategorySlice[];
  riskData: RiskPoint[];
  categoryWebsiteDetails: CategoryWebsiteDetail[];
  riskWebsiteDetails: RiskWebsiteDetail[];
};

export default function DashboardBreakdown({
  childName,
  categoryData,
  riskData,
  categoryWebsiteDetails,
  riskWebsiteDetails,
}: DashboardBreakdownProps) {
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const [showRiskDetails, setShowRiskDetails] = useState(false);

  const categorySummary = useMemo(() => {
    const total = categoryData.reduce((acc, item) => acc + item.value, 0);
    const top = categoryData.reduce(
      (max, item) => (item.value > max.value ? item : max),
      categoryData[0] ?? { name: '-', value: 0, color: '#000' }
    );

    return { total, topName: top.name, topValue: top.value };
  }, [categoryData]);

  const riskSummary = useMemo(() => {
    const total = riskData.reduce((acc, item) => acc + item.count, 0);
    const top = riskData.reduce(
      (max, item) => (item.count > max.count ? item : max),
      riskData[0] ?? { level: '-', count: 0, color: '#000' }
    );

    return { total, topLevel: top.level, topCount: top.count };
  }, [riskData]);

  const formatMinutes = (minutesValue: number) => {
    if (!Number.isFinite(minutesValue) || minutesValue <= 0) return "0m";
    const total = Math.round(minutesValue);
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0m";
    const totalMinutes = Math.round(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const getDisplayUrl = (rawUrl: string, fallbackDomain?: string) => {
    try {
      const parsed = new URL(rawUrl);
      const specific = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      return `${parsed.host}${specific !== "/" ? specific : ""}`;
    } catch {
      return fallbackDomain || rawUrl;
    }
  };

  const getLevelStyle = (level: string) => {
    const lowered = level.toLowerCase();
    if (lowered === 'dangerous') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    if (lowered === 'suspicious') {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const groupedCategoryWebsites = useMemo(() => {
    const totalMinutes = categoryWebsiteDetails.reduce((acc, item) => acc + item.minutes, 0);
    const byCategory = new Map<
      string,
      { totalMinutes: number; websites: CategoryWebsiteDetail[] }
    >();
    for (const item of categoryWebsiteDetails) {
      const current = byCategory.get(item.category) ?? { totalMinutes: 0, websites: [] };
      current.totalMinutes += item.minutes;
      current.websites.push(item);
      byCategory.set(item.category, current);
    }
    return Array.from(byCategory.entries())
      .map(([category, data]) => ({
        category,
        totalMinutes: data.totalMinutes,
        share: totalMinutes > 0 ? Math.round((data.totalMinutes / totalMinutes) * 100) : 0,
        websites: data.websites.sort((a, b) => b.minutes - a.minutes).slice(0, 8),
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [categoryWebsiteDetails]);

  const groupedRiskWebsites = useMemo(() => {
    const totalMinutes = riskWebsiteDetails.reduce((acc, item) => acc + item.minutes, 0);
    const byLevel = new Map<
      string,
      { totalMinutes: number; websites: RiskWebsiteDetail[] }
    >();
    for (const item of riskWebsiteDetails) {
      const current = byLevel.get(item.level) ?? { totalMinutes: 0, websites: [] };
      current.totalMinutes += item.minutes;
      current.websites.push(item);
      byLevel.set(item.level, current);
    }

    const levelOrder = ["Dangerous", "Suspicious", "Safe"];
    return Array.from(byLevel.entries())
      .map(([level, data]) => ({
        level,
        totalMinutes: data.totalMinutes,
        share: totalMinutes > 0 ? Math.round((data.totalMinutes / totalMinutes) * 100) : 0,
        websites: data.websites.sort((a, b) => b.minutes - a.minutes).slice(0, 8),
      }))
      .sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));
  }, [riskWebsiteDetails]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Categories</h3>
          <button
            onClick={() => setShowCategoryDetails(true)}
            className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium"
          >
            Details <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        {categoryData.length === 0 ? (
          <div className="h-56 md:h-60 flex items-center justify-center text-sm text-gray-500">
            Select a child to see category data.
          </div>
        ) : (
          <div className="h-56 md:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={45} strokeWidth={0}>
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '13px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Risk Assessment</h3>
          <button
            onClick={() => setShowRiskDetails(true)}
            className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium"
          >
            Details <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        {riskData.length === 0 ? (
          <div className="h-56 md:h-60 flex items-center justify-center text-sm text-gray-500">
            Select a child to see risk data.
          </div>
        ) : (
          <div className="h-56 md:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="level"
                  stroke="#8E8E93"
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: '13px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                />
                <YAxis
                  stroke="#8E8E93"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => formatMinutes(Number(value))}
                  style={{ fontSize: '13px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                />
                <Tooltip
                  formatter={(value: number | string | undefined) => formatMinutes(Number(value ?? 0))}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                  {riskData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {showCategoryDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Category Breakdown</h4>
                <p className="text-sm text-gray-500">
                  {childName ? `Top categories for ${childName}` : "Top categories and totals"}
                </p>
              </div>
              <button
                onClick={() => setShowCategoryDetails(false)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Total Usage</p>
                <p className="text-2xl font-semibold text-gray-900">{formatDuration(categorySummary.total)}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Top Category</p>
                <p className="text-2xl font-semibold text-gray-900">{categorySummary.topName}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Top Value</p>
                <p className="text-2xl font-semibold text-gray-900">{formatDuration(categorySummary.topValue)}</p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                {groupedCategoryWebsites.map((group) => (
                  <div key={group.category} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                      <div className="text-sm font-semibold text-gray-900">{group.category}</div>
                      <div className="inline-flex items-center gap-2 text-xs text-gray-600">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
                          {formatMinutes(group.totalMinutes)}
                        </span>
                        <span>{group.share}%</span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {group.websites.map((item) => (
                        <div
                          key={`${group.category}-${item.url}`}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Image
                              src={item.logoUrl || '/globe.svg'}
                              alt=""
                              width={16}
                              height={16}
                              className="h-4 w-4 shrink-0 rounded-sm border border-gray-100"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-blue-600 underline"
                            >
                              {getDisplayUrl(item.url, item.domain)}
                            </a>
                          </div>
                          <span className="shrink-0 text-xs font-medium text-gray-600">
                            {formatMinutes(item.minutes)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowCategoryDetails(false)}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRiskDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Risk Assessment Details</h4>
                <p className="text-sm text-gray-500">
                  {childName ? `Risk exposure levels for ${childName}` : "Levels and exposure duration"}
                </p>
              </div>
              <button
                onClick={() => setShowRiskDetails(false)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Total Exposure</p>
                <p className="text-2xl font-semibold text-gray-900">{formatMinutes(riskSummary.total)}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Highest Level</p>
                <p className="text-2xl font-semibold text-gray-900">{riskSummary.topLevel}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Highest Exposure</p>
                <p className="text-2xl font-semibold text-gray-900">{formatMinutes(riskSummary.topCount)}</p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                {groupedRiskWebsites.map((group) => (
                  <div key={group.level} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                      <div
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getLevelStyle(group.level)}`}
                      >
                        {group.level}
                      </div>
                      <div className="inline-flex items-center gap-2 text-xs text-gray-600">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
                          {formatMinutes(group.totalMinutes)}
                        </span>
                        <span>{group.share}%</span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {group.websites.map((item) => (
                        <div
                          key={`${group.level}-${item.url}`}
                          className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-sm"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Image
                              src={item.logoUrl || '/globe.svg'}
                              alt=""
                              width={16}
                              height={16}
                              className="h-4 w-4 shrink-0 rounded-sm border border-gray-100"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-blue-600 underline"
                            >
                              {getDisplayUrl(item.url, item.domain)}
                            </a>
                          </div>
                          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {item.category}
                          </span>
                          <span className="shrink-0 text-xs font-medium text-gray-600">
                            {formatMinutes(item.minutes)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowRiskDetails(false)}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

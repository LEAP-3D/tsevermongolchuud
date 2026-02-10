"use client";

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, X } from 'lucide-react';
import type { CategorySlice, RiskPoint } from './types';

export type DashboardBreakdownProps = {
  childName?: string;
  categoryData: CategorySlice[];
  riskData: RiskPoint[];
};

export default function DashboardBreakdown({ childName, categoryData, riskData }: DashboardBreakdownProps) {
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
                  style={{ fontSize: '13px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                />
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
                <p className="text-2xl font-semibold text-gray-900">{categorySummary.total}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Top Category</p>
                <p className="text-2xl font-semibold text-gray-900">{categorySummary.topName}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Top Value</p>
                <p className="text-2xl font-semibold text-gray-900">{categorySummary.topValue}</p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-3 gap-0 bg-gray-50 text-xs font-semibold text-gray-500 px-4 py-2">
                  <div>Category</div>
                  <div>Value</div>
                  <div>Share</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {categoryData.map(item => (
                    <div key={item.name} className="grid grid-cols-3 gap-0 px-4 py-3 text-sm text-gray-700">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div>{item.value}</div>
                      <div>
                        {categorySummary.total ? (
                          <span className="text-gray-600">
                            {Math.round((item.value / categorySummary.total) * 100)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">0%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                  {childName ? `Incident levels for ${childName}` : "Levels and incident counts"}
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
                <p className="text-xs text-gray-500 mb-1">Total Incidents</p>
                <p className="text-2xl font-semibold text-gray-900">{riskSummary.total}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Highest Level</p>
                <p className="text-2xl font-semibold text-gray-900">{riskSummary.topLevel}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Highest Count</p>
                <p className="text-2xl font-semibold text-gray-900">{riskSummary.topCount}</p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-3 gap-0 bg-gray-50 text-xs font-semibold text-gray-500 px-4 py-2">
                  <div>Level</div>
                  <div>Count</div>
                  <div>Share</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {riskData.map(item => (
                    <div key={item.level} className="grid grid-cols-3 gap-0 px-4 py-3 text-sm text-gray-700">
                      <div className="font-medium text-gray-900">{item.level}</div>
                      <div>{item.count}</div>
                      <div>
                        {riskSummary.total ? (
                          <span className="text-gray-600">
                            {Math.round((item.count / riskSummary.total) * 100)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">0%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

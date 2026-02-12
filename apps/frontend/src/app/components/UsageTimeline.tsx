/* eslint-disable max-lines */
"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUpRight, X } from "lucide-react";
import type { UsagePoint } from "./types";

export type UsageTimelineProps = {
  childName?: string;
  usageData: UsagePoint[];
  timeFilter?: string;
};

export default function UsageTimeline({
  childName,
  usageData,
  timeFilter,
}: UsageTimelineProps) {
  const [showDetails, setShowDetails] = useState(false);

  const rangeLabel = timeFilter === "today"
    ? "today"
    : timeFilter === "7d"
      ? "last 7 days"
      : "last 30 days";

  const summary = useMemo(() => {
    const total = usageData.reduce((acc, point) => acc + point.hours, 0);
    const avg = usageData.length ? total / usageData.length : 0;
    const peak = usageData.reduce(
      (max, point) => (point.hours > max.hours ? point : max),
      usageData[0] ?? { day: "-", hours: 0 },
    );

    return {
      total,
      avg,
      peakDay: peak.day,
      peakHours: peak.hours,
    };
  }, [usageData]);

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">
          Usage Timeline
        </h3>
        <button
          onClick={() => setShowDetails(true)}
          className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium"
        >
          Details <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
      {usageData.length === 0 ? (
        <div className="h-56 md:h-64 flex items-center justify-center text-sm text-gray-500">
          Select a child to see usage data.
        </div>
      ) : (
        <div className="h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usageData}>
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
                style={{
                  fontSize: "13px",
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              />
              <YAxis
                stroke="#8E8E93"
                axisLine={false}
                tickLine={false}
                style={{
                  fontSize: "13px",
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
      )}

      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Usage Timeline Details
                </h4>
                <p className="text-sm text-gray-500">
                  {childName
                    ? `Usage breakdown for ${childName} (${rangeLabel})`
                    : `Usage breakdown and summary (${rangeLabel})`}
                </p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Total Hours</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.total.toFixed(1)}h
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Daily Average</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.avg.toFixed(1)}h
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Peak Day</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.peakDay} · {summary.peakHours.toFixed(1)}h
                </p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-3 gap-0 bg-gray-50 text-xs font-semibold text-gray-500 px-4 py-2">
                  <div>Day</div>
                  <div>Hours</div>
                  <div>Status</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {usageData.map((point) => (
                    <div
                      key={point.day}
                      className="grid grid-cols-3 gap-0 px-4 py-3 text-sm text-gray-700"
                    >
                      <div className="font-medium text-gray-900">
                        {point.day}
                      </div>
                      <div>{point.hours.toFixed(1)}h</div>
                      <div>
                        {point.hours >= summary.avg ? (
                          <span className="text-green-600 font-medium">
                            Above Avg
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium">
                            Below Avg
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
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

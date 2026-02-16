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
import Image from "next/image";
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
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const formatHHMM = (minutesValue: number) => {
    const totalMinutes = Math.max(0, Math.round(minutesValue));
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  const formatAxisTick = (minutesValue: number) => {
    const totalMinutes = Math.max(0, Math.round(minutesValue));
    if (totalMinutes >= 60) {
      return `${Math.round(totalMinutes / 60)}h`;
    }
    return `${totalMinutes}m`;
  };

  const getSafeHref = (rawUrl: string) => {
    try {
      const parsed = new URL(rawUrl);
      return parsed.protocol === "http:" || parsed.protocol === "https:" ? rawUrl : "#";
    } catch {
      return "#";
    }
  };

  const getWebsiteParts = (rawUrl: string, fallbackDomain?: string) => {
    try {
      const parsed = new URL(rawUrl);
      const host = parsed.hostname || fallbackDomain || "-";
      const hostParts = host.split(".");
      const mainDomain =
        hostParts.length >= 2
          ? `${hostParts[hostParts.length - 2]}.${hostParts[hostParts.length - 1]}`
          : host;
      const subdomain = host.endsWith(mainDomain)
        ? host.slice(0, host.length - mainDomain.length).replace(/\.$/, "")
        : "";
      const specificLocation =
        `${subdomain ? `${subdomain} | ` : ""}${parsed.pathname}${parsed.search}${parsed.hash}`.trim();
      return {
        mainDomain,
        specificLocation: specificLocation === "/" ? host : specificLocation,
      };
    } catch {
      return {
        mainDomain: fallbackDomain || rawUrl || "-",
        specificLocation: rawUrl || "-",
      };
    }
  };

  const formatSessionRange = (enteredAt?: string, leftAt?: string) => {
    if (!enteredAt || !leftAt) return null;
    const entered = new Date(enteredAt);
    const left = new Date(leftAt);
    if (Number.isNaN(entered.getTime()) || Number.isNaN(left.getTime())) {
      return null;
    }
    const sameDay =
      entered.getFullYear() === left.getFullYear() &&
      entered.getMonth() === left.getMonth() &&
      entered.getDate() === left.getDate();
    const dayLabel = entered.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const enteredLabel = entered.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const leftLabel = left.toLocaleString(undefined, {
      ...(sameDay ? {} : { month: "short", day: "numeric" }),
      hour: "2-digit",
      minute: "2-digit",
    });
    return { sameDay, dayLabel, enteredLabel, leftLabel };
  };

  const categoryPillClass = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes("adult") || normalized.includes("danger")) {
      return "bg-red-100 text-red-700";
    }
    if (normalized.includes("social") || normalized.includes("game")) {
      return "bg-amber-100 text-amber-700";
    }
    if (normalized.includes("education") || normalized.includes("learn")) {
      return "bg-green-100 text-green-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const rangeLabel =
    timeFilter === "today"
      ? "today"
      : timeFilter === "7d"
        ? "last 7 days"
        : "last 30 days";

  const summary = useMemo(() => {
    const total = usageData.reduce((acc, point) => acc + point.minutes, 0);
    const avg = usageData.length ? total / usageData.length : 0;
    const peak = usageData.reduce(
      (max, point) => (point.minutes > max.minutes ? point : max),
      usageData[0] ?? { day: "-", minutes: 0 },
    );

    const maxMinutes = Math.max(...usageData.map((point) => point.minutes), 0);
    let step = 10;
    if (maxMinutes > 60) step = 30;
    if (maxMinutes > 180) step = 60;
    if (maxMinutes > 720) step = 120;
    const cap = Math.ceil(maxMinutes / step) * step;
    const yTicks: number[] = [];
    for (let current = 0; current <= cap; current += step) {
      yTicks.push(current);
    }

    return {
      total,
      avg,
      peakDay: peak.day,
      peakMinutes: peak.minutes,
      yTicks: yTicks.length ? yTicks : [0, step],
    };
  }, [usageData]);

  const activePoint = useMemo(() => {
    if (usageData.length === 0) return null;
    if (selectedDay) {
      return usageData.find((point) => point.day === selectedDay) ?? usageData[usageData.length - 1] ?? null;
    }
    if (hoveredDay) {
      return usageData.find((point) => point.day === hoveredDay) ?? usageData[usageData.length - 1] ?? null;
    }
    return usageData[usageData.length - 1] ?? null;
  }, [hoveredDay, selectedDay, usageData]);

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">Usage Timeline</h3>
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
            <LineChart
              data={usageData}
              onMouseMove={(state) => {
                const label = typeof state?.activeLabel === "string" ? state.activeLabel : null;
                if (label) setHoveredDay(label);
              }}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={(state) => {
                const label = typeof state?.activeLabel === "string" ? state.activeLabel : null;
                if (label) {
                  setSelectedDay((prev) => (prev === label ? null : label));
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
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
                ticks={summary.yTicks}
                tickFormatter={formatAxisTick}
                style={{
                  fontSize: "13px",
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              />
              <Tooltip
                formatter={(value: number | string | undefined) => formatHHMM(Number(value ?? 0))}
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
                dataKey="minutes"
                stroke="#007AFF"
                strokeWidth={2.5}
                dot={{ fill: "#007AFF", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#007AFF", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {usageData.length > 0 && (
        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-gray-600">
            {activePoint ? `${activePoint.day} | ${formatHHMM(activePoint.minutes)}` : "Hover a point"}
            </div>
            {selectedDay ? (
              <button
                onClick={() => setSelectedDay(null)}
                className="rounded-md border border-blue-200 bg-white px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-50"
              >
                Pinned ({selectedDay}) · Clear
              </button>
            ) : (
              <div className="text-[11px] text-gray-500">Click a chart point to pin details</div>
            )}
          </div>
          <div className="max-h-44 overflow-auto space-y-1.5 pr-1">
            {!activePoint || (activePoint.sites ?? []).length === 0 ? (
              <div className="text-xs text-gray-500">No website details in this period.</div>
            ) : (
              activePoint.sites?.map((site) => {
                const parts = getWebsiteParts(site.url, site.domain);
                const session = formatSessionRange(site.enteredAt, site.leftAt);
                return (
                  <a
                    key={`${activePoint.day}-${site.url}-${site.category}`}
                    href={getSafeHref(site.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-gray-200 bg-white px-3 py-2.5 transition-colors hover:bg-blue-50/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <Image
                          src={site.logoUrl || "/globe.svg"}
                          alt=""
                          width={20}
                          height={20}
                          className="mt-0.5 h-5 w-5 rounded border border-gray-100 bg-white"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-semibold text-blue-700 underline">
                            {parts.mainDomain}
                          </div>
                          <div className="truncate text-[11px] text-gray-500">
                            {parts.specificLocation}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                        {formatHHMM(site.minutes)}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${categoryPillClass(site.category)}`}
                      >
                        {site.category}
                      </span>
                    </div>
                    {session ? (
                      <div className="mt-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-1.5 text-[11px] text-gray-600">
                        <div className="font-medium text-gray-700">{session.dayLabel}</div>
                        <div className="mt-0.5 flex items-center gap-3">
                          <span>
                            <span className="font-medium text-gray-700">Entered:</span> {session.enteredLabel}
                          </span>
                          <span>
                            <span className="font-medium text-gray-700">Left:</span> {session.leftLabel}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-[11px] text-gray-500">Session time unavailable</div>
                    )}
                  </a>
                );
              })
            )}
          </div>
        </div>
      )}

      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Usage Timeline Details</h4>
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
                <p className="text-xs text-gray-500 mb-1">Total Usage</p>
                <p className="text-2xl font-semibold text-gray-900">{formatHHMM(summary.total)}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Daily Average</p>
                <p className="text-2xl font-semibold text-gray-900">{formatHHMM(summary.avg)}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Peak Day</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.peakDay} | {formatHHMM(summary.peakMinutes)}
                </p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-3 gap-0 bg-gray-50 text-xs font-semibold text-gray-500 px-4 py-2">
                  <div>Day</div>
                  <div>Duration</div>
                  <div>Status</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {usageData.map((point) => (
                    <div
                      key={point.day}
                      className="grid grid-cols-3 gap-0 px-4 py-3 text-sm text-gray-700"
                    >
                      <div className="font-medium text-gray-900">{point.day}</div>
                      <div>{formatHHMM(point.minutes)}</div>
                      <div>
                        {point.minutes >= summary.avg ? (
                          <span className="text-green-600 font-medium">Above Avg</span>
                        ) : (
                          <span className="text-gray-500 font-medium">Below Avg</span>
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

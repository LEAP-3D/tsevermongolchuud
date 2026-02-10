import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const parseRangeDays = (range: string | null) => {
  switch (range) {
    case "24h":
      return 1;
    case "30days":
      return 30;
    case "7days":
    default:
      return 7;
  }
};

const startOfDay = (value: Date) => {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
};

const buildDayLabels = (days: number) => {
  const labels: Array<{ key: string; label: string; date: Date }> = [];
  const today = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString("en-US", { weekday: "short" });
    labels.push({ key, label, date });
  }
  return labels;
};

const formatUsageHours = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  return minutes / 60;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childIdParam = searchParams.get("childId");
  const range = searchParams.get("range");
  const parentIdParam = searchParams.get("parentId");

  const childId = childIdParam ? Number.parseInt(childIdParam, 10) : null;
  if (!childId || Number.isNaN(childId)) {
    return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
  }
  const parentId = parentIdParam ? Number.parseInt(parentIdParam, 10) : null;
  if (!parentId || Number.isNaN(parentId)) {
    return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, parentId: true },
  });

  if (!child || child.parentId !== parentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const days = parseRangeDays(range);
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - (days - 1));

  const [dailyUsage, history, alerts] = await Promise.all([
    prisma.dailyUsage.findMany({
      where: {
        childId,
        date: { gte: start },
      },
      select: { date: true, duration: true },
    }),
    prisma.history.findMany({
      where: {
        childId,
        visitedAt: { gte: start },
      },
      select: { categoryName: true, duration: true, domain: true, actionTaken: true },
    }),
    prisma.alert.findMany({
      where: {
        childId,
        createdAt: { gte: start },
      },
      select: { type: true },
    }),
  ]);

  const labels = buildDayLabels(days);
  const dayTotals = new Map(labels.map(item => [item.key, 0]));
  for (const entry of dailyUsage) {
    const key = entry.date.toISOString().slice(0, 10);
    if (dayTotals.has(key)) {
      dayTotals.set(key, (dayTotals.get(key) ?? 0) + (entry.duration ?? 0));
    }
  }
  const usageTimeline = labels.map(item => ({
    day: item.label,
    hours: Number(formatUsageHours(dayTotals.get(item.key) ?? 0).toFixed(1)),
  }));

  const categoryTotals = new Map<string, number>();
  const blockedDomains = new Set<string>();
  for (const entry of history) {
    const name = entry.categoryName || "Other";
    categoryTotals.set(name, (categoryTotals.get(name) ?? 0) + (entry.duration ?? 0));
    if (entry.actionTaken === "BLOCKED" && entry.domain) {
      blockedDomains.add(entry.domain);
    }
  }

  const palette = ["#007AFF", "#5856D6", "#FF2D55", "#FF9500", "#8E8E93", "#34C759"];
  const categoryData = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      color: palette[index % palette.length],
    }));

  const riskCounts = {
    Safe: 0,
    Suspicious: 0,
    Dangerous: 0,
  };
  for (const alert of alerts) {
    if (alert.type === "DANGEROUS_CONTENT") riskCounts.Dangerous += 1;
    if (alert.type === "SUSPICIOUS_ACTIVITY") riskCounts.Suspicious += 1;
    if (alert.type === "TIME_LIMIT_EXCEEDED") riskCounts.Safe += 1;
  }
  const riskData = [
    { level: "Safe", count: riskCounts.Safe, color: "#34C759" },
    { level: "Suspicious", count: riskCounts.Suspicious, color: "#FF9500" },
    { level: "Dangerous", count: riskCounts.Dangerous, color: "#FF3B30" },
  ];

  const riskPenalty = riskCounts.Dangerous * 6 + riskCounts.Suspicious * 3;
  const safetyScore = Math.max(0, Math.min(100, 100 - riskPenalty));

  const todayKey = startOfDay(new Date()).toISOString().slice(0, 10);
  const todayMinutes = dayTotals.get(todayKey) ?? 0;

  return NextResponse.json({
    childId,
    usageTimeline,
    categoryData,
    riskData,
    safetyScore,
    blockedSites: blockedDomains.size,
    todayUsageMinutes: todayMinutes,
  });
}

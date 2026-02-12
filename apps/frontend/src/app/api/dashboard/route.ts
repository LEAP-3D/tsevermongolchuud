import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const UB_TIMEZONE = "Asia/Ulaanbaatar";

const getUbDateKey = (value: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: UB_TIMEZONE }).format(value);

const getUbHour = (value: Date) =>
  Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: UB_TIMEZONE,
      hour: "2-digit",
      hour12: false,
    }).format(value)
  );

const getUbDayStart = (value: Date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: UB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const year = Number(parts.find(part => part.type == "year")?.value ?? 0);
  const month = Number(parts.find(part => part.type == "month")?.value ?? 1);
  const day = Number(parts.find(part => part.type == "day")?.value ?? 1);
  return new Date(Date.UTC(year, month - 1, day));
};


const normalizeRange = (range: string | null) => {
  if (range === "today" || range === "7d" || range === "30d") return range;
  return "7d";
};

const parseRangeDays = (range: string) => {
  switch (range) {
    case "today":
      return 1;
    case "30d":
      return 30;
    case "7d":
    default:
      return 7;
  }
};

const toDateKey = (value: Date) => getUbDateKey(value);

const formatHourLabel = (hour: number) => {
  const normalized = hour % 24;
  const display = normalized % 12 === 0 ? 12 : normalized % 12;
  const suffix = normalized < 12 ? "am" : "pm";
  return `${display}${suffix}`;
};

const buildHourLabels = (bucketHours: number) => {
  const labels: Array<{ key: number; label: string }> = [];
  for (let hour = 0; hour < 24; hour += bucketHours) {
    const endHour = (hour + bucketHours) % 24;
    labels.push({
      key: hour,
      label: `${formatHourLabel(hour)}-${formatHourLabel(endHour)}`,
    });
  }
  return labels;
};

const buildDayLabels = (days: number) => {
  const labels: Array<{ key: string; label: string; date: Date }> = [];
  const today = getUbDayStart(new Date());
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);
    const key = toDateKey(date);
    let label = "";
    if (days === 1) {
      label = "Today";
    } else if (days <= 7) {
      label = date.toLocaleDateString("en-US", { weekday: "short", timeZone: UB_TIMEZONE });
    } else {
      label = date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: UB_TIMEZONE });
    }
    labels.push({ key, label, date });
  }
  return labels;
};

const secondsToHours = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return seconds / 3600;
};

const secondsToMinutes = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return seconds / 60;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childIdParam = searchParams.get("childId");
  const range = normalizeRange(searchParams.get("range"));
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

  if (!child || child.parentId != parentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const days = parseRangeDays(range);
  const start = getUbDayStart(new Date());
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const historyStart = range === "today"
    ? new Date(start.getTime() - 24 * 60 * 60 * 1000)
    : start;

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
        visitedAt: { gte: historyStart },
      },
      select: { categoryName: true, duration: true, domain: true, actionTaken: true, visitedAt: true },
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
    const key = toDateKey(entry.date);
    if (dayTotals.has(key)) {
      dayTotals.set(key, (dayTotals.get(key) ?? 0) + (entry.duration ?? 0));
    }
  }

  let usageTimeline: Array<{ day: string; hours: number }> = [];
  let rangeTotalSeconds = 0;

  if (range === "today") {
    const bucketHours = 2;
    const hourLabels = buildHourLabels(bucketHours);
    const hourTotals = new Map(hourLabels.map(item => [item.key, 0]));

    const todayKey = getUbDateKey(new Date());

    for (const entry of history) {
      if (!entry.visitedAt) continue;
      const visited = new Date(entry.visitedAt);
      if (Number.isNaN(visited.getTime())) continue;
      if (getUbDateKey(visited) != todayKey) continue;
      const hour = getUbHour(visited);
      const bucket = Math.floor(hour / bucketHours) * bucketHours;
      hourTotals.set(bucket, (hourTotals.get(bucket) ?? 0) + (entry.duration ?? 0));
    }

    usageTimeline = hourLabels.map(item => ({
      day: item.label,
      hours: Number(secondsToHours(hourTotals.get(item.key) ?? 0).toFixed(1)),
    }));

    rangeTotalSeconds = Array.from(hourTotals.values()).reduce((sum, value) => sum + value, 0);
  } else {
    usageTimeline = labels.map(item => ({
      day: item.label,
      hours: Number(secondsToHours(dayTotals.get(item.key) ?? 0).toFixed(1)),
    }));

    rangeTotalSeconds = Array.from(dayTotals.values()).reduce((sum, value) => sum + value, 0);
  }

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

  const todayKey = getUbDateKey(new Date());
  const todaySeconds = dayTotals.get(todayKey) ?? 0;
  const totalSeconds = rangeTotalSeconds;

  return NextResponse.json({
    childId,
    usageTimeline,
    categoryData,
    riskData,
    safetyScore,
    blockedSites: blockedDomains.size,
    rangeUsageMinutes: Math.round(secondsToMinutes(totalSeconds)),
    todayUsageMinutes: Math.round(secondsToMinutes(todaySeconds)),
  });
}

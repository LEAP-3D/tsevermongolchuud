/* eslint-disable max-lines */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest, unauthorizedJson } from "@/lib/session";

const DEFAULT_TIMEZONE = "UTC";

const normalizeTimeZone = (value: string | null) => {
  if (!value) return DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return value;
  } catch {
    return DEFAULT_TIMEZONE;
  }
};

const getDateKey = (value: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone }).format(value);

const getHour = (value: Date, timeZone: string) =>
  Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      hour12: false,
    }).format(value)
  );

const getDayStart = (timeZone: string, value: Date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const year = Number(parts.find(part => part.type === "year")?.value ?? 0);
  const month = Number(parts.find(part => part.type === "month")?.value ?? 1);
  const day = Number(parts.find(part => part.type === "day")?.value ?? 1);
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

const toDateKey = (value: Date, timeZone: string) => getDateKey(value, timeZone);

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

const buildDayLabels = (days: number, timeZone: string) => {
  const labels: Array<{ key: string; label: string; date: Date }> = [];
  const today = getDayStart(timeZone, new Date());
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);
    const key = toDateKey(date, timeZone);
    let label = "";
    if (days === 1) {
      label = "Today";
    } else if (days <= 7) {
      label = date.toLocaleDateString("en-US", { weekday: "short", timeZone });
    } else {
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone,
      });
    }
    labels.push({ key, label, date });
  }
  return labels;
};

const secondsToMinutes = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return seconds / 60;
};

const normalizeCategoryName = (value: string | null | undefined) => {
  const raw = (value ?? "").trim();
  if (!raw) return "Other";
  const lowered = raw.toLowerCase();
  if (lowered === "custom" || lowered === "uncategorized") {
    return "Other";
  }
  return raw;
};

const toFaviconUrl = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

const toRiskLevel = (safetyScore: number) => {
  if (safetyScore >= 80) return "Safe";
  if (safetyScore >= 50) return "Suspicious";
  return "Dangerous";
};

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  const { searchParams } = new URL(req.url);
  const childIdParam = searchParams.get("childId");
  const range = normalizeRange(searchParams.get("range"));
  const timeZone = normalizeTimeZone(searchParams.get("timeZone"));

  const childId = childIdParam ? Number.parseInt(childIdParam, 10) : null;
  if (!childId || Number.isNaN(childId)) {
    return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, parentId: true },
  });

  if (!child || child.parentId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const days = parseRangeDays(range);
  const start = getDayStart(timeZone, new Date());
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const historyStart = range === "today"
    ? new Date(start.getTime() - 24 * 60 * 60 * 1000)
    : start;

  const [history, alerts, blockedSitesCount] = await Promise.all([
    prisma.history.findMany({
      where: {
        childId,
        visitedAt: { gte: historyStart },
      },
      select: {
        categoryName: true,
        fullUrl: true,
        duration: true,
        domain: true,
        actionTaken: true,
        visitedAt: true,
      },
    }),
    prisma.alert.findMany({
      where: {
        childId,
        createdAt: { gte: start },
      },
      select: { type: true },
    }),
    prisma.childUrlSetting.count({
      where: {
        childId,
        status: "BLOCKED",
      },
    }),
  ]);

  const labels = buildDayLabels(days, timeZone);
  const dayTotals = new Map(labels.map(item => [item.key, 0]));
  for (const entry of history) {
    if (!entry.visitedAt) continue;
    const key = toDateKey(new Date(entry.visitedAt), timeZone);
    if (dayTotals.has(key)) {
      dayTotals.set(key, (dayTotals.get(key) ?? 0) + (entry.duration ?? 0));
    }
  }

  let usageTimeline: Array<{
    day: string;
    minutes: number;
    sites: Array<{
      url: string;
      domain: string;
      category: string;
      minutes: number;
      logoUrl: string;
      enteredAt: string;
      leftAt: string;
    }>;
  }> = [];
  let rangeTotalSeconds = 0;

  if (range === "today") {
    const bucketHours = 2;
    const hourLabels = buildHourLabels(bucketHours);
    const hourTotals = new Map(hourLabels.map(item => [item.key, 0]));
    const bucketSites = new Map<
      number,
      Map<
        string,
        {
          url: string;
          domain: string;
          category: string;
          seconds: number;
          enteredAtMs: number;
          leftAtMs: number;
        }
      >
    >();

    const todayKey = getDateKey(new Date(), timeZone);

    for (const entry of history) {
      if (!entry.visitedAt) continue;
      const visited = new Date(entry.visitedAt);
      if (Number.isNaN(visited.getTime())) continue;
      if (getDateKey(visited, timeZone) !== todayKey) continue;
      const hour = getHour(visited, timeZone);
      const bucket = Math.floor(hour / bucketHours) * bucketHours;
      hourTotals.set(bucket, (hourTotals.get(bucket) ?? 0) + (entry.duration ?? 0));

      const url = typeof entry.fullUrl === "string" && entry.fullUrl ? entry.fullUrl : "";
      if (!url) continue;
      if (!bucketSites.has(bucket)) {
        bucketSites.set(bucket, new Map());
      }
      const byUrl = bucketSites.get(bucket);
      if (!byUrl) continue;
      const leftAtMs = visited.getTime();
      const enteredAtMs = leftAtMs - Math.max(0, Number(entry.duration ?? 0)) * 1000;
      const current = byUrl.get(url);
      byUrl.set(url, {
        url,
        domain: entry.domain || "-",
        category: normalizeCategoryName(entry.categoryName),
        seconds: (current?.seconds ?? 0) + (entry.duration ?? 0),
        enteredAtMs: Math.min(current?.enteredAtMs ?? enteredAtMs, enteredAtMs),
        leftAtMs: Math.max(current?.leftAtMs ?? leftAtMs, leftAtMs),
      });
    }

    usageTimeline = hourLabels.map(item => ({
      day: item.label,
      minutes: Math.round(secondsToMinutes(hourTotals.get(item.key) ?? 0)),
      sites: Array.from((bucketSites.get(item.key) ?? new Map()).values())
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 8)
        .map((site) => ({
          url: site.url,
          domain: site.domain,
          category: site.category,
          minutes: Math.max(1, Math.round(secondsToMinutes(site.seconds))),
          logoUrl: toFaviconUrl(site.domain),
          enteredAt: new Date(site.enteredAtMs).toISOString(),
          leftAt: new Date(site.leftAtMs).toISOString(),
        })),
    }));

    rangeTotalSeconds = Array.from(hourTotals.values()).reduce((sum, value) => sum + value, 0);
  } else {
    const daySites = new Map<
      string,
      Map<
        string,
        {
          url: string;
          domain: string;
          category: string;
          seconds: number;
          enteredAtMs: number;
          leftAtMs: number;
        }
      >
    >();
    for (const entry of history) {
      if (!entry.visitedAt) continue;
      const key = toDateKey(new Date(entry.visitedAt), timeZone);
      if (!dayTotals.has(key)) continue;
      const url = typeof entry.fullUrl === "string" && entry.fullUrl ? entry.fullUrl : "";
      if (!url) continue;
      if (!daySites.has(key)) {
        daySites.set(key, new Map());
      }
      const byUrl = daySites.get(key);
      if (!byUrl) continue;
      const visitedAt = new Date(entry.visitedAt);
      const leftAtMs = visitedAt.getTime();
      const enteredAtMs = leftAtMs - Math.max(0, Number(entry.duration ?? 0)) * 1000;
      const current = byUrl.get(url);
      byUrl.set(url, {
        url,
        domain: entry.domain || "-",
        category: normalizeCategoryName(entry.categoryName),
        seconds: (current?.seconds ?? 0) + (entry.duration ?? 0),
        enteredAtMs: Math.min(current?.enteredAtMs ?? enteredAtMs, enteredAtMs),
        leftAtMs: Math.max(current?.leftAtMs ?? leftAtMs, leftAtMs),
      });
    }

    usageTimeline = labels.map(item => ({
      day: item.label,
      minutes: Math.round(secondsToMinutes(dayTotals.get(item.key) ?? 0)),
      sites: Array.from((daySites.get(item.key) ?? new Map()).values())
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 8)
        .map((site) => ({
          url: site.url,
          domain: site.domain,
          category: site.category,
          minutes: Math.max(1, Math.round(secondsToMinutes(site.seconds))),
          logoUrl: toFaviconUrl(site.domain),
          enteredAt: new Date(site.enteredAtMs).toISOString(),
          leftAt: new Date(site.leftAtMs).toISOString(),
        })),
    }));

    rangeTotalSeconds = Array.from(dayTotals.values()).reduce((sum, value) => sum + value, 0);
  }

  const categoryTotals = new Map<string, number>();
  const categoryWebsiteSeconds = new Map<
    string,
    { category: string; url: string; domain: string; seconds: number }
  >();
  for (const entry of history) {
    const name = normalizeCategoryName(entry.categoryName);
    const duration = Math.max(0, Number(entry.duration ?? 0));
    categoryTotals.set(name, (categoryTotals.get(name) ?? 0) + duration);

    const url = typeof entry.fullUrl === "string" ? entry.fullUrl : "";
    if (!url) continue;
    const domain = entry.domain || "-";
    const key = `${name}|${url}`;
    const current = categoryWebsiteSeconds.get(key);
    categoryWebsiteSeconds.set(key, {
      category: name,
      url,
      domain,
      seconds: (current?.seconds ?? 0) + duration,
    });
  }

  const palette = ["#007AFF", "#5856D6", "#FF2D55", "#FF9500", "#8E8E93", "#34C759"];
  const categoryData = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      color: palette[index % palette.length],
    }));

  const uniqueDomains = [...new Set(history.map((item) => item.domain).filter((item): item is string => Boolean(item)))];
  const domainCatalog = uniqueDomains.length
    ? await prisma.urlCatalog.findMany({
        where: { domain: { in: uniqueDomains } },
        select: { domain: true, safetyScore: true },
      })
    : [];
  const safetyScoreByDomain = new Map(
    domainCatalog.map((item) => [item.domain, Number.isFinite(Number(item.safetyScore)) ? Number(item.safetyScore) : 50]),
  );

  const riskCounts = { Safe: 0, Suspicious: 0, Dangerous: 0 };
  const riskWebsiteSeconds = new Map<
    string,
    { level: string; category: string; url: string; domain: string; safetyScore: number; seconds: number }
  >();
  let weightedSafetyNumerator = 0;
  let totalExposureSeconds = 0;
  let blockedEvents = 0;
  let dangerousBlockedEvents = 0;

  for (const entry of history) {
    const duration = Math.max(0, Number(entry.duration ?? 0));
    const score = entry.domain ? (safetyScoreByDomain.get(entry.domain) ?? 50) : 50;
    weightedSafetyNumerator += score * duration;
    totalExposureSeconds += duration;

    if (score >= 80) {
      riskCounts.Safe += duration;
    } else if (score >= 50) {
      riskCounts.Suspicious += duration;
    } else {
      riskCounts.Dangerous += duration;
    }

    const url = typeof entry.fullUrl === "string" ? entry.fullUrl : "";
    if (url) {
      const level = toRiskLevel(score);
      const category = normalizeCategoryName(entry.categoryName);
      const domain = entry.domain || "-";
      const key = `${level}|${url}`;
      const current = riskWebsiteSeconds.get(key);
      riskWebsiteSeconds.set(key, {
        level,
        category,
        url,
        domain,
        safetyScore: Math.round(score),
        seconds: (current?.seconds ?? 0) + duration,
      });
    }

    if (entry.actionTaken === "BLOCKED") {
      blockedEvents += 1;
      if (score < 50) {
        dangerousBlockedEvents += 1;
      }
    }
  }

  const dangerousAlerts = alerts.filter((item) => item.type === "DANGEROUS_CONTENT").length;
  const suspiciousAlerts = alerts.filter((item) => item.type === "SUSPICIOUS_ACTIVITY").length;
  const weightedAverageSafety = totalExposureSeconds > 0 ? weightedSafetyNumerator / totalExposureSeconds : 100;
  const dangerousMinutes = secondsToMinutes(riskCounts.Dangerous);
  const safetyPenalty =
    blockedEvents * 2 +
    dangerousBlockedEvents * 3 +
    Math.round(dangerousMinutes / 20) +
    dangerousAlerts * 2 +
    suspiciousAlerts;

  const riskData = [
    { level: "Safe", count: Math.round(secondsToMinutes(riskCounts.Safe)), color: "#34C759" },
    { level: "Suspicious", count: Math.round(secondsToMinutes(riskCounts.Suspicious)), color: "#FF9500" },
    { level: "Dangerous", count: Math.round(secondsToMinutes(riskCounts.Dangerous)), color: "#FF3B30" },
  ];

  const safetyScore = Math.max(0, Math.min(100, Math.round(weightedAverageSafety - safetyPenalty)));

  const todayKey = getDateKey(new Date(), timeZone);
  const todaySeconds = dayTotals.get(todayKey) ?? 0;
  const totalSeconds = rangeTotalSeconds;
  const categoryWebsiteDetails = Array.from(categoryWebsiteSeconds.values())
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, 200)
    .map((item) => ({
      category: item.category,
      url: item.url,
      domain: item.domain,
      minutes: Math.max(1, Math.round(secondsToMinutes(item.seconds))),
      logoUrl: toFaviconUrl(item.domain),
    }));
  const riskWebsiteDetails = Array.from(riskWebsiteSeconds.values())
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, 200)
    .map((item) => ({
      level: item.level,
      category: item.category,
      url: item.url,
      domain: item.domain,
      minutes: Math.max(1, Math.round(secondsToMinutes(item.seconds))),
      safetyScore: item.safetyScore,
      logoUrl: toFaviconUrl(item.domain),
    }));

  return NextResponse.json({
    childId,
    usageTimeline,
    categoryData,
    riskData,
    safetyScore,
    blockedSites: blockedSitesCount,
    rangeUsageMinutes: Math.round(secondsToMinutes(totalSeconds)),
    todayUsageMinutes: Math.round(secondsToMinutes(todaySeconds)),
    categoryWebsiteDetails,
    riskWebsiteDetails,
  });
}

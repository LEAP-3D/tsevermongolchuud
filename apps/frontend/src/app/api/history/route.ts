/* eslint-disable max-lines */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendDangerousWebsiteAlertEmail } from "@/lib/dangerousAlertEmail";

const DANGEROUS_SAFETY_SCORE_THRESHOLD = 50;
const DANGEROUS_ALERT_DEDUP_WINDOW_MS = 15 * 60 * 1000;

const ISO_WITH_TIMEZONE_REGEX = /(Z|[+-]\d{2}:\d{2})$/i;
const ISO_WITHOUT_TIMEZONE_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

const normalizeTimeZone = (value: string | null | undefined) => {
  if (!value) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return value;
  } catch {
    return null;
  }
};

const getDateTimePartsInTimeZone = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
    second: pick("second"),
  };
};

const parseNaiveIsoToUtc = (
  value: string,
  timeZone?: string | null,
  timezoneOffsetMinutes?: number | null,
) => {
  const match = value.match(ISO_WITHOUT_TIMEZONE_REGEX);
  if (!match) return null;

  const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw, secondRaw = "0", msRaw = "0"] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const second = Number(secondRaw);
  const millisecond = Number(msRaw.padEnd(3, "0"));

  if (
    ![year, month, day, hour, minute, second, millisecond].every((item) => Number.isFinite(item))
  ) {
    return null;
  }

  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);

  if (Number.isFinite(Number(timezoneOffsetMinutes))) {
    return new Date(naiveUtcMs + Number(timezoneOffsetMinutes) * 60 * 1000);
  }

  const safeTimeZone = normalizeTimeZone(timeZone ?? null);
  if (!safeTimeZone) {
    return new Date(naiveUtcMs);
  }

  let guessMs = naiveUtcMs;
  const targetLocalMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  for (let i = 0; i < 3; i += 1) {
    const currentParts = getDateTimePartsInTimeZone(new Date(guessMs), safeTimeZone);
    const currentLocalMs = Date.UTC(
      currentParts.year,
      currentParts.month - 1,
      currentParts.day,
      currentParts.hour,
      currentParts.minute,
      currentParts.second,
      millisecond,
    );
    const diff = targetLocalMs - currentLocalMs;
    if (diff === 0) break;
    guessMs += diff;
  }

  return new Date(guessMs);
};

const parseVisitedAt = (
  visitedAt: unknown,
  timeZone?: string | null,
  timezoneOffsetMinutes?: number | null,
) => {
  if (visitedAt === null || visitedAt === undefined || visitedAt === "") return undefined;

  if (visitedAt instanceof Date) {
    return Number.isNaN(visitedAt.getTime()) ? undefined : visitedAt;
  }

  if (typeof visitedAt === "number" || (typeof visitedAt === "string" && /^\d+$/.test(visitedAt))) {
    const numericDate = new Date(Number(visitedAt));
    return Number.isNaN(numericDate.getTime()) ? undefined : numericDate;
  }

  if (typeof visitedAt !== "string") return undefined;

  const raw = visitedAt.trim();
  if (!raw) return undefined;

  if (ISO_WITH_TIMEZONE_REGEX.test(raw)) {
    const zoned = new Date(raw);
    return Number.isNaN(zoned.getTime()) ? undefined : zoned;
  }

  const parsedNaive = parseNaiveIsoToUtc(raw, timeZone, timezoneOffsetMinutes);
  if (parsedNaive && !Number.isNaN(parsedNaive.getTime())) {
    if (!Number.isFinite(Number(timezoneOffsetMinutes)) && !normalizeTimeZone(timeZone ?? null)) {
      const now = Date.now();
      const futureMs = parsedNaive.getTime() - now;
      if (futureMs > 90 * 60 * 1000) {
        const roundedHourShift = Math.max(1, Math.min(14, Math.round(futureMs / (60 * 60 * 1000))));
        const corrected = new Date(parsedNaive.getTime() - roundedHourShift * 60 * 60 * 1000);
        if (corrected.getTime() <= now + 5 * 60 * 1000) {
          return corrected;
        }
      }
    }
    return parsedNaive;
  }

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? undefined : fallback;
};

/* CREATE */
export async function POST(req: Request) {
  const headerTimeZone =
    req.headers.get("x-timezone") ??
    req.headers.get("x-time-zone") ??
    req.headers.get("x-vercel-ip-timezone");
  const headerOffsetRaw =
    req.headers.get("x-timezone-offset-minutes") ??
    req.headers.get("x-timezone-offset");
  const headerOffset = headerOffsetRaw === null ? null : Number(headerOffsetRaw);

  const {
    childId,
    fullUrl,
    domain,
    title,
    categoryName,
    duration,
    visitedAt,
    actionTaken,
    device,
    timeZone,
    timezoneOffsetMinutes,
  } = await req.json();

  const normalizedDomain =
    typeof domain === "string" ? domain.trim().toLowerCase() : "";
  const fullUrlValue = typeof fullUrl === "string" ? fullUrl.trim() : "";
  const normalizedCategoryName =
    typeof categoryName === "string" ? categoryName.trim().toLowerCase() : "";
  const dangerousCatalogEntry = normalizedDomain
    ? await prisma.urlCatalog.findUnique({
        where: { domain: normalizedDomain },
        select: { safetyScore: true },
      })
    : null;
  const resolvedSafetyScore = Number(dangerousCatalogEntry?.safetyScore);
  const isDangerousByScore =
    Number.isFinite(resolvedSafetyScore) &&
    resolvedSafetyScore < DANGEROUS_SAFETY_SCORE_THRESHOLD;
  const isDangerousByCategory = normalizedCategoryName === "dangerous";
  const shouldNotifyDangerousVisit = isDangerousByScore || isDangerousByCategory;
  const numericChildId = Number(childId);
  const resolvedVisitedAt = parseVisitedAt(
    visitedAt,
    timeZone ?? headerTimeZone,
    Number.isFinite(Number(timezoneOffsetMinutes))
      ? Number(timezoneOffsetMinutes)
      : Number.isFinite(headerOffset)
        ? headerOffset
        : null,
  );

  const history = await prisma.history.create({
    data: {
      childId,
      fullUrl,
      domain,
      title,
      categoryName,
      duration,
      visitedAt: resolvedVisitedAt,
      actionTaken,
      device,
    },
  });

  if (shouldNotifyDangerousVisit && Number.isInteger(numericChildId) && numericChildId > 0) {
    try {
      const child = await prisma.child.findUnique({
        where: { id: numericChildId },
        select: {
          id: true,
          name: true,
          parent: {
            select: {
              email: true,
              name: true,
              notificationSettings: {
                select: {
                  emailNotifications: true,
                  realtimeAlerts: true,
                },
              },
            },
          },
        },
      });

      if (child?.parent?.email) {
        const emailNotificationsEnabled =
          child.parent.notificationSettings?.emailNotifications ?? true;
        const realtimeAlertsEnabled =
          child.parent.notificationSettings?.realtimeAlerts ?? true;
        const shouldSendRealtimeEmail = emailNotificationsEnabled && realtimeAlertsEnabled;
        const target = normalizedDomain || fullUrlValue || "unknown website";
        const roundedSafetyScore = Number.isFinite(resolvedSafetyScore)
          ? Math.max(0, Math.min(100, Math.round(resolvedSafetyScore)))
          : null;
        const alertMessage = `${child.name} visited a dangerous website: ${target}${
          roundedSafetyScore === null ? "" : ` (safety score ${roundedSafetyScore})`
        }.`;
        const dedupSince = new Date(Date.now() - DANGEROUS_ALERT_DEDUP_WINDOW_MS);
        const recentDuplicate = await prisma.alert.findFirst({
          where: {
            childId: numericChildId,
            type: "DANGEROUS_CONTENT",
            message: alertMessage,
            createdAt: { gte: dedupSince },
          },
          select: { id: true },
        });

        if (!recentDuplicate) {
          let emailSent = false;
          if (shouldSendRealtimeEmail) {
            try {
              const emailResult = await sendDangerousWebsiteAlertEmail({
                to: child.parent.email,
                parentName: child.parent.name,
                childName: child.name,
                domain: normalizedDomain,
                fullUrl: fullUrlValue,
                safetyScore: roundedSafetyScore,
                visitedAt: resolvedVisitedAt ?? new Date(),
              });
              emailSent = emailResult.sent;
            } catch (error) {
              console.error("[history:dangerous-email] failed to send notification", error);
            }
          }

          await prisma.alert.create({
            data: {
              childId: numericChildId,
              type: "DANGEROUS_CONTENT",
              message: alertMessage,
              isSent: emailSent,
            },
          });
        }
      }
    } catch (error) {
      console.error("[history:dangerous-alert] failed to create dangerous alert", error);
    }
  }

  return NextResponse.json(history);
}

/* READ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const categoryName = searchParams.get("categoryName");

  const history = await prisma.history.findMany({
    where: {
      ...(childId ? { childId: Number(childId) } : {}),
      ...(categoryName ? { categoryName } : {}),
    },
    orderBy: { visitedAt: "desc" },
  });

  return NextResponse.json(history);
}

/* DELETE */
export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.history.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

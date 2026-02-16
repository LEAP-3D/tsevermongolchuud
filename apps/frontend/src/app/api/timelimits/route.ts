/* eslint-disable max-lines */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest, unauthorizedJson } from "@/lib/session";

const TABLE_NOT_FOUND_CODE = "P2021";
const isPrismaTableMissingError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === TABLE_NOT_FOUND_CODE;

const DEFAULT_TIME_LIMIT_SECONDS = {
  dailyLimit: 240 * 60,
  weekdayLimit: 180 * 60,
  weekendLimit: 300 * 60,
  sessionLimit: 60 * 60,
  breakEvery: 45 * 60,
  breakDuration: 10 * 60,
} as const;

type TimeLimitFields = {
  dailyLimit: number;
  weekdayLimit: number;
  weekendLimit: number;
  sessionLimit: number;
  breakEvery: number;
  breakDuration: number;
};
const TIME_LIMIT_DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "ChildTimeLimit" (
    "id" SERIAL PRIMARY KEY,
    "childId" INTEGER NOT NULL,
    "dailyLimit" INTEGER NOT NULL DEFAULT 14400,
    "weekdayLimit" INTEGER NOT NULL DEFAULT 10800,
    "weekendLimit" INTEGER NOT NULL DEFAULT 18000,
    "sessionLimit" INTEGER NOT NULL DEFAULT 3600,
    "breakEvery" INTEGER NOT NULL DEFAULT 2700,
    "breakDuration" INTEGER NOT NULL DEFAULT 600,
    "focusMode" BOOLEAN NOT NULL DEFAULT false,
    "downtimeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "ChildAppLimit" (
    "id" SERIAL PRIMARY KEY,
    "childId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "ChildCategoryLimit" (
    "id" SERIAL PRIMARY KEY,
    "childId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "ChildAlwaysAllowed" (
    "id" SERIAL PRIMARY KEY,
    "childId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "ChildFocusBlocked" (
    "id" SERIAL PRIMARY KEY,
    "childId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ChildTimeLimit_childId_key" ON "ChildTimeLimit"("childId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ChildAppLimit_childId_name_key" ON "ChildAppLimit"("childId", "name")`,
  `CREATE INDEX IF NOT EXISTS "ChildAppLimit_childId_idx" ON "ChildAppLimit"("childId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ChildCategoryLimit_childId_name_key" ON "ChildCategoryLimit"("childId", "name")`,
  `CREATE INDEX IF NOT EXISTS "ChildCategoryLimit_childId_idx" ON "ChildCategoryLimit"("childId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ChildAlwaysAllowed_childId_name_key" ON "ChildAlwaysAllowed"("childId", "name")`,
  `CREATE INDEX IF NOT EXISTS "ChildAlwaysAllowed_childId_idx" ON "ChildAlwaysAllowed"("childId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ChildFocusBlocked_childId_name_key" ON "ChildFocusBlocked"("childId", "name")`,
  `CREATE INDEX IF NOT EXISTS "ChildFocusBlocked_childId_idx" ON "ChildFocusBlocked"("childId")`,
  `DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChildTimeLimit_childId_fkey') THEN
      ALTER TABLE "ChildTimeLimit" ADD CONSTRAINT "ChildTimeLimit_childId_fkey"
      FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$`,
  `DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChildAppLimit_childId_fkey') THEN
      ALTER TABLE "ChildAppLimit" ADD CONSTRAINT "ChildAppLimit_childId_fkey"
      FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$`,
  `DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChildCategoryLimit_childId_fkey') THEN
      ALTER TABLE "ChildCategoryLimit" ADD CONSTRAINT "ChildCategoryLimit_childId_fkey"
      FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$`,
  `DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChildAlwaysAllowed_childId_fkey') THEN
      ALTER TABLE "ChildAlwaysAllowed" ADD CONSTRAINT "ChildAlwaysAllowed_childId_fkey"
      FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$`,
  `DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChildFocusBlocked_childId_fkey') THEN
      ALTER TABLE "ChildFocusBlocked" ADD CONSTRAINT "ChildFocusBlocked_childId_fkey"
      FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$`,
];

const ensureTimeLimitTables = async () => {
  for (const statement of TIME_LIMIT_DDL_STATEMENTS) {
    await prisma.$executeRawUnsafe(statement);
  }
};

const toStoredSeconds = (value: unknown, fallbackSeconds: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallbackSeconds;
  return Math.max(1, Math.round(numeric));
};

const toSafeSeconds = (value: unknown, fallbackSeconds: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallbackSeconds;
  return Math.max(1, Math.round(numeric));
};

const requireChild = async (childId: number, parentId: number) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, parentId: true },
  });
  if (!child || child.parentId !== parentId) return null;
  return child;
};

const isLikelyLegacyMinuteRow = (row: TimeLimitFields) =>
  row.dailyLimit >= 30 &&
  row.dailyLimit <= 720 &&
  row.dailyLimit % 30 === 0 &&
  row.weekdayLimit >= 30 &&
  row.weekdayLimit <= 600 &&
  row.weekdayLimit % 30 === 0 &&
  row.weekendLimit >= 30 &&
  row.weekendLimit <= 720 &&
  row.weekendLimit % 30 === 0 &&
  row.sessionLimit >= 15 &&
  row.sessionLimit <= 180 &&
  row.sessionLimit % 15 === 0 &&
  row.breakEvery >= 15 &&
  row.breakEvery <= 120 &&
  row.breakEvery % 15 === 0 &&
  row.breakDuration >= 5 &&
  row.breakDuration <= 30 &&
  row.breakDuration % 5 === 0;

const normalizeTimeLimitRow = <TRow extends TimeLimitFields>(row: TRow): TRow => ({
  ...row,
  dailyLimit: toSafeSeconds(row.dailyLimit, DEFAULT_TIME_LIMIT_SECONDS.dailyLimit),
  weekdayLimit: toSafeSeconds(row.weekdayLimit, DEFAULT_TIME_LIMIT_SECONDS.weekdayLimit),
  weekendLimit: toSafeSeconds(row.weekendLimit, DEFAULT_TIME_LIMIT_SECONDS.weekendLimit),
  sessionLimit: toSafeSeconds(row.sessionLimit, DEFAULT_TIME_LIMIT_SECONDS.sessionLimit),
  breakEvery: toSafeSeconds(row.breakEvery, DEFAULT_TIME_LIMIT_SECONDS.breakEvery),
  breakDuration: toSafeSeconds(row.breakDuration, DEFAULT_TIME_LIMIT_SECONDS.breakDuration),
});

const getUBTodayDate = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? 0);
  const month = Number(parts.find((part) => part.type === "month")?.value ?? 1);
  const day = Number(parts.find((part) => part.type === "day")?.value ?? 1);
  return new Date(Date.UTC(year, month - 1, day));
};

export async function GET(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return unauthorizedJson();
    }

    const { searchParams } = new URL(req.url);
    const childIdParam = searchParams.get("childId");
    const childId = childIdParam ? Number.parseInt(childIdParam, 10) : null;

    if (!childId || Number.isNaN(childId)) {
      return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
    }

    const child = await requireChild(childId, session.userId);
    if (!child) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const loadTimeLimitData = async () =>
      Promise.all([
        prisma.childTimeLimit.findUnique({
          where: { childId },
        }),
        prisma.childAppLimit.findMany({
          where: { childId },
          select: { id: true, name: true, minutes: true },
          orderBy: { name: "asc" },
        }),
        prisma.childCategoryLimit.findMany({
          where: { childId },
          select: { id: true, name: true, minutes: true },
          orderBy: { name: "asc" },
        }),
        prisma.childAlwaysAllowed.findMany({
          where: { childId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
        prisma.childFocusBlocked.findMany({
          where: { childId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
      ]);

    let timeLimitData;
    try {
      timeLimitData = await loadTimeLimitData();
    } catch (error) {
      if (!isPrismaTableMissingError(error)) throw error;
      await ensureTimeLimitTables();
      timeLimitData = await loadTimeLimitData();
    }

    const [loadedTimeLimit, appLimits, categoryLimits, alwaysAllowed, blockedDuringFocus] =
      timeLimitData;
    let timeLimit = loadedTimeLimit;

    if (!timeLimit) {
      timeLimit = await prisma.childTimeLimit.upsert({
        where: { childId },
        update: {},
        create: {
          childId,
          dailyLimit: DEFAULT_TIME_LIMIT_SECONDS.dailyLimit,
          weekdayLimit: DEFAULT_TIME_LIMIT_SECONDS.weekdayLimit,
          weekendLimit: DEFAULT_TIME_LIMIT_SECONDS.weekendLimit,
          sessionLimit: DEFAULT_TIME_LIMIT_SECONDS.sessionLimit,
          breakEvery: DEFAULT_TIME_LIMIT_SECONDS.breakEvery,
          breakDuration: DEFAULT_TIME_LIMIT_SECONDS.breakDuration,
          focusMode: false,
          downtimeEnabled: true,
        },
      });
    }

    if (timeLimit && isLikelyLegacyMinuteRow(timeLimit)) {
      timeLimit = await prisma.childTimeLimit.update({
        where: { childId },
        data: {
          dailyLimit: timeLimit.dailyLimit * 60,
          weekdayLimit: timeLimit.weekdayLimit * 60,
          weekendLimit: timeLimit.weekendLimit * 60,
          sessionLimit: timeLimit.sessionLimit * 60,
          breakEvery: timeLimit.breakEvery * 60,
          breakDuration: timeLimit.breakDuration * 60,
        },
      });
    }

    const normalizedTimeLimit = timeLimit ? normalizeTimeLimitRow(timeLimit) : null;

    return NextResponse.json({
      timeLimit: normalizedTimeLimit,
      appLimits,
      categoryLimits,
      alwaysAllowed,
      blockedDuringFocus,
    });
  } catch (error) {
    if (isPrismaTableMissingError(error)) {
      return NextResponse.json({
        timeLimit: null,
        appLimits: [],
        categoryLimits: [],
        alwaysAllowed: [],
        blockedDuringFocus: [],
        warning: "Time-limit tables are missing in current database.",
      });
    }
    const message = error instanceof Error ? error.message : "Failed to load time limits.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return unauthorizedJson();
    }

    const payload = await req.json();
    const childId = payload?.childId ? Number.parseInt(String(payload.childId), 10) : null;
    const action = typeof payload?.action === "string" ? payload.action : "";

    if (!childId || Number.isNaN(childId)) {
      return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
    }
    if (action !== "RESET_DAILY_TIMER") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const child = await requireChild(childId, session.userId);
    if (!child) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = getUBTodayDate();
    const removed = await prisma.dailyUsage.deleteMany({
      where: { childId, date: today },
    });

    return NextResponse.json({
      success: true,
      resetRows: removed.count,
      message: "Daily timer reset.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset daily timer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return unauthorizedJson();
    }

    const payload = await req.json();
    const childId = payload?.childId ? Number.parseInt(String(payload.childId), 10) : null;

    if (!childId || Number.isNaN(childId)) {
      return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
    }

    const child = await requireChild(childId, session.userId);
    if (!child) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const timeLimit = payload?.timeLimit ?? {};
    const appLimits = Array.isArray(payload?.appLimits) ? payload.appLimits : [];
    const categoryLimits = Array.isArray(payload?.categoryLimits) ? payload.categoryLimits : [];
    const alwaysAllowed = Array.isArray(payload?.alwaysAllowed) ? payload.alwaysAllowed : [];
    const blockedDuringFocus = Array.isArray(payload?.blockedDuringFocus)
      ? payload.blockedDuringFocus
      : [];

    const persistTimeLimitData = async () =>
      prisma.$transaction([
        prisma.childTimeLimit.upsert({
          where: { childId },
          update: {
            dailyLimit: toStoredSeconds(timeLimit.dailyLimit, DEFAULT_TIME_LIMIT_SECONDS.dailyLimit),
            weekdayLimit: toStoredSeconds(
              timeLimit.weekdayLimit,
              DEFAULT_TIME_LIMIT_SECONDS.weekdayLimit,
            ),
            weekendLimit: toStoredSeconds(
              timeLimit.weekendLimit,
              DEFAULT_TIME_LIMIT_SECONDS.weekendLimit,
            ),
            sessionLimit: toStoredSeconds(
              timeLimit.sessionLimit,
              DEFAULT_TIME_LIMIT_SECONDS.sessionLimit,
            ),
            breakEvery: toStoredSeconds(timeLimit.breakEvery, DEFAULT_TIME_LIMIT_SECONDS.breakEvery),
            breakDuration: toStoredSeconds(
              timeLimit.breakDuration,
              DEFAULT_TIME_LIMIT_SECONDS.breakDuration,
            ),
            focusMode: Boolean(timeLimit.focusMode ?? false),
            downtimeEnabled: Boolean(timeLimit.downtimeEnabled ?? true),
          },
          create: {
            childId,
            dailyLimit: toStoredSeconds(timeLimit.dailyLimit, DEFAULT_TIME_LIMIT_SECONDS.dailyLimit),
            weekdayLimit: toStoredSeconds(
              timeLimit.weekdayLimit,
              DEFAULT_TIME_LIMIT_SECONDS.weekdayLimit,
            ),
            weekendLimit: toStoredSeconds(
              timeLimit.weekendLimit,
              DEFAULT_TIME_LIMIT_SECONDS.weekendLimit,
            ),
            sessionLimit: toStoredSeconds(
              timeLimit.sessionLimit,
              DEFAULT_TIME_LIMIT_SECONDS.sessionLimit,
            ),
            breakEvery: toStoredSeconds(timeLimit.breakEvery, DEFAULT_TIME_LIMIT_SECONDS.breakEvery),
            breakDuration: toStoredSeconds(
              timeLimit.breakDuration,
              DEFAULT_TIME_LIMIT_SECONDS.breakDuration,
            ),
            focusMode: Boolean(timeLimit.focusMode ?? false),
            downtimeEnabled: Boolean(timeLimit.downtimeEnabled ?? true),
          },
        }),
        prisma.childAppLimit.deleteMany({ where: { childId } }),
        prisma.childCategoryLimit.deleteMany({ where: { childId } }),
        prisma.childAlwaysAllowed.deleteMany({ where: { childId } }),
        prisma.childFocusBlocked.deleteMany({ where: { childId } }),
        prisma.childAppLimit.createMany({
          data: appLimits
            .filter((item: { name?: string; minutes?: number }) => item?.name)
            .map((item: { name: string; minutes?: number }) => ({
              childId,
              name: String(item.name),
              minutes: Number(item.minutes ?? 0),
            })),
          skipDuplicates: true,
        }),
        prisma.childCategoryLimit.createMany({
          data: categoryLimits
            .filter((item: { name?: string; minutes?: number }) => item?.name)
            .map((item: { name: string; minutes?: number }) => ({
              childId,
              name: String(item.name),
              minutes: Number(item.minutes ?? 0),
            })),
          skipDuplicates: true,
        }),
        prisma.childAlwaysAllowed.createMany({
          data: alwaysAllowed
            .filter((name: string) => name && String(name).trim().length > 0)
            .map((name: string) => ({
              childId,
              name: String(name),
            })),
          skipDuplicates: true,
        }),
        prisma.childFocusBlocked.createMany({
          data: blockedDuringFocus
            .filter((name: string) => name && String(name).trim().length > 0)
            .map((name: string) => ({
              childId,
              name: String(name),
            })),
          skipDuplicates: true,
        }),
      ]);

    try {
      await persistTimeLimitData();
    } catch (error) {
      if (!isPrismaTableMissingError(error)) throw error;
      await ensureTimeLimitTables();
      await persistTimeLimitData();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save time limits.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

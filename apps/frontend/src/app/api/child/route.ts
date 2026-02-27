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

const getTimeZoneOffsetMinutes = (value: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(value);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? 0);
  const month = Number(parts.find((part) => part.type === "month")?.value ?? 1);
  const day = Number(parts.find((part) => part.type === "day")?.value ?? 1);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const second = Number(parts.find((part) => part.type === "second")?.value ?? 0);
  const interpretedUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return Math.round((interpretedUtc - value.getTime()) / 60000);
};

const getDayStart = (timeZone: string, value: Date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? 0);
  const month = Number(parts.find((part) => part.type === "month")?.value ?? 1);
  const day = Number(parts.find((part) => part.type === "day")?.value ?? 1);
  const utcMidnightGuess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcMidnightGuess, timeZone);
  return new Date(utcMidnightGuess.getTime() - offsetMinutes * 60 * 1000);
};

/* CREATE child */
export async function POST(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return unauthorizedJson();
    }

    const { name, age, gender, pin } = await req.json();
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const parsedAge =
      age === undefined || age === null || age === ""
        ? null
        : Number.parseInt(age, 10);
    if (!trimmedName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (Number.isNaN(parsedAge)) {
      return NextResponse.json({ error: "Invalid age" }, { status: 400 });
    }

    const child = await prisma.child.create({
      data: {
        name: trimmedName,
        age: parsedAge ?? undefined,
        gender: gender ?? undefined,
        pin,
        parentId: session.userId,
      },
    });

    return NextResponse.json(child);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error creating child";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* READ children of parent */
export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }
  const { searchParams } = new URL(req.url);
  const timeZone = normalizeTimeZone(searchParams.get("timeZone"));
  const todayKey = getDateKey(new Date(), timeZone);
  const todayStart = getDayStart(timeZone, new Date());

  const children = await prisma.child.findMany({
    where: { parentId: session.userId },
  });

  if (children.length === 0) {
    return NextResponse.json([]);
  }

  const childIds = children.map((child) => child.id);
  const todayHistory = await prisma.history.findMany({
    where: {
      childId: { in: childIds },
      visitedAt: { gte: todayStart },
    },
    select: { childId: true, duration: true, visitedAt: true },
  });

  const todaySecondsByChild = new Map<number, number>();
  for (const row of todayHistory) {
    if (!row.visitedAt) continue;
    const visitedAt = new Date(row.visitedAt);
    if (Number.isNaN(visitedAt.getTime())) continue;
    if (getDateKey(visitedAt, timeZone) !== todayKey) continue;

    const current = todaySecondsByChild.get(row.childId) ?? 0;
    todaySecondsByChild.set(row.childId, current + Math.max(0, Number(row.duration ?? 0)));
  }

  const enriched = children.map((child) => ({
    ...child,
    todayUsageMinutes: Math.round((todaySecondsByChild.get(child.id) ?? 0) / 60),
  }));

  return NextResponse.json(enriched);
}

/* UPDATE */
export async function PUT(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  const { id, name, age, pin } = await req.json();
  const childId = Number(id);
  if (!Number.isInteger(childId) || childId <= 0) {
    return NextResponse.json({ error: "Invalid child id." }, { status: 400 });
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, parentId: true },
  });
  if (!child || child.parentId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.child.update({
    where: { id: childId },
    data: { name, age, pin },
  });

  return NextResponse.json(updated);
}

/* DELETE */
export async function DELETE(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  const { id } = await req.json();
  const childId = Number(id);
  if (!Number.isInteger(childId) || childId <= 0) {
    return NextResponse.json({ error: "Invalid child id." }, { status: 400 });
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, parentId: true },
  });
  if (!child || child.parentId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.child.delete({
    where: { id: childId },
  });

  return NextResponse.json({ success: true });
}

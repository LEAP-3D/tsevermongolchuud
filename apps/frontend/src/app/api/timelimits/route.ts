import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const requireChild = async (childId: number, parentId: number) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, parentId: true },
  });
  if (!child || child.parentId !== parentId) return null;
  return child;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childIdParam = searchParams.get("childId");
  const parentIdParam = searchParams.get("parentId");
  const childId = childIdParam ? Number.parseInt(childIdParam, 10) : null;
  const parentId = parentIdParam ? Number.parseInt(parentIdParam, 10) : null;

  if (!childId || Number.isNaN(childId)) {
    return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
  }
  if (!parentId || Number.isNaN(parentId)) {
    return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
  }

  const child = await requireChild(childId, parentId);
  if (!child) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [timeLimit, appLimits, categoryLimits, alwaysAllowed, blockedDuringFocus] =
    await Promise.all([
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

  return NextResponse.json({
    timeLimit,
    appLimits,
    categoryLimits,
    alwaysAllowed,
    blockedDuringFocus,
  });
}

export async function PUT(req: Request) {
  try {
    const payload = await req.json();
    const childId = payload?.childId ? Number.parseInt(String(payload.childId), 10) : null;
    const parentId = payload?.parentId ? Number.parseInt(String(payload.parentId), 10) : null;

    if (!childId || Number.isNaN(childId)) {
      return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
    }
    if (!parentId || Number.isNaN(parentId)) {
      return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
    }

    const child = await requireChild(childId, parentId);
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

    await prisma.$transaction([
      prisma.childTimeLimit.upsert({
        where: { childId },
        update: {
          dailyLimit: Number(timeLimit.dailyLimit ?? 240),
          weekdayLimit: Number(timeLimit.weekdayLimit ?? 180),
          weekendLimit: Number(timeLimit.weekendLimit ?? 300),
          sessionLimit: Number(timeLimit.sessionLimit ?? 60),
          breakEvery: Number(timeLimit.breakEvery ?? 45),
          breakDuration: Number(timeLimit.breakDuration ?? 10),
          focusMode: Boolean(timeLimit.focusMode ?? false),
          downtimeEnabled: Boolean(timeLimit.downtimeEnabled ?? true),
        },
        create: {
          childId,
          dailyLimit: Number(timeLimit.dailyLimit ?? 240),
          weekdayLimit: Number(timeLimit.weekdayLimit ?? 180),
          weekendLimit: Number(timeLimit.weekendLimit ?? 300),
          sessionLimit: Number(timeLimit.sessionLimit ?? 60),
          breakEvery: Number(timeLimit.breakEvery ?? 45),
          breakDuration: Number(timeLimit.breakDuration ?? 10),
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

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save time limits.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSessionFromRequest, unauthorizedJson } from "@/lib/session";

const defaultSettings = {
  emailNotifications: true,
  weeklyReports: true,
  realtimeAlerts: true,
};

const isNotificationSettingsSchemaError = (error: unknown) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  return error.code === "P2021" || error.code === "P2022";
};

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  try {
    const settings = await prisma.notificationSetting.findUnique({
      where: { userId: session.userId },
      select: {
        emailNotifications: true,
        weeklyReports: true,
        realtimeAlerts: true,
      },
    });

    return NextResponse.json(settings ?? defaultSettings);
  } catch (error) {
    if (isNotificationSettingsSchemaError(error)) {
      // Backward-safe fallback: keep settings page usable until DB schema is synced.
      return NextResponse.json(defaultSettings);
    }
    const message =
      error instanceof Error ? error.message : "Failed to load notification settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  const payload = (await req.json()) as {
    emailNotifications?: boolean;
    weeklyReports?: boolean;
    realtimeAlerts?: boolean;
  };

  const next = {
    emailNotifications:
      typeof payload.emailNotifications === "boolean"
        ? payload.emailNotifications
        : undefined,
    weeklyReports:
      typeof payload.weeklyReports === "boolean" ? payload.weeklyReports : undefined,
    realtimeAlerts:
      typeof payload.realtimeAlerts === "boolean" ? payload.realtimeAlerts : undefined,
  };

  if (
    next.emailNotifications === undefined &&
    next.weeklyReports === undefined &&
    next.realtimeAlerts === undefined
  ) {
    return NextResponse.json(
      { error: "At least one notification setting is required." },
      { status: 400 },
    );
  }

  try {
    const settings = await prisma.notificationSetting.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        emailNotifications: next.emailNotifications ?? true,
        weeklyReports: next.weeklyReports ?? true,
        realtimeAlerts: next.realtimeAlerts ?? true,
      },
      update: {
        ...(next.emailNotifications === undefined
          ? {}
          : { emailNotifications: next.emailNotifications }),
        ...(next.weeklyReports === undefined ? {} : { weeklyReports: next.weeklyReports }),
        ...(next.realtimeAlerts === undefined ? {} : { realtimeAlerts: next.realtimeAlerts }),
      },
      select: {
        emailNotifications: true,
        weeklyReports: true,
        realtimeAlerts: true,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (isNotificationSettingsSchemaError(error)) {
      return NextResponse.json(
        {
          error:
            "Notification settings are temporarily unavailable. Please sync the database schema and try again.",
        },
        { status: 503 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Failed to update notification settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

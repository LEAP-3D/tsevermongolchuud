// src/app/api/extension/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1) API key шалгах
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 401 }
      );
    }

    // 2) User олох
    const user = await prisma.user.findUnique({
      where: { apiKey },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // 3) Body авах
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "url is required" },
        { status: 400 }
      );
    }

    // 4) Blacklist шалгах
    const blacklisted = await prisma.blacklisted.findFirst({
      where: {
        userId: user.id,
        url: {
          contains: url,
        },
      },
    });

    const status = blacklisted ? "blocked" : "allowed";

    // 5) Status log хадгалах
    await prisma.status.create({
      data: {
        userId: user.id,
        url,
        status,
      },
    });

    // 6) Хэрвээ blocked бол статистик update
    if (status === "blocked") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.usageStats.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: today,
          },
        },
        create: {
          userId: user.id,
          date: today,
          totalVisits: 0,
          totalBlocked: 1,
          totalAllowed: 0,
        },
        update: {
          totalBlocked: { increment: 1 },
        },
      });

      const domain = new URL(url).hostname;

      await prisma.siteStats.upsert({
        where: { domain },
        create: {
          domain,
          totalVisits: 0,
          totalBlocked: 1,
          lastVisited: new Date(),
        },
        update: {
          totalBlocked: { increment: 1 },
          lastVisited: new Date(),
        },
      });
    }

    return NextResponse.json({
      status,
      blocked: status === "blocked",
    });
  } catch (error) {
    console.error("Error checking site status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// src/app/api/extension/history/route.ts
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
    const { url, domain, title } = body;

    if (!url || !domain) {
      return NextResponse.json(
        { error: "url and domain are required" },
        { status: 400 }
      );
    }

    // 4) History хадгалах
    await prisma.historyData.create({
      data: {
        userId: user.id,
        url,
        domain,
        title: title || "",
        visitedAt: new Date(),
      },
    });

    // 5) Site stats update
    await prisma.siteStats.upsert({
      where: { domain },
      create: {
        domain,
        totalVisits: 1,
        totalBlocked: 0,
        lastVisited: new Date(),
      },
      update: {
        totalVisits: { increment: 1 },
        lastVisited: new Date(),
      },
    });

    // 6) Usage stats (өдрийн)
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
        totalVisits: 1,
        totalBlocked: 0,
        totalAllowed: 1,
      },
      update: {
        totalVisits: { increment: 1 },
        totalAllowed: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

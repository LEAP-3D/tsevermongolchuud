// src/app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    // 1) Auth шалгах
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2) Сүүлийн 30 хоног
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // 3) Usage stats
    const usageStats = await prisma.usageStats.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // 4) Top domains
    const topDomains = await prisma.historyData.groupBy({
      by: ["domain"],
      where: {
        userId: session.user.id,
        visitedAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        domain: true,
      },
      orderBy: {
        _count: {
          domain: "desc",
        },
      },
      take: 10,
    });

    // 5) Overall stats
    const totalVisits = await prisma.historyData.count({
      where: { userId: session.user.id },
    });

    const totalBlocked = await prisma.blacklisted.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      usageStats,
      topDomains,
      totalVisits,
      totalBlocked,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

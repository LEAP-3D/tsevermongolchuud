// src/app/api/dashboard/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1) Auth шалгах
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2) Query параметрүүд
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Number(searchParams.get("limit") || 100);

    // 3) Prisma where нөхцөл
    const where: any = {
      userId: session.user.id,
    };

    if (domain) {
      where.domain = domain;
    }

    if (startDate || endDate) {
      where.visitedAt = {};
      if (startDate) where.visitedAt.gte = new Date(startDate);
      if (endDate) where.visitedAt.lte = new Date(endDate);
    }

    // 4) History татах
    const history = await prisma.historyData.findMany({
      where,
      orderBy: {
        visitedAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

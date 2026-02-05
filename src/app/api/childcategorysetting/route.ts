import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { childId, categoryId, status, timeLimit } = await req.json();

  const setting = await prisma.childCategorySetting.upsert({
    where: {
      childId_categoryId: { childId, categoryId },
    },
    update: {
      status,
      timeLimit,
    },
    create: {
      childId,
      categoryId,
      status,
      timeLimit,
    },
  });

  return NextResponse.json(setting);
}

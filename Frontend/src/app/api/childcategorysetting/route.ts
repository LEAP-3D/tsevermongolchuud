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

/* READ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const categoryId = searchParams.get("categoryId");

  const settings = await prisma.childCategorySetting.findMany({
    where: {
      ...(childId ? { childId: Number(childId) } : {}),
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
    },
  });

  return NextResponse.json(settings);
}

/* DELETE */
export async function DELETE(req: Request) {
  const { childId, categoryId } = await req.json();

  await prisma.childCategorySetting.delete({
    where: { childId_categoryId: { childId, categoryId } },
  });

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* CREATE */
export async function POST(req: Request) {
  const { childId, categoryId, date, duration } = await req.json();

  const usage = await prisma.dailyUsage.create({
    data: {
      childId,
      categoryId,
      date: date ? new Date(date) : undefined,
      duration,
    },
  });

  return NextResponse.json(usage);
}

/* READ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const categoryId = searchParams.get("categoryId");
  const date = searchParams.get("date");

  const usage = await prisma.dailyUsage.findMany({
    where: {
      ...(childId ? { childId: Number(childId) } : {}),
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      ...(date ? { date: new Date(date) } : {}),
    },
  });

  return NextResponse.json(usage);
}

/* UPDATE */
export async function PUT(req: Request) {
  const { id, duration } = await req.json();

  const usage = await prisma.dailyUsage.update({
    where: { id },
    data: { duration },
  });

  return NextResponse.json(usage);
}

/* DELETE */
export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.dailyUsage.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

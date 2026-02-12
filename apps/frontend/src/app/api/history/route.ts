import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* CREATE */
export async function POST(req: Request) {
  const {
    childId,
    fullUrl,
    domain,
    title,
    categoryName,
    duration,
    visitedAt,
    actionTaken,
    device,
  } = await req.json();

  const history = await prisma.history.create({
    data: {
      childId,
      fullUrl,
      domain,
      title,
      categoryName,
      duration,
      visitedAt: visitedAt ? new Date(visitedAt) : undefined,
      actionTaken,
      device,
    },
  });

  return NextResponse.json(history);
}

/* READ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const categoryName = searchParams.get("categoryName");

  const history = await prisma.history.findMany({
    where: {
      ...(childId ? { childId: Number(childId) } : {}),
      ...(categoryName ? { categoryName } : {}),
    },
    orderBy: { visitedAt: "desc" },
  });

  return NextResponse.json(history);
}

/* DELETE */
export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.history.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

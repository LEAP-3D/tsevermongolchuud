import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
//

/* CREATE */
export async function POST(req: Request) {
  const { childId, type, message, isSent } = await req.json();

  const alert = await prisma.alert.create({
    data: {
      childId,
      type,
      message,
      isSent: isSent ?? false,
    },
  });

  return NextResponse.json(alert);
}

/* READ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const isSent = searchParams.get("isSent");

  const alerts = await prisma.alert.findMany({
    where: {
      ...(childId ? { childId: Number(childId) } : {}),
      ...(isSent ? { isSent: isSent === "true" } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}

/* UPDATE */
export async function PUT(req: Request) {
  const { id, isSent, message, type } = await req.json();

  const alert = await prisma.alert.update({
    where: { id },
    data: { isSent, message, type },
  });

  return NextResponse.json(alert);
}

/* DELETE */
export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.alert.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

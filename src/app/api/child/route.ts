import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* CREATE child */
export async function POST(req: Request) {
  const { name, age, gender, parentId, pin } = await req.json();

  const child = await prisma.child.create({
    data: {
      name,
      age,
      gender,
      pin,
      parentId,
    },
  });

  return NextResponse.json(child);
}

/* READ children of parent */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parentId = Number(searchParams.get("parentId"));

  const children = await prisma.child.findMany({
    where: { parentId },
  });

  return NextResponse.json(children);
}

/* UPDATE */
export async function PUT(req: Request) {
  const { id, name, age, pin } = await req.json();

  const child = await prisma.child.update({
    where: { id },
    data: { name, age, pin },
  });

  return NextResponse.json(child);
}

/* DELETE */
export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.child.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

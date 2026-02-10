import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* CREATE child */
export async function POST(req: Request) {
  try {
    const { name, age, gender, parentId, pin } = await req.json();
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const parsedAge =
      age === undefined || age === null || age === ""
        ? null
        : Number.parseInt(age, 10);
    const parsedParentId =
      parentId === undefined || parentId === null || parentId === ""
        ? null
        : Number.parseInt(parentId, 10);
    if (!trimmedName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (Number.isNaN(parsedAge)) {
      return NextResponse.json({ error: "Invalid age" }, { status: 400 });
    }
    if (Number.isNaN(parsedParentId)) {
      return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
    }
    if (!parsedParentId) {
      return NextResponse.json({ error: "parentId is required" }, { status: 400 });
    }

    const child = await prisma.child.create({
      data: {
        name: trimmedName,
        age: parsedAge ?? undefined,
        gender: gender ?? undefined,
        pin,
        parentId: parsedParentId,
      },
    });

    return NextResponse.json(child);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error creating child";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* READ children of parent */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");

  const parsedParentId =
    parentId === undefined || parentId === null || parentId === ""
      ? null
      : Number.parseInt(parentId, 10);

  if (!parsedParentId || Number.isNaN(parsedParentId)) {
    return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
  }

  const children = await prisma.child.findMany({
    where: { parentId: parsedParentId },
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

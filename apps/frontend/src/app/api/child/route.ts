import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest, unauthorizedJson } from "@/lib/session";

/* CREATE child */
export async function POST(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return unauthorizedJson();
    }

    const { name, age, gender, pin } = await req.json();
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const parsedAge =
      age === undefined || age === null || age === ""
        ? null
        : Number.parseInt(age, 10);
    if (!trimmedName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (Number.isNaN(parsedAge)) {
      return NextResponse.json({ error: "Invalid age" }, { status: 400 });
    }

    const child = await prisma.child.create({
      data: {
        name: trimmedName,
        age: parsedAge ?? undefined,
        gender: gender ?? undefined,
        pin,
        parentId: session.userId,
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
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  const children = await prisma.child.findMany({
    where: { parentId: session.userId },
  });

  return NextResponse.json(children);
}

/* UPDATE */
export async function PUT(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  const { id, name, age, pin } = await req.json();
  const childId = Number(id);
  if (!Number.isInteger(childId) || childId <= 0) {
    return NextResponse.json({ error: "Invalid child id." }, { status: 400 });
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, parentId: true },
  });
  if (!child || child.parentId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.child.update({
    where: { id: childId },
    data: { name, age, pin },
  });

  return NextResponse.json(updated);
}

/* DELETE */
export async function DELETE(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  const { id } = await req.json();
  const childId = Number(id);
  if (!Number.isInteger(childId) || childId <= 0) {
    return NextResponse.json({ error: "Invalid child id." }, { status: 400 });
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, parentId: true },
  });
  if (!child || child.parentId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.child.delete({
    where: { id: childId },
  });

  return NextResponse.json({ success: true });
}

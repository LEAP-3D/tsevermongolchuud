import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

/* CREATE */
export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  const hashedPassword = await hashPassword(String(password ?? ""));

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return NextResponse.json(user);
}

/* READ */
export async function GET() {
  const users = await prisma.user.findMany({
    include: { children: true },
  });

  return NextResponse.json(users);
}

/* UPDATE */
export async function PUT(req: Request) {
  const { id, name, verified } = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data: { name, verified },
  });

  return NextResponse.json(user);
}

/* DELETE */
export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

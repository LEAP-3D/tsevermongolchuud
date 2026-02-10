import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* CREATE */
export async function POST(req: Request) {
  const { name } = await req.json();

  const category = await prisma.categoryCatalog.create({
    data: { name },
  });

  return NextResponse.json(category);
}

/* READ */
export async function GET() {
  const categories = await prisma.categoryCatalog.findMany();

  return NextResponse.json(categories);
}

/* DELETE */
export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.categoryCatalog.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

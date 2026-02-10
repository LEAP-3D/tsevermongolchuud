import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* CREATE */
export async function POST(req: Request) {
  const { domain, categoryName, safetyScore, tags } = await req.json();

  const url = await prisma.urlCatalog.create({
    data: {
      domain,
      categoryName,
      safetyScore,
      tags,
    },
  });

  return NextResponse.json(url);
}

/* READ */
export async function GET() {
  const urls = await prisma.urlCatalog.findMany();

  return NextResponse.json(urls);
}

/* UPDATE */
export async function PUT(req: Request) {
  const { id, categoryName, safetyScore, tags, updatedAt } = await req.json();

  const url = await prisma.urlCatalog.update({
    where: { id },
    data: {
      categoryName,
      safetyScore,
      tags,
      updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
    },
  });

  return NextResponse.json(url);
}

/* DELETE */
export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.urlCatalog.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

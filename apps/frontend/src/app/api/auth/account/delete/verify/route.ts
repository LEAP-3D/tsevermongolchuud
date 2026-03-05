import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashAccountDeleteToken } from "@/lib/accountDeleteVerification";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") ?? "";
    if (!token) {
      return NextResponse.json({ error: "Missing token." }, { status: 400 });
    }

    const tokenHash = hashAccountDeleteToken(token);
    const user = await prisma.user.findFirst({
      where: { deleteAccountTokenHash: tokenHash },
      select: {
        id: true,
        deleteAccountExpiresAt: true,
      },
    });

    if (!user || !user.deleteAccountExpiresAt) {
      return NextResponse.json({ error: "Invalid or expired account deletion link." }, { status: 400 });
    }

    if (user.deleteAccountExpiresAt.getTime() <= Date.now()) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          deleteAccountTokenHash: null,
          deleteAccountRequestedAt: null,
          deleteAccountExpiresAt: null,
        },
      });
      return NextResponse.json({ error: "Invalid or expired account deletion link." }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Account deletion confirmation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

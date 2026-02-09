import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/backend/webhooks";
import prisma from "@/lib/prisma";

type ClerkUserPayload = {
  id: string;
  email_addresses?: Array<{ id: string; email_address: string }>;
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
};

const getPrimaryEmail = (user: ClerkUserPayload) => {
  const primary =
    user.email_addresses?.find(
      (email) => email.id === user.primary_email_address_id
    )?.email_address ?? user.email_addresses?.[0]?.email_address;

  return primary ?? null;
};

export async function POST(req: NextRequest) {
  let event;

  try {
    event = await verifyWebhook(req);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid Clerk webhook signature" },
      { status: 400 }
    );
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const user = event.data as ClerkUserPayload;

    await prisma.clerkUser.upsert({
      where: { clerkId: user.id },
      update: {
        email: getPrimaryEmail(user),
        firstName: user.first_name ?? null,
        lastName: user.last_name ?? null,
        imageUrl: user.image_url ?? null,
      },
      create: {
        clerkId: user.id,
        email: getPrimaryEmail(user),
        firstName: user.first_name ?? null,
        lastName: user.last_name ?? null,
        imageUrl: user.image_url ?? null,
      },
    });
  }

  if (event.type === "user.deleted") {
    const user = event.data as { id: string | null };
    if (user?.id) {
      await prisma.clerkUser.deleteMany({
        where: { clerkId: user.id },
      });
    }
  }

  return NextResponse.json({ received: true });
}

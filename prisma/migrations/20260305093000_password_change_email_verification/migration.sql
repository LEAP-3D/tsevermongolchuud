-- AlterTable
ALTER TABLE "User"
ADD COLUMN "pendingPasswordHash" TEXT,
ADD COLUMN "passwordChangeTokenHash" TEXT,
ADD COLUMN "passwordChangeRequestedAt" TIMESTAMP(3),
ADD COLUMN "passwordChangeExpiresAt" TIMESTAMP(3);

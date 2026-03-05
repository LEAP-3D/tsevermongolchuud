-- AlterTable
ALTER TABLE "User"
ADD COLUMN "deleteAccountTokenHash" TEXT,
ADD COLUMN "deleteAccountRequestedAt" TIMESTAMP(3),
ADD COLUMN "deleteAccountExpiresAt" TIMESTAMP(3);

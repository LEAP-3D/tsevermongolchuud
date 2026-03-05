ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "pendingPasswordHash" TEXT,
ADD COLUMN IF NOT EXISTS "passwordChangeTokenHash" TEXT,
ADD COLUMN IF NOT EXISTS "passwordChangeRequestedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "passwordChangeExpiresAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "deleteAccountTokenHash" TEXT,
ADD COLUMN IF NOT EXISTS "deleteAccountRequestedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "deleteAccountExpiresAt" TIMESTAMP(3);

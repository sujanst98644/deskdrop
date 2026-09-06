-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "buyerUnread" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellerUnread" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "conversations_buyerId_buyerUnread_idx" ON "conversations"("buyerId", "buyerUnread");

-- CreateIndex
CREATE INDEX "conversations_sellerId_sellerUnread_idx" ON "conversations"("sellerId", "sellerUnread");

-- Backfill: derive the flags from the read marks that were the source of truth
-- before this migration, so existing threads keep their badge state.
UPDATE "conversations"
SET "buyerUnread" = TRUE
WHERE "lastMessageAt" IS NOT NULL
  AND "lastSenderId" IS DISTINCT FROM "buyerId"
  AND ("buyerLastReadAt" IS NULL OR "lastMessageAt" > "buyerLastReadAt");

UPDATE "conversations"
SET "sellerUnread" = TRUE
WHERE "lastMessageAt" IS NOT NULL
  AND "lastSenderId" IS DISTINCT FROM "sellerId"
  AND ("sellerLastReadAt" IS NULL OR "lastMessageAt" > "sellerLastReadAt");

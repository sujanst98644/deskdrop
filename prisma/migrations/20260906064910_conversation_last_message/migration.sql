-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "lastSenderId" TEXT;

-- CreateIndex
CREATE INDEX "conversations_lastMessageAt_idx" ON "conversations"("lastMessageAt");

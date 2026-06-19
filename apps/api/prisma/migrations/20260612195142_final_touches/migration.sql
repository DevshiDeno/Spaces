-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'SETTLED', 'FAILED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "commissionAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "payoutAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "payoutAt" TIMESTAMP(3),
ADD COLUMN     "payoutRef" TEXT,
ADD COLUMN     "payoutStatus" "PayoutStatus";

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "payoutPhone" TEXT,
ADD COLUMN     "payoutTill" TEXT;

-- CreateIndex
CREATE INDEX "Booking_payoutStatus_idx" ON "Booking"("payoutStatus");

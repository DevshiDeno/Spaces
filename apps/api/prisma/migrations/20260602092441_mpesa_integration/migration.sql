-- AlterTable
ALTER TABLE "Rsvp" ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "paymentRef" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus",
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "totalAmount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Booking_paymentRef_idx" ON "Booking"("paymentRef");

-- CreateIndex
CREATE INDEX "Rsvp_paymentRef_idx" ON "Rsvp"("paymentRef");

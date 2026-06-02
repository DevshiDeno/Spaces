/*
  Warnings:

  - A unique constraint covering the columns `[inviteToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AllyApplication" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "inviteToken" TEXT,
ADD COLUMN     "inviteTokenExpiresAt" TIMESTAMP(3),
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "AllyApplication_userId_idx" ON "AllyApplication"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_inviteToken_key" ON "User"("inviteToken");

-- AddForeignKey
ALTER TABLE "AllyApplication" ADD CONSTRAINT "AllyApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

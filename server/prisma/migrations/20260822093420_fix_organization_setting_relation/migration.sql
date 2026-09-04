/*
  Warnings:

  - You are about to drop the column `settingId` on the `Organization` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organizationId]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_settingId_fkey";

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "expenseDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "settingId";

-- AlterTable
ALTER TABLE "Setting" ADD COLUMN "organizationId" INTEGER;

-- Assign the existing YIZ-AMS setting to Ya Isa Zama Association
UPDATE "Setting"
SET "organizationId" = 1
WHERE "organizationId" IS NULL;

-- Make organizationId required
ALTER TABLE "Setting"
ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Admin_organizationId_idx" ON "Admin"("organizationId");

-- CreateIndex
CREATE INDEX "Announcement_organizationId_idx" ON "Announcement"("organizationId");

-- CreateIndex
CREATE INDEX "Contribution_organizationId_idx" ON "Contribution"("organizationId");

-- CreateIndex
CREATE INDEX "Expense_organizationId_idx" ON "Expense"("organizationId");

-- CreateIndex
CREATE INDEX "Member_organizationId_idx" ON "Member"("organizationId");

-- CreateIndex
CREATE INDEX "Notification_organizationId_idx" ON "Notification"("organizationId");

-- CreateIndex
CREATE INDEX "PaymentRequest_organizationId_idx" ON "PaymentRequest"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_organizationId_key" ON "Setting"("organizationId");

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

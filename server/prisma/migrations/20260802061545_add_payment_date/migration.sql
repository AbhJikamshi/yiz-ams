/*
  Warnings:

  - The `role` column on the `Admin` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `month` on the `Contribution` table. All the data in the column will be lost.
  - The `status` column on the `Contribution` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[memberId,monthNumber,year]` on the table `Contribution` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Made the column `monthNumber` on table `Contribution` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PAID', 'PENDING', 'PARTIAL', 'WAIVED');

-- DropIndex
DROP INDEX "Contribution_memberId_month_year_key";

-- DropIndex
DROP INDEX "Member_phone_key";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "month",
ADD COLUMN     "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" "ContributionStatus" NOT NULL DEFAULT 'PAID',
ALTER COLUMN "monthNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "address" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Setting" ALTER COLUMN "monthlyContributionAmount" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Contribution_memberId_idx" ON "Contribution"("memberId");

-- CreateIndex
CREATE INDEX "Contribution_year_monthNumber_idx" ON "Contribution"("year", "monthNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_memberId_monthNumber_year_key" ON "Contribution"("memberId", "monthNumber", "year");

-- CreateIndex
CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

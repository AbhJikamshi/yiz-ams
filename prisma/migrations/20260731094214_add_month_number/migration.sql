/*
  Warnings:

  - You are about to drop the column `paymentDate` on the `Contribution` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "paymentDate",
ADD COLUMN     "monthNumber" INTEGER,
ALTER COLUMN "updatedAt" DROP DEFAULT;

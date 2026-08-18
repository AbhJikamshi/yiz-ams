-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "contributionStartMonth" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "contributionStartYear" INTEGER NOT NULL DEFAULT 2024;

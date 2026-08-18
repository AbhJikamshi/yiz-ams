/*
  Warnings:

  - You are about to drop the column `contributionId` on the `PaymentRequest` table. All the data in the column will be lost.
  - You are about to drop the column `monthNumber` on the `PaymentRequest` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `PaymentRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PaymentRequest" DROP CONSTRAINT "PaymentRequest_contributionId_fkey";

-- DropIndex
DROP INDEX "PaymentRequest_contributionId_key";

-- DropIndex
DROP INDEX "PaymentRequest_year_monthNumber_idx";

-- AlterTable
ALTER TABLE "PaymentRequest" DROP COLUMN "contributionId",
DROP COLUMN "monthNumber",
DROP COLUMN "year";

-- CreateTable
CREATE TABLE "PaymentRequestMonth" (
    "id" SERIAL NOT NULL,
    "paymentRequestId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "monthNumber" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PaymentRequestMonth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentRequestMonth_year_monthNumber_idx" ON "PaymentRequestMonth"("year", "monthNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequestMonth_paymentRequestId_year_monthNumber_key" ON "PaymentRequestMonth"("paymentRequestId", "year", "monthNumber");

-- AddForeignKey
ALTER TABLE "PaymentRequestMonth" ADD CONSTRAINT "PaymentRequestMonth_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES "PaymentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

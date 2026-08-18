/*
  Warnings:

  - A unique constraint covering the columns `[contributionId]` on the table `PaymentRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PaymentRequest" ADD COLUMN     "contributionId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_contributionId_key" ON "PaymentRequest"("contributionId");

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

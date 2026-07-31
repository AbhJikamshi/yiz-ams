/*
  Warnings:

  - A unique constraint covering the columns `[memberId,month,year]` on the table `Contribution` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contribution_memberId_month_year_key" ON "Contribution"("memberId", "month", "year");

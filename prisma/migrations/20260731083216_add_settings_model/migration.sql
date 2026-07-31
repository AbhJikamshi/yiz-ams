-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "associationName" TEXT NOT NULL,
    "associationLogo" TEXT,
    "monthlyContributionAmount" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "financialYearStart" INTEGER NOT NULL,
    "financialYearEnd" INTEGER NOT NULL,
    "meetingDay" TEXT,
    "meetingTime" TEXT,
    "meetingVenue" TEXT,
    "chairmanName" TEXT,
    "secretaryName" TEXT,
    "treasurerName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "receiptPrefix" TEXT NOT NULL DEFAULT 'RC',
    "contributionPrefix" TEXT NOT NULL DEFAULT 'CON',
    "expensePrefix" TEXT NOT NULL DEFAULT 'EXP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

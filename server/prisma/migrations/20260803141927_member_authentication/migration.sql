-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "password" TEXT;

-- CreateIndex
CREATE INDEX "Member_status_idx" ON "Member"("status");

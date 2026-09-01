-- CreateTable
CREATE TABLE "MemberPasswordReset" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "memberId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberPasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberPasswordReset_token_key" ON "MemberPasswordReset"("token");

-- CreateIndex
CREATE INDEX "MemberPasswordReset_memberId_idx" ON "MemberPasswordReset"("memberId");

-- CreateIndex
CREATE INDEX "MemberPasswordReset_expiresAt_idx" ON "MemberPasswordReset"("expiresAt");

-- AddForeignKey
ALTER TABLE "MemberPasswordReset" ADD CONSTRAINT "MemberPasswordReset_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

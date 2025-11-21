-- AlterTable
ALTER TABLE "FilingFlat" ADD COLUMN     "blockedBySec" INTEGER;

-- CreateIndex
CREATE INDEX "FilingFlat_blockedBySec_filingUrl_idx" ON "FilingFlat"("blockedBySec", "filingUrl");

/*
  Warnings:

  - Added the required column `companyId` to the `FilingCore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filingUrlJson` to the `FilingCore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FilingCore" ADD COLUMN     "companyId" INTEGER NOT NULL,
ADD COLUMN     "filingUrlJson" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CompanyCore" (
    "id" SERIAL NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cik" TEXT NOT NULL,
    "cikNumber" TEXT NOT NULL,
    "lastChecked" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyCore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCore_ticker_key" ON "CompanyCore"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCore_cik_key" ON "CompanyCore"("cik");

-- CreateIndex
CREATE INDEX "FilingCore_companyId_filingDate_idx" ON "FilingCore"("companyId", "filingDate");

-- AddForeignKey
ALTER TABLE "FilingCore" ADD CONSTRAINT "FilingCore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyCore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

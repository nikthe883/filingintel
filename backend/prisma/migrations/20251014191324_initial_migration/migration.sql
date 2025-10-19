-- CreateTable
CREATE TABLE "FilingCore" (
    "id" BIGSERIAL NOT NULL,
    "accessionNumber" TEXT NOT NULL,
    "companyTicker" TEXT NOT NULL,
    "formCode" TEXT NOT NULL,
    "filingDate" TIMESTAMP(3) NOT NULL,
    "filingUrl" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "flattenedAt" TIMESTAMP(3),

    CONSTRAINT "FilingCore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilingFlat" (
    "id" BIGSERIAL NOT NULL,
    "accessionNumber" TEXT NOT NULL,
    "companyTicker" TEXT NOT NULL,
    "formCode" TEXT NOT NULL,
    "formCategory" TEXT,
    "filingDate" TIMESTAMP(3) NOT NULL,
    "periodEndDate" TIMESTAMP(3),
    "totalBuys" DOUBLE PRECISION,
    "totalSells" DOUBLE PRECISION,
    "totalExercises" DOUBLE PRECISION,
    "sentiment" TEXT,
    "mainOwners" JSONB,
    "revenue" DOUBLE PRECISION,
    "netIncome" DOUBLE PRECISION,
    "epsBasic" DOUBLE PRECISION,
    "fiscalYear" INTEGER,
    "headline" TEXT,
    "items" JSONB,
    "filingUrl" TEXT NOT NULL,
    "source" TEXT,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilingFlat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceDaily" (
    "id" BIGSERIAL NOT NULL,
    "companyTicker" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" BIGSERIAL NOT NULL,
    "companyTicker" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "headline" TEXT NOT NULL,
    "source" TEXT,
    "url" TEXT,
    "sentiment" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilingAnomaly" (
    "id" BIGSERIAL NOT NULL,
    "companyTicker" TEXT NOT NULL,
    "filingId" BIGINT,
    "filingDate" TIMESTAMP(3) NOT NULL,
    "metric" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "severity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilingAnomaly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FilingCore_accessionNumber_key" ON "FilingCore"("accessionNumber");

-- CreateIndex
CREATE INDEX "FilingCore_companyTicker_filingDate_idx" ON "FilingCore"("companyTicker", "filingDate");

-- CreateIndex
CREATE INDEX "FilingCore_formCode_filingDate_idx" ON "FilingCore"("formCode", "filingDate");

-- CreateIndex
CREATE UNIQUE INDEX "FilingFlat_accessionNumber_key" ON "FilingFlat"("accessionNumber");

-- CreateIndex
CREATE INDEX "FilingFlat_companyTicker_filingDate_idx" ON "FilingFlat"("companyTicker", "filingDate");

-- CreateIndex
CREATE INDEX "FilingFlat_formCode_filingDate_idx" ON "FilingFlat"("formCode", "filingDate");

-- CreateIndex
CREATE INDEX "PriceDaily_companyTicker_date_idx" ON "PriceDaily"("companyTicker", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PriceDaily_companyTicker_date_key" ON "PriceDaily"("companyTicker", "date");

-- CreateIndex
CREATE INDEX "NewsArticle_companyTicker_publishedAt_idx" ON "NewsArticle"("companyTicker", "publishedAt");

-- CreateIndex
CREATE INDEX "FilingAnomaly_companyTicker_filingDate_idx" ON "FilingAnomaly"("companyTicker", "filingDate");

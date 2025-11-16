import { PrismaClient } from "../generated/prisma/index.js";
import { SEC_HEADERS, SEC_COMPANY_FILINGS_URL } from "../src/config/constants.js";
import { fetchCikData } from "../src/Helpers/helpers.js";

const prisma = new PrismaClient();
const LIMIT = process.argv[2] ? parseInt(process.argv[2]) : null;
console.log(LIMIT)
// Config
const COMPANY_BATCH_SIZE = 50;   // how many companies to process at once
const FILING_CHUNK_SIZE = 200;   // how many filings to insert per query
const DELAY_MS = 50;             // polite delay to SEC

// Fetch filings for a single company
async function fetchFillingsForCompany(cik) {
  const url = SEC_COMPANY_FILINGS_URL(cik);
  const { cikN, name, ticker, recent } = await fetchCikData(url, SEC_HEADERS);

  if (!recent || !recent.accessionNumber) {
    console.warn(`No filings found for CIK ${cik}`);
    return [];
  }

  const CikNumber = cikN.toString().replace(/^0+/, "");

  const filings = recent.accessionNumber.map((acc, i) => {
    const formattedAcc = acc.replace(/-/g, "");

    return {
      accessionNumber: acc,
      formCode: recent.form[i],
      filingDate: new Date(recent.filingDate[i]),
      filingUrl: `https://www.sec.gov/Archives/edgar/data/${CikNumber}/${formattedAcc}/index.html`,
      filingUrlJson: `https://data.sec.gov/submissions/CIK${cikN}.json`,
      raw: {
        primaryDocDescription: recent.primaryDocDescription[i],
        cik: CikNumber,
        name,
      },
      processedAt: new Date(),
    };
  });

  console.log(`Found ${filings.length} filings for ${ticker || name}`);
  return filings;
}

// Insert filings into DB in chunks
async function insertInChunks(company, filings) {
  for (let i = 0; i < filings.length; i += FILING_CHUNK_SIZE) {
    const chunk = filings.slice(i, i + FILING_CHUNK_SIZE);
    const data = chunk.map(f => ({
      accessionNumber: f.accessionNumber,
      companyTicker: company.ticker,
      formCode: f.formCode,
      filingDate: f.filingDate,
      filingUrl: f.filingUrl,
      filingUrlJson: f.filingUrlJson,
      raw: f.raw,
      companyId: company.id,
      processedAt : f.processedAt,
    }));

    const start = Date.now();
    const result = await prisma.filingCore.createMany({ data, skipDuplicates: true });
    console.log(
      `Inserted ${result.count} filings for ${company.ticker} (chunk of ${chunk.length}) in ${Date.now() - start} ms`
    );
  }
}

// Process one batch of companies
async function processBatch(skip) {
  const companies = await prisma.companyCore.findMany({ take: COMPANY_BATCH_SIZE, skip });
  if (companies.length === 0) return false;

  for (const company of companies) {
    try {
      console.log(`\nFetching filings for ${company.ticker} (${company.cik})`);
      const filings = await fetchFillingsForCompany(company.cik);

      if (filings.length > 0) {
        await insertInChunks(company, filings);
      } else {
        console.log(`ℹNo filings found for ${company.ticker}`);
      }

      // avoid hitting SEC rate limits
      await new Promise(res => setTimeout(res, DELAY_MS));

    } catch (err) {
      console.error(`Error for ${company.ticker}:`, err.message);
    }
  }

  return true;
}

//Main loop
async function main() {
  console.log("Populating FilingCore...");
  let skip = 0;
  let count = 0;
  let running = true;


  while (running) {
    const hasMore = await processBatch(skip);
    if (!hasMore) break;
    skip += COMPANY_BATCH_SIZE;
    count ++;
    if(LIMIT){
      if(count >= LIMIT) {running = false}
    }
    
  }

  console.log("Done populating filings!");
  await prisma.$disconnect();
}

// Run script
main().catch(async (err) => {
  console.error("Fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});

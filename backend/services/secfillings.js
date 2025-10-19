import fetch from "node-fetch";
import { CompanyTickersSEC, GetCompanyTickerFromJsonFile, CheckIfJsonFileExists } from "../helpers.js";


// SEC Headers
const SEC_HEADERS = {
  "User-Agent": "MySECApp/1.0 (admin@mysecapp.com)",
  "Accept": "application/json, text/plain, */*",
  "Connection": "keep-alive"
};

// SEC URL
const SECURL = "https://www.sec.gov/files/company_tickers.json";

// JSON SEC filepath
const JSONSecFilePath = "../backend/data/SECFillings.json" // working only on local not production

export async function getFilingsData(ticker, options = {}) {
  const { year, form, limit = 50 } = options;

  // Get or create local SEC JSON
  let cik, cikNumber, name;
  const fileExists = await CheckIfJsonFileExists(JSONSecFilePath);
  if (!fileExists) {
    const resp = await fetch(SECURL, { headers: SEC_HEADERS });
    const SECData = await resp.json();
    await CompanyTickersSEC(JSONSecFilePath, SECData);
    ({ cik, cikNumber, name } = await GetCompanyTickerFromJsonFile(JSONSecFilePath, ticker));
  } else {
    ({ cik, cikNumber, name } = await GetCompanyTickerFromJsonFile(JSONSecFilePath, ticker));
  }

  // Fetch company filings
  const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`SEC responded ${resp.status}`);
  const data = await resp.json();

  const recent = data.filings?.recent;
  if (!recent) return { name, cikNumber, filings: [] };

  // Build filings list
  let filings = recent.form.map((form, i) => ({
    form,
    date: recent.filingDate[i],
    description: recent.primaryDocDescription[i],
    link: `https://www.sec.gov/Archives/edgar/data/${cikNumber}/${recent.accessionNumber[i].replace(/-/g, "")}/index.html`
  }));

  // Filter by year (if provided)
  if (year) {
    filings = filings.filter(f => new Date(f.date).getFullYear() === parseInt(year));
  }

  // Filter by form (if provided)
  if (form) {
    filings = filings.filter(f => f.form.toLowerCase() === form.toLowerCase());
  }

  // Limit results
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  filings = filings.slice(0, safeLimit);

  return { ticker, name, filings };
}

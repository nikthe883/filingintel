export const SEC_HEADERS = {
  "User-Agent": "MySECApp/1.0 (admin@mysecapp.com)",
  "Accept": "application/json, text/plain, */*",
  "Connection": "keep-alive"
};

 export const SEC_URL = "https://www.sec.gov/files/company_tickers.json";
 export const SEC_BASE_FILLINGS_URL = "https://data.sec.gov/submissions";

 export const SEC_COMPANY_FILINGS_URL = (cik) => `${SEC_BASE_FILLINGS_URL}/CIK${cik}.json`;

 
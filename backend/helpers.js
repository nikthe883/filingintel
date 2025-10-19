import { promises as fs } from "fs";

// Variables

let companyTickerCache = null;

/**
 * Save SEC company tickers JSON file.
 * 
 * @param {string} filePath - Path to the JSON file
 * @param {object} data - Data object to save
 * @param {boolean} refreshCompanyTickersJsonFile - If true, only create file if it doesn't exist
 */

export async function CompanyTickersSEC(filePath, data, refreshCompanyTickersJsonFile = false) {
    
    if(refreshCompanyTickersJsonFile){

            try {
                await fs.access(filePath)

            } catch {

                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            }
    }else{
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    }

}

export async function CheckIfJsonFileExists(filePath) {
  try {

    await fs.access(filePath);
    return true;

  } catch {

    return false;

  }
}

/**
 * Reads a local SEC company tickers JSON file and returns info for a given ticker.
 * @param {string} filePath - Path to the SEC company_tickers.json file.
 * @param {string} ticker - The stock ticker to search for (e.g., "AAPL").
 * @returns {object|null} - { cik, cikNumber, ticker, name } or null if not found.
 */
export async function GetCompanyTickerFromJsonFile(filePath, ticker) {
  try {
    
    if (!companyTickerCache) {
      const fileData = await fs.readFile(filePath, "utf8");
      const obj = JSON.parse(fileData);
      companyTickerCache = Object.values(obj);
    }

    const cleanTicker = String(ticker).trim().toUpperCase();

    const company = companyTickerCache.find(x => x.ticker === cleanTicker);

    if (!company) {
      console.warn(`Ticker not found in ${filePath}: ${cleanTicker}`);
      return null
    }

    const cik = company.cik_str.toString().padStart(10, "0");

    return {
      cik,
      cikNumber: company.cik_str,
      name: company.title
    };
  } catch (err) {
    console.error("Error reading ticker file:", err);
    return null;
  }
}
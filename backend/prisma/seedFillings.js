import { PrismaClient } from "../generated/prisma/index.js";
import {SEC_HEADERS, SEC_COMPANY_FILINGS_URL} from "../src/config/constants.js"
import axios from "axios";

const prisma = new PrismaClient();

// config

const BATCH_SIZE = 100;


async function fetchFillingsforCompany() {

    const url = SEC_COMPANY_FILINGS_URL(cik);
    // TODO wrap this in a helper fuinction, do not know why I am not doing it now...
    // cuz it is late at night, and maybe I will go to bed
    const res = await axios.get(url, { headers: SEC_HEADERS });
    const data = res.data;
    const recent = data.filings?.recent;
    if (!recent) return [];


    


}
console.log(`Fetching fillings data for $"{}" from SEC...`);
async function main() {
  await populateFillingsCoreFromCompanies();
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
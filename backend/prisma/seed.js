import { PrismaClient } from "../generated/prisma/index.js";
import axios from "axios";

const prisma = new PrismaClient();
// TODO make this good.
async function populateCompaniesFromSEC() {
  console.log("Fetching company data from SEC...");

  const SEC_URL = "https://www.sec.gov/files/company_tickers.json";

  const res = await axios.get(SEC_URL, {
    headers: {
      "User-Agent": "yourname@example.com", 
      "Accept-Encoding": "gzip, deflate",
    },
  });

  const data = res.data;
  const companies = Object.values(data);

  console.log(`Found ${companies.length} companies in SEC dataset.`);

  let count = 0;
  for (const c of companies) {
    const ticker = c.ticker.toUpperCase();
    const cik = c.cik_str.toString().padStart(10, "0");

    await prisma.companyCore.upsert({
    where: { cik }, // 👈 change this line
    update: {
        ticker,
        name: c.title,
    },
    create: {
        ticker,
        name: c.title,
        cik,
        cikNumber: c.cik_str.toString(),
    },
    });


    count++;
    if (count % 500 === 0) {
      console.log(`Inserted ${count}/${companies.length} companies...`);
    }
  }

  console.log(`Done! Inserted or updated ${count} companies.`);
}

async function main() {
  await populateCompaniesFromSEC();
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

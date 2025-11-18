import { PrismaClient } from "../generated/prisma/index.js";
import { SEC_HEADERS, SEC_COMPANY_FILINGS_URL } from "../src/config/constants.js";
import { fetchCikData } from "../src/Helpers/helpers.js";
import { XMLParser } from "fast-xml-parser";
import axios from "axios";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  allowBooleanAttributes: true
});
const prisma = new PrismaClient();

const TESTURL = "https://www.sec.gov/Archives/edgar/data/1045810/000158867025000013/wk-form4_1762387575.xml"

async function fetchFiling(urls) {
  const { data: xml } = await axios.get(urls, {
    headers: SEC_HEADERS
  });



  const json = parser.parse(xml);

  const doc = json.ownershipDocument;

  // reporting owner info
  const owner = doc.reportingOwner.reportingOwnerId;

  // all transactions array (SAFE)
  const txs = doc.nonDerivativeTable.nonDerivativeTransaction;
  
  // first transaction
  const first = txs[0];

  // IMPORTNAT SEC FILLING CAN HAVE MULTIPLE TRANSACTION BUT ONE INSIDER THEY CAN REPORT MANY TRADES

  return {
    cik: owner.rptOwnerCik,
    name: owner.rptOwnerName,
    firstTransactionDate: first.transactionDate.value,
    firstTransactionCode: first.transactionCoding.transactionCode
  };
}
  const fillings = await prisma.filingCore.findMany({
  where: { formCode: "4" },
  select: { filingUrl: true }, 
  take: 10
});

  for(const filling of fillings){
    const { data: data } = await axios.get(filling.filingUrl, {
        headers: SEC_HEADERS
      });
    const baseUrl = "https://www.sec.gov";
    const xmlLinks = [...data.matchAll(/href="([^"]+\.xml)"/g)]
        .map(match => baseUrl + match[1]);

 console.log(await fetchFiling(xmlLinks));

  }


// (async () => {
//   
// })();

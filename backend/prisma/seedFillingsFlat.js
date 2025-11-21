import { PrismaClient } from "../generated/prisma/index.js";
import { SEC_HEADERS, SEC_COMPANY_FILINGS_URL } from "../src/config/constants.js";
import { fetchCikData } from "../src/Helpers/helpers.js";
import { XMLParser } from "fast-xml-parser";
import axios from "axios";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  allowBooleanAttributes: true
});
const prisma = new PrismaClient();

const TESTURL = "https://www.sec.gov/Archives/edgar/data/1045810/000158867025000013/wk-form4_1762387575.xml"

async function fetchFiling(url,accessionNumber) {

  await sleep(500);
  try {
    const { data: xml } = await axios.get(url, { headers: SEC_HEADERS });

    const json = parser.parse(xml);
    const doc = json.ownershipDocument;

    const owner = doc.reportingOwner.reportingOwnerId;
    // Need to check every transaction in there
    const txs = doc.nonDerivativeTable.nonDerivativeTransaction;
    // Not only one buy or sell per URL, mind that there could be more
    const first = txs[0];

    const issuerTradingSymbol = doc.issuer.issuerTradingSymbol;

    return {
      accessionNumber: accessionNumber,
      filingUrl:url[0],
      mainOwners: owner.rptOwnerName,
      filingDate: new Date(first.transactionDate.value),
      formCode: first.transactionCoding.transactionCode, // This is not the form code but the buy or sell B or S
      blockedBySec: 0,
      companyTicker:issuerTradingSymbol,
      createdAt :new Date(),
      year : new Date(first.transactionDate.value).getFullYear()

    };
  } catch (err) {
    return {
      blockedBySec : 1,
      filingUrl:url[0],
      accessionNumber: accessionNumber,
      companyTicker : String(Math.random()),
      year : 1,
      createdAt: null,
      formCode: null,
      filingDate: null

    };
  }
}
  const fillings = await prisma.filingCore.findMany({
  where: { formCode: "4" },
  select: { filingUrl: true, accessionNumber: true }, 
  take: 15
});
// Sec blocking form time to time, best to add the block to the database and try again later
// Better to get that URL in FillingsCore as well
  for(const filling of fillings){

    const { data: data } = await axios.get(filling.filingUrl, {
        headers: SEC_HEADERS
      });
    const baseUrl = "https://www.sec.gov";
    const xmlLinks = [...data.matchAll(/href="([^"]+\.xml)"/g)]
        .map(match => baseUrl + match[1]);

 console.log(await fetchFiling(xmlLinks,filling.accessionNumber));
 // for testing to write in the DB
 // Need to change the table format a lot
 const dataIn = await fetchFiling(xmlLinks)
    await prisma.FilingFlat.createMany({ data: [dataIn], skipDuplicates: true });
  }


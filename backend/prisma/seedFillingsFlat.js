import { PrismaClient } from "../generated/prisma/index.js";
import { SEC_HEADERS, SEC_BASE_URL } from "../src/config/constants.js";
import { sleep, parser } from "../src/Helpers/helpers.js";
import axios from "axios";

const prisma = new PrismaClient();

async function getInfo(doc){

  const transactions = doc.nonDerivativeTable.nonDerivativeTransaction;

  // Array of information per transaction
  const infoPerTransaction = transactions.map(tx => ({

    securityTitle: tx.securityTitle.value,
    transactionCode: tx.transactionCoding.transactionCode.value,
    shares: tx.transactionAmounts.transactionShares?.value,
    price: tx.transactionAmounts.transactionPricePerShare?.value,

  }))

  // Total numbers
  const totalTransactionAmount = result.reduce((sum, tx) => sum + tx.shares * tx.price, 0);
  const totalShares = result.reduce((sum, tx) => sum + tx.shares, 0);
  const totalMoney = result.reduce((sum, tx) => sum + tx.price, 0);
  const weightedAveragePrice = totalTransactionAmount / totalShares;

  return{
    separateTransactionInfo: infoPerTransaction,
    totalTransactionAmount : totalTransactionAmount,
    totalShares : totalShares,
    totalMoney : totalMoney,
    weightedAveragePrice: weightedAveragePrice
  }
}


async function fetchFiling(url, accessionNumber) {
  await sleep(500);

  try {
    const { data: xml } = await axios.get(url, { headers: SEC_HEADERS });

    const json = parser.parse(xml);
    const doc = json.ownershipDocument;

    //Getting data to fill the table
    const owner = doc.reportingOwner.reportingOwnerId.rptOwnerName;
    const companyTicker = doc.issuer.issuerTradingSymbol;
    

    // Need to check every transaction in there
    
    // Not only one buy or sell per URL, mind that there could be more
    const first = txs[0];

    return {
      accessionNumber: accessionNumber,
      companyTicker:companyTicker,
      filingUrl:url[0],
      mainOwners: owner,
      filingDate: new Date(first.transactionDate.value),
      formCode: first.transactionCoding.transactionCode, // This is not the form code but the buy or sell B or S
      blockedBySec: 0,
      
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
//   for(const filling of fillings){

//     const { data: data } = await axios.get(filling.filingUrl, {
//         headers: SEC_HEADERS
//       });
//     const baseUrl = SEC_BASE_URL;
//     const xmlLinks = [...data.matchAll(/href="([^"]+\.xml)"/g)]
//         .map(match => baseUrl + match[1]);

//  console.log(await fetchFiling(xmlLinks,filling.accessionNumber));
//  // for testing to write in the DB
//  // Need to change the table format a lot
//  const dataIn = await fetchFiling(xmlLinks)
//     await prisma.FilingFlat.createMany({ data: [dataIn], skipDuplicates: true });
//   }

test()


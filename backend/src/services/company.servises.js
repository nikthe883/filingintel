import prisma from "../config/prisma.js";

export async function getAll() {

  // SELECT * FROM "CompanyCore";

  return prisma.companyCore.findMany();
}

export async function getCompanyInfoByTicker(ticker){

  // find first match from CompanyCore
  
  const foundTicker = await prisma.companyCore.findFirst({
    where: { ticker },
  });

  return foundTicker

}
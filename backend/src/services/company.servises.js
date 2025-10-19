import prisma from "../config/prisma.js";

export async function getAll() {
  // SELECT * FROM "CompanyCore";
  return prisma.companyCore.findMany();
}
import * as CompanyService from "../services/company.servises.js";

export async function getAllCompanies(req, res, next) {
  try {
    const companies = await CompanyService.getAll();
    res.json(companies);
  } catch (err) {
    next(err);
  }
}
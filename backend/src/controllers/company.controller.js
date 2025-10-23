import * as CompanyService from "../services/company.servises.js";

export async function getAllCompanies(req, res, next) {
  try {
    const companies = await CompanyService.getAll();
    res.json(companies);
  } catch (err) {
    next(err);
  }
}

export async function getCompanyInfoByTicker(req, res, next) {
  try {
    
    const { ticker } = req.params;
    const company = await CompanyService.getCompanyInfoByTicker(ticker);

    if (!company) {
      return res.status(404).json({ error: `Company with ticker '${ticker}' not found` });
    }

    res.json(company);
  } catch (err) {
    next(err);
  }
}
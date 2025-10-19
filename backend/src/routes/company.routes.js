import express from "express";
import * as CompanyController from "../controllers/company.controller.js";

const router = express.Router();

router.get("/", CompanyController.getAllCompanies);          // GET /api/companies
//router.get("/:ticker", CompanyController.getCompanyByTicker); // GET /api/companies/AAPL


export default router;

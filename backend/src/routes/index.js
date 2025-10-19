
import express from "express";
import companyRoutes from "./company.routes.js";
//import filingRoutes from "./filing.routes.js";

const router = express.Router();

router.use("/companies", companyRoutes);    
//router.use("/filings", filingRoutes);       

export default router;                     

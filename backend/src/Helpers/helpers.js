import axios from "axios";
import { XMLParser } from "fast-xml-parser";

export async function fetchCikData(url, header) {
  const res = await axios.get(url, { headers: header });
  const data = res.data;

  return {
    cikN: data.cik,                       
    name: data.entityName,               
    ticker: data.tickers?.[0] ?? null,   
    recent: data.filings?.recent ?? null 
  };
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  allowBooleanAttributes: true
});
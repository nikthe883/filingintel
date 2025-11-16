import axios from "axios";

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
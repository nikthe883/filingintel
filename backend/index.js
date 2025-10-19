import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";
import path from "path";

import { getFilingsData } from "../backend/services/secfillings.js";

// fuck this shit.
//  need to write what the fuck do I need for this app cuz thing will go out of rails pretty fast
// need to simplify this shit
// need to separate the bussiness logic cuz not good

const app = express();
app.use(cors());

// #region CONSTS

  const headers = {
    "User-Agent": "MySECApp/1.0 (contact@example.com)", // <- Use your actual contact info per SEC rules
    "Accept": "application/json, text/xml, */*",
    "Connection": "keep-alive",
    
  };

async function safeFetch(url, options = {}, retries = 3, delay = 1000) {


  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok && res.status >= 500 && attempt < retries) {
        console.warn(`⚠️ Fetch failed (${res.status}) on attempt ${attempt}, retrying...`);
        await new Promise(r => setTimeout(r, delay * attempt));
        continue;
      }
      return res;
    } catch (err) {
      console.warn(`⚠️ Fetch error on attempt ${attempt}: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delay * attempt));
    }
  }

  throw new Error(`safeFetch failed after ${retries} attempts for ${url}`);
}

// #endregion

// === ROUTE ===
app.get("/api/filings/:ticker", async (req, res) => {
  try {
    const { ticker } = req.params;
    const { form, limit } = req.query;

    const result = await getFilingsData(ticker, { form, limit });
    res.json({
      ticker: ticker.toUpperCase(),
      name: result.name,
      totalFilings: result.filings.length,
      filings: result.filings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/filings/:ticker/:year", async (req, res) => {
  try {
    const { ticker, year } = req.params;
    const { form, limit } = req.query;

    const result = await getFilingsData(ticker, { year, form, limit });
    res.json({
      ticker: ticker.toUpperCase(),
      name: result.name,
      year: parseInt(year),
      totalFilings: result.filings.length,
      filings: result.filings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//why the fuck the fetch is not exiting when the page is closed ?
// === INSIDER SUMMARY ROUTE ===
app.get("/api/insider-summary/:ticker", async (req, res) => {
  try {
    const { ticker } = req.params;
    console.log("Starting insider analysis for:", ticker);

    const filingsResp = await fetch(`http://localhost:4000/api/filings/${ticker}`, { headers: headers });
    const filingsData = await filingsResp.json();
    const filings = filingsData.filings || [];
    const form4s = filings.filter(f => f.form.startsWith("4"));
    console.log(`Found ${form4s.length} Form 4 filings for ${ticker}`);

    if (!form4s.length) return res.status(404).json({ error: "No Form 4 filings found." });

    const summary = { buys: 0, sells: 0, exercises: 0, others: 0, details: [] };

    for (const f of form4s) {
      try {
        const jsonUrl = f.link.replace("/index.html", "/index.json");
        console.log("\n🔗 Checking filing:", jsonUrl);

        const jsonResp = await fetch(jsonUrl, { headers: headers });
        if (!jsonResp.ok) {
          console.warn("⚠️ Could not fetch index.json:", jsonResp.status);
          continue;
        }

        const j = await jsonResp.json();
        const fileNames = j.directory.item.map(i => i.name);
        console.log("🗂 Files:", fileNames.join(", "));

        const xmlFile = j.directory.item.find(i =>
          i.name.toLowerCase().match(/(form4|f345|wk-form4).*\.xml$/)
        );

        if (!xmlFile) {
          console.warn("⚠️ No Form4 XML file in:", f.link);
          continue;
        }

        let dir = j.directory.name;
        if (dir.startsWith("edgar/data/")) dir = dir.replace(/^edgar\/data\//, "edgar/data/");
        const xmlUrl = `https://www.sec.gov/${dir}/${xmlFile.name}`;
        console.log("📥 Fetching XML:", xmlUrl);

        const xmlResp = await safeFetch(xmlUrl);
        if (!xmlResp.ok) {
          console.warn("⚠️ XML fetch failed:", xmlResp.status);
          continue;
        }

        const xmlText = await xmlResp.text();
        console.log("📄 XML length:", xmlText.length);
        if (!xmlText.includes("<transactionCode>")) {
          console.warn("⚠️ No <transactionCode> found in:", xmlUrl);
          continue;
        }

        const xml = await parseStringPromise(xmlText);
        const owners = xml.ownershipDocument?.reportingOwner || [];
        const ownerNames = owners.map(o =>
          o.reportingOwnerId?.[0]?.rptOwnerName?.[0] || "Unknown"
        );

        const txns =
          xml.ownershipDocument?.nonDerivativeTable?.[0]?.nonDerivativeTransaction || [];
        console.log(`✅ Parsed ${txns.length} transactions.`);

        for (const t of txns) {
          const code = t.transactionCoding?.[0]?.transactionCode?.[0] || "U";
          const shares = parseFloat(
            t.transactionAmounts?.[0]?.transactionShares?.[0]?.value?.[0] || 0
          );
          const price = parseFloat(
            t.transactionAmounts?.[0]?.transactionPricePerShare?.[0]?.value?.[0] || 0
          );
          const security = t.securityTitle?.[0]?.value?.[0] || "Unknown Security";
          const ownership =
            t.ownershipNature?.[0]?.directOrIndirectOwnership?.[0] || "N/A";

          switch (code) {
            case "P": summary.buys += shares; break;
            case "S": summary.sells += shares; break;
            case "M": summary.exercises += shares; break;
            default: summary.others += shares;
          }

          summary.details.push({
            formLink: f.link,
            xmlUrl,
            owners: ownerNames,
            code,
            shares,
            price,
            security,
            ownership,
            date: f.date
          });
        }
      } catch (err) {
        console.warn("❌ Parse error for Form 4:", f.link, err.message);
      }

      await new Promise(r => setTimeout(r, 1200)); // respect rate limits
    }

  } catch (err) {
    console.error("Insider summary error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// === START SERVER ===
const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

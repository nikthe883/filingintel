document.getElementById("searchBtn").addEventListener("click", searchCompany);

async function searchCompany() {
  const ticker = document.getElementById("tickerInput").value.trim().toUpperCase();
  const output = document.getElementById("output");

  if (!ticker) {
    output.textContent = "Please enter a ticker symbol.";
    return;
  }

  try {
    const res = await fetch(`/api/companies/${ticker}`);
    if (!res.ok) {
      output.textContent = "Company not found.";
      return;
    }

    const data = await res.json();
    output.innerHTML  = `ID: ${data.id}<br>
                        Ticker: ${data.ticker}<br>
                        Name: ${data.name}<br>
                        CIK: ${data.cik}<br>
                        CIK Number: ${data.cikNumber}<br>
                        `
  } catch (err) {
    output.textContent = "Error fetching company info.";
  }
}

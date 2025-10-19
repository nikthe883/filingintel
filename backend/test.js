import https from "https";

const options = {
  hostname: "data.sec.gov",
  path: "/submissions/CIK0000320193.json",
  method: "GET",
  headers: {
    "User-Agent": "MySECApp/1.0 (https://yourdomain.com; contact@yourdomain.com)",
    "Accept": "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive"
  }
};

https.get(options, (res) => {
  console.log("Status code:", res.statusCode);
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log("Body length:", data.length);
    console.log("First 300 chars:\n", data.slice(0, 300));
  });
}).on("error", (e) => {
  console.error("Request failed:", e);
});

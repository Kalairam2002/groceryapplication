import http from "http";

const data = JSON.stringify({ query: "give me sandwich items" });

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/ai/chat",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", body);
  });
});

req.on("error", (err) => console.error("Request error:", err));
req.write(data);
req.end();
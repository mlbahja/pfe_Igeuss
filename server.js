const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.json());

// Simple CORS so the dashboard can connect from another origin
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

let latestMeasurement = null;

// Devices push measurements here
app.post("/api/measurements", (req, res) => {
  latestMeasurement = req.body;
  broadcast(latestMeasurement);
  res.status(200).json({ ok: true });
});

// Dashboard can request last known value (optional fallback)
app.get("/api/measurements/latest", (req, res) => {
  if (!latestMeasurement) {
    return res.status(404).json({ error: "no data yet" });
  }
  res.json(latestMeasurement);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on("connection", (ws) => {
  // Send latest data immediately to new dashboards
  if (latestMeasurement) {
    ws.send(JSON.stringify(latestMeasurement));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

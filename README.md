You are a senior software engineer designing a Final Year Project (PFE) with an industrial architecture.

Project title:
Design and Development of a Web-Based Monitoring Platform for an Electrical Measurement Center (Centrale de Mesure)

Main objective:
Develop a complete full-stack monitoring system that simulates an electrical measurement center and displays real-time measurements on a web dashboard.
The system must be architected so that the simulation layer can be easily replaced by a real measurement source (hardware) without impacting the frontend or the API.

Key architectural constraint:
Use a clear abstraction layer between:
- Data acquisition (simulation or real device)
- Backend REST API
- Frontend dashboard

────────────────────────────────────
BACKEND (GOLANG)
────────────────────────────────────

Backend requirements:
- Use Golang (standard library net/http)
- REST API returning JSON
- Enable CORS
- Clean, well-commented, educational code

1. Data model:
Create a Measurement struct containing:
- Voltage (V)
- Current (A)
- ActivePower (kW)
- ReactivePower (kVAR)
- Energy (kWh)
- Frequency (Hz)
- PowerFactor
- Timestamp

2. Data source abstraction (IMPORTANT):
Create a generic interface named MeasurementSource with a method:

  GetMeasurement() (Measurement, error)

This interface represents the data acquisition layer.

3. Simulation implementation:
Create a file simulator.go implementing MeasurementSource.
- Generate realistic electrical values
- Compute power values from voltage and current
- Add comments explaining that this is a virtual centrale de mesure
- Clearly indicate in comments that this module will be replaced later

4. Real device placeholder (DOCUMENTED):
Create a file real_device.go (or modbus_device.go) that also implements MeasurementSource,
but initially returns a "not implemented" error.

Inside this file:
- Add detailed comments explaining how to connect to a real centrale de mesure
- Describe Modbus TCP communication steps
- Indicate where register reading should occur
- Explain how values would be mapped to the Measurement struct

5. Service layer:
Create a service that uses MeasurementSource (simulation by default).
This allows switching between simulation and real device using a configuration flag.

Example:
- SIMULATION_MODE=true → use simulator
- SIMULATION_MODE=false → use real device

6. REST API:
Create endpoint:
  GET /api/measurements

This endpoint must:
- Call the MeasurementSource
- Return the measurement as JSON
- Be independent of the data source type

7. Documentation inside backend:
- Add a README.md inside backend/
- Explain architecture
- Explain simulation mode
- Explain how to switch to real device mode
- Explain future Modbus integration

────────────────────────────────────
FRONTEND
────────────────────────────────────

Frontend requirements:
- HTML5, CSS3, JavaScript
- Industrial-style dashboard
- Responsive layout
- Measurement cards:
  Voltage, Current, Power, Energy, Frequency, Power Factor
- Fetch data from backend using HTTP
- Auto-refresh values every few seconds
- Display a line chart (active power vs time)
- Use Chart.js
- Clean commented code

Frontend constraint:
- The frontend must not be aware of whether data comes from simulation or real hardware

────────────────────────────────────
PROJECT STRUCTURE
────────────────────────────────────

project-root/
│
├── backend/
│   ├── main.go
│   ├── models.go
│   ├── source.go          // MeasurementSource interface
│   ├── simulator.go       // Simulation implementation
│   ├── real_device.go     // Real device placeholder (documented)
│   ├── service.go
│   └── README.md
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── README.md

────────────────────────────────────
EXPECTED RESULT
────────────────────────────────────

- A fully functional web application
- Simulation mode working out of the box
- Clear separation of concerns
- Real device integration documented and prepared
- Easy switch from simulation to real hardware for soutenance demonstration



========================================
NODE BACKEND + WEBSOCKET (REAL-TIME)
========================================

This project includes a simple Node.js backend with:
- REST endpoint for devices to push measurements
- WebSocket broadcast for real-time dashboard updates
- Optional HTTP fallback to fetch the latest value

Files:
- server.js
- package.json

Run the backend:
  npm install
  npm start

By default it runs on:
  http://localhost:3000

Endpoints:
- POST /api/measurements          (device pushes data here)
- GET  /api/measurements/latest   (dashboard fallback)
- WebSocket ws://localhost:3000   (real-time stream)

The frontend (script.js) will:
- Try WebSocket first for real-time updates
- If WebSocket is not available, keep using mock simulation

----------------------------------------
ESP32 PUSH EXAMPLE (HTTP REST)
----------------------------------------

Use this Arduino sketch on ESP32 to push data every 3 seconds:

  #include <WiFi.h>
  #include <HTTPClient.h>

  const char* WIFI_SSID = "YOUR_WIFI_NAME";
  const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";
  const char* API_URL = "http://192.168.1.100:3000/api/measurements";

  void setup() {
    Serial.begin(115200);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
    }
  }

  void loop() {
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(API_URL);
      http.addHeader("Content-Type", "application/json");

      String payload = R"({
        \"voltage\": 230.5,
        \"current\": 10.2,
        \"activePower\": 2.35,
        \"reactivePower\": 0.85,
        \"energy\": 120.4,
        \"frequency\": 50.0,
        \"powerFactor\": 0.95,
        \"timestamp\": \"2026-02-04T12:00:00Z\"
      })";

      http.POST(payload);
      http.end();
    }
    delay(3000);
  }

Steps:
1) Replace WiFi credentials
2) Replace API_URL with your Node backend IP (same network)
3) Upload to ESP32

When ESP32 starts posting data, the dashboard updates in real time.

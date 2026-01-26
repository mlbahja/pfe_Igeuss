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



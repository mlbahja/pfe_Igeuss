// ============================================================================
// CENTRALE DE MESURE - REAL-TIME DATA UPDATE LOGIC
// ============================================================================
// - WebSocket for real-time updates from Node backend
// - Mock simulation still works until devices are connected
// - Replace WS_URL / API_URL when backend is deployed

const WS_URL = "ws://localhost:3000"; // TODO: replace with your real WebSocket server
const API_URL = "http://localhost:3000/api/measurements/latest"; // Optional HTTP fallback
const REFRESH_MS = 3000;

// DOM Elements
const elements = {
  voltage: document.getElementById("voltageValue"),
  current: document.getElementById("currentValue"),
  activePower: document.getElementById("activePowerValue"),
  reactivePower: document.getElementById("reactivePowerValue"),
  energy: document.getElementById("energyValue"),
  frequency: document.getElementById("frequencyValue"),
  powerFactor: document.getElementById("powerFactorValue"),
  lastUpdate: document.getElementById("lastUpdate"),
  pfFill: document.getElementById("pfFill"),
};

// Chart Configuration
const chartCtx = document.getElementById("powerChart").getContext("2d");

const chartData = {
  labels: [],
  datasets: [
    {
      label: "Active Power (kW)",
      data: [],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: "#3b82f6",
      pointHoverBorderColor: "#ffffff",
      pointHoverBorderWidth: 2,
      borderWidth: 2,
    },
  ],
};

const powerChart = new Chart(chartCtx, {
  type: "line",
  data: chartData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#737373",
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          maxRotation: 0,
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#737373",
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          padding: 8,
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: "Power (kW)",
          color: "#737373",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: "500",
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1a1a1a",
        titleColor: "#fafafa",
        bodyColor: "#a1a1a1",
        borderColor: "#262626",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: "600",
        },
        bodyFont: {
          family: "'JetBrains Mono', monospace",
          size: 12,
        },
        displayColors: false,
        callbacks: {
          title: function (context) {
            return "Time: " + context[0].label;
          },
          label: function (context) {
            return context.parsed.y.toFixed(2) + " kW";
          },
        },
      },
    },
  },
});

// Utility Functions
function formatNumber(value, decimals = 2) {
  return Number(value).toFixed(decimals);
}

// MOCK FETCH (simulation until devices are connected)
async function fetchMeasurementsMock() {
  const base = {
    voltage: 230.5,
    current: 10.2,
    activePower: 2.35,
    reactivePower: 0.85,
    energy: 120.4,
    frequency: 50.0,
    powerFactor: 0.95,
  };

  const jitter = (v, r) => v + (Math.random() * r * 2 - r);

  return {
    voltage: jitter(base.voltage, 2),
    current: jitter(base.current, 0.6),
    activePower: jitter(base.activePower, 0.3),
    reactivePower: jitter(base.reactivePower, 0.2),
    energy: jitter(base.energy, 0.5),
    frequency: jitter(base.frequency, 0.2),
    powerFactor: jitter(base.powerFactor, 0.03),
    timestamp: new Date().toISOString(),
  };
}

// Optional HTTP fallback (if you want polling instead of WebSocket)
async function fetchMeasurementsFromAPI() {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error("API not ready");
  }
  return res.json();
}

// Update UI with new measurements
function updateUI(data) {
  animateValue(elements.voltage, formatNumber(data.voltage, 1));
  animateValue(elements.current, formatNumber(data.current, 1));
  animateValue(elements.activePower, formatNumber(data.activePower, 2));
  animateValue(elements.reactivePower, formatNumber(data.reactivePower, 2));
  animateValue(elements.energy, formatNumber(data.energy, 1));
  animateValue(elements.frequency, formatNumber(data.frequency, 1));
  animateValue(elements.powerFactor, formatNumber(data.powerFactor, 2));

  const pfPercentage = Math.min(Math.max(data.powerFactor * 100, 0), 100);
  if (elements.pfFill) {
    elements.pfFill.style.width = pfPercentage + "%";
  }

  const timeLabel = new Date(data.timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  elements.lastUpdate.textContent = timeLabel;

  chartData.labels.push(timeLabel);
  chartData.datasets[0].data.push(data.activePower);

  if (chartData.labels.length > 20) {
    chartData.labels.shift();
    chartData.datasets[0].data.shift();
  }

  powerChart.update("none");
}

// Animate value changes
function animateValue(element, newValue) {
  if (!element) return;

  const currentValue = element.textContent;
  if (currentValue !== newValue) {
    element.style.transition = "opacity 0.15s ease";
    element.style.opacity = "0.5";

    setTimeout(() => {
      element.textContent = newValue;
      element.style.opacity = "1";
    }, 150);
  }
}

let ws;
let wsConnected = false;
let mockIntervalId = null;
let reconnectTimer = null;

function startMockPolling() {
  if (mockIntervalId) return;
  const tick = async () => {
    try {
      const data = await fetchMeasurementsMock();
      updateUI(data);
    } catch (error) {
      console.error("Mock refresh failed:", error);
    }
  };
  tick();
  mockIntervalId = setInterval(tick, REFRESH_MS);
}

function stopMockPolling() {
  if (!mockIntervalId) return;
  clearInterval(mockIntervalId);
  mockIntervalId = null;
}

function connectWebSocket() {
  if (ws) ws.close();

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    wsConnected = true;
    stopMockPolling();
    console.log("WebSocket connected");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      updateUI(data);
    } catch (error) {
      console.error("Invalid WebSocket payload", error);
    }
  };

  ws.onerror = () => {
    wsConnected = false;
    startMockPolling();
  };

  ws.onclose = () => {
    wsConnected = false;
    startMockPolling();
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectWebSocket();
      }, 3000);
    }
  };
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Start mock simulation immediately
  startMockPolling();
  // Try to connect to WebSocket backend
  connectWebSocket();
});

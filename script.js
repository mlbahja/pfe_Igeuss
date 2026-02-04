// DATA UPDATE LOGIC
// - fetchMeasurements() returns mock data now
// - Replace API_URL with your real backend endpoint later

const API_URL = "https://api.placeholder.local/measurements"; // TODO: replace with real REST API URL
const REFRESH_MS = 3000;

const elements = {
  voltage: document.getElementById("voltageValue"),
  current: document.getElementById("currentValue"),
  activePower: document.getElementById("activePowerValue"),
  reactivePower: document.getElementById("reactivePowerValue"),
  energy: document.getElementById("energyValue"),
  frequency: document.getElementById("frequencyValue"),
  powerFactor: document.getElementById("powerFactorValue"),
  lastUpdate: document.getElementById("lastUpdate"),
};

const chartCtx = document.getElementById("powerChart").getContext("2d");
const chartData = {
  labels: [],
  datasets: [
    {
      label: "Active Power (kW)",
      data: [],
      borderColor: "#5ad1ff",
      backgroundColor: "rgba(90, 209, 255, 0.15)",
      tension: 0.3,
      fill: true,
      pointRadius: 2,
    },
  ],
};

const powerChart = new Chart(chartCtx, {
  type: "line",
  data: chartData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#9fb0c5" },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.08)" },
        ticks: { color: "#9fb0c5" },
        title: { display: true, text: "kW", color: "#9fb0c5" },
      },
    },
    plugins: {
      legend: { labels: { color: "#e6eef7" } },
      tooltip: { mode: "index", intersect: false },
    },
  },
});

function formatNumber(value, decimals = 2) {
  return Number(value).toFixed(decimals);
}

// MOCK FETCH
// Later: replace the mock body with a real fetch(API_URL) call.
async function fetchMeasurements() {
  // Simulate variability for demo purposes
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

function updateUI(data) {
  elements.voltage.textContent = formatNumber(data.voltage, 1);
  elements.current.textContent = formatNumber(data.current, 1);
  elements.activePower.textContent = formatNumber(data.activePower, 2);
  elements.reactivePower.textContent = formatNumber(data.reactivePower, 2);
  elements.energy.textContent = formatNumber(data.energy, 1);
  elements.frequency.textContent = formatNumber(data.frequency, 1);
  elements.powerFactor.textContent = formatNumber(data.powerFactor, 2);

  const timeLabel = new Date(data.timestamp).toLocaleTimeString();
  elements.lastUpdate.textContent = timeLabel;

  // Update chart
  chartData.labels.push(timeLabel);
  chartData.datasets[0].data.push(data.activePower);

  if (chartData.labels.length > 20) {
    chartData.labels.shift();
    chartData.datasets[0].data.shift();
  }

  powerChart.update();
}

async function refresh() {
  const data = await fetchMeasurements();
  updateUI(data);
}

// Initial load + auto-refresh every 3 seconds
refresh();
setInterval(refresh, REFRESH_MS);

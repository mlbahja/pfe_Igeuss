"use client"

import { useEffect, useState, useRef } from "react"

// Simple, clean logo component
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] opacity-20" />
        {/* Inner icon - stylized meter/gauge */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          className="relative z-10"
        >
          {/* Gauge arc */}
          <path
            d="M6 18C6 12.4772 10.4772 8 16 8"
            stroke="url(#logoGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Needle */}
          <path
            d="M14 18L18 10"
            stroke="var(--accent-cyan)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Center dot */}
          <circle cx="14" cy="18" r="2.5" fill="var(--accent-blue)" />
          {/* Small indicator dots */}
          <circle cx="7" cy="18" r="1.5" fill="var(--foreground-muted)" />
          <circle cx="10" cy="11" r="1.5" fill="var(--foreground-muted)" />
          <circle cx="18" cy="9" r="1.5" fill="var(--foreground-muted)" />
          <defs>
            <linearGradient id="logoGradient" x1="6" y1="18" x2="16" y2="8" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--accent-blue)" />
              <stop offset="1" stopColor="var(--accent-cyan)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-base font-semibold tracking-tight text-[var(--foreground)]">
          Centrale de Mesure
        </span>
        <span className="text-xs text-[var(--foreground-muted)]">
          Industrial Monitoring
        </span>
      </div>
    </div>
  )
}

// Metric Card Component
function MetricCard({
  icon,
  label,
  value,
  unit,
  range,
  colorClass,
  wide = false,
  children,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  range: string
  colorClass: string
  wide?: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      className={`bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-5 transition-all hover:border-[var(--border-subtle)] hover:bg-[var(--background-elevated)] ${wide ? "md:col-span-2" : ""}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-[var(--foreground-secondary)]">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-semibold font-mono tracking-tight text-[var(--foreground)] transition-all">
          {value}
        </span>
        <span className="text-sm text-[var(--foreground-muted)]">{unit}</span>
      </div>
      {children}
      <span className="text-xs text-[var(--foreground-muted)]">{range}</span>
    </div>
  )
}

// Icons
const VoltageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)

const CurrentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M2 12h20" />
  </svg>
)

const PowerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const ReactiveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
)

const EnergyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const FrequencyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H2V8a2 2 0 0 1 2-2h2" />
    <path d="M22 12h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2V8a2 2 0 0 0-2-2h-2" />
    <path d="M8 12h8" />
  </svg>
)

const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20v-6M6 20V10M18 20V4" />
  </svg>
)

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    voltage: "--",
    current: "--",
    activePower: "--",
    reactivePower: "--",
    energy: "--",
    frequency: "--",
    powerFactor: "--",
  })
  const [lastUpdate, setLastUpdate] = useState("--:--:--")
  const [chartData, setChartData] = useState<number[]>([])
  const [chartLabels, setChartLabels] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)

  // Simulate data updates
  useEffect(() => {
    const updateData = () => {
      const voltage = (220 + Math.random() * 20).toFixed(1)
      const current = (Math.random() * 15).toFixed(2)
      const activePower = ((parseFloat(voltage) * parseFloat(current) * 0.85) / 1000).toFixed(2)
      const reactivePower = ((parseFloat(voltage) * parseFloat(current) * 0.52) / 1000).toFixed(2)
      const energy = (Math.random() * 1000 + 500).toFixed(1)
      const frequency = (49.8 + Math.random() * 0.4).toFixed(2)
      const powerFactor = (0.85 + Math.random() * 0.15).toFixed(2)

      setMetrics({
        voltage,
        current,
        activePower,
        reactivePower,
        energy,
        frequency,
        powerFactor,
      })

      const now = new Date()
      setLastUpdate(now.toLocaleTimeString())

      // Update chart data
      setChartData((prev) => {
        const newData = [...prev, parseFloat(activePower)]
        return newData.slice(-20)
      })
      setChartLabels((prev) => {
        const newLabels = [...prev, now.toLocaleTimeString()]
        return newLabels.slice(-20)
      })
    }

    updateData()
    const interval = setInterval(updateData, 2000)
    return () => clearInterval(interval)
  }, [])

  // Chart rendering
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return

    const loadChart = async () => {
      const Chart = (await import("chart.js/auto")).default

      if (chartRef.current) {
        chartRef.current.data.labels = chartLabels
        chartRef.current.data.datasets[0].data = chartData
        chartRef.current.update("none")
        return
      }

      chartRef.current = new Chart(canvasRef.current!, {
        type: "line",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: "Active Power (kW)",
              data: chartData,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointHoverBackgroundColor: "#3b82f6",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: "index",
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#1a1a1a",
              titleColor: "#fafafa",
              bodyColor: "#a1a1a1",
              borderColor: "#262626",
              borderWidth: 1,
              padding: 12,
              displayColors: false,
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(38, 38, 38, 0.5)", drawBorder: false },
              ticks: { color: "#737373", maxTicksLimit: 6 },
            },
            y: {
              grid: { color: "rgba(38, 38, 38, 0.5)", drawBorder: false },
              ticks: { color: "#737373" },
              beginAtZero: true,
            },
          },
        },
      })
    }

    loadChart()
  }, [chartData, chartLabels])

  const pfValue = parseFloat(metrics.powerFactor) || 0

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-online)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--status-online)]"></span>
              </span>
              <span className="text-sm text-[var(--foreground-secondary)]">Online</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-[var(--border)]" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-[var(--foreground-muted)]">Updated</span>
              <span className="text-sm font-mono text-[var(--foreground)]">{lastUpdate}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Live Measurements</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
              Real-time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <MetricCard
              icon={<VoltageIcon />}
              label="Voltage"
              value={metrics.voltage}
              unit="V"
              range="Nominal: 220-240V"
              colorClass="bg-[var(--accent-yellow)]/10 text-[var(--accent-yellow)]"
            />
            <MetricCard
              icon={<CurrentIcon />}
              label="Current"
              value={metrics.current}
              unit="A"
              range="Max: 16A"
              colorClass="bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
            />
            <MetricCard
              icon={<PowerIcon />}
              label="Active Power"
              value={metrics.activePower}
              unit="kW"
              range="P = V x I x cos(phi)"
              colorClass="bg-[var(--accent-green)]/10 text-[var(--accent-green)]"
            />
            <MetricCard
              icon={<ReactiveIcon />}
              label="Reactive Power"
              value={metrics.reactivePower}
              unit="kVAR"
              range="Q = V x I x sin(phi)"
              colorClass="bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]"
            />
            <MetricCard
              icon={<EnergyIcon />}
              label="Energy"
              value={metrics.energy}
              unit="kWh"
              range="Total Consumption"
              colorClass="bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]"
            />
            <MetricCard
              icon={<FrequencyIcon />}
              label="Frequency"
              value={metrics.frequency}
              unit="Hz"
              range="Nominal: 50Hz"
              colorClass="bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]"
            />
            <MetricCard
              icon={<ChartIcon />}
              label="Power Factor"
              value={metrics.powerFactor}
              unit="PF"
              range="Target: 0.95 - 1.00"
              colorClass="bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]"
              wide
            >
              <div className="w-full h-2 bg-[var(--background-tertiary)] rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] rounded-full transition-all duration-500"
                  style={{ width: `${pfValue * 100}%` }}
                />
              </div>
            </MetricCard>
          </div>
        </section>

        {/* Chart Section */}
        <section className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Active Power Trend</h2>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--accent-blue)]"></span>
              <span className="text-sm text-[var(--foreground-muted)]">kW vs Time</span>
            </div>
          </div>
          <div className="h-64 sm:h-80">
            <canvas ref={canvasRef}></canvas>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-[var(--foreground-secondary)]">
            Centrale de Mesure - Industrial Monitoring System
          </span>
          <span className="text-sm text-[var(--foreground-muted)]">Simulation Mode</span>
        </div>
      </footer>
    </div>
  )
}

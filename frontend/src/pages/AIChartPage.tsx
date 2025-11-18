import React, { useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./index.css"; // ensure Tailwind imported in index.css

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type ChartResponse = {
  ok: boolean;
  chart_type: string;
  grouping: string;
  metric: string;
  timeframe?: string | null;
  labels: string[];
  values: number[];
  data: { label: string; value: number }[];
  error?: string;
};


export default function AIChartPage(): JSX.Element {
  const [prompt, setPrompt] = useState<string>("Show volunteer hours by major in the last 3 months");
  const [timeframe, setTimeframe] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ChartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setResp(null);
    setLoading(true);
    try {
      const body: { prompt: string; timeframe?: string } = { prompt };
      if (timeframe.trim()) body.timeframe = timeframe.trim();
      const r = await fetch("http://localhost:8000/api/generate-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      console.log(j);
      
      if (!r.ok || !j.ok) {
        setError(j?.error || `Server returned ${r.status}`);
        setLoading(false);
        return;
      }
      setResp(j as ChartResponse);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  function renderChart() {
    if (!resp) return null;
    const labels = resp.labels ?? resp.data?.map((d) => d.label) ?? [];
    const values = resp.values ?? resp.data?.map((d) => d.value) ?? [];

    const common = {
      labels,
      datasets: [
        {
          label: `${resp.metric} by ${resp.grouping}`,
          data: values,
          backgroundColor: labels.map((_, i) => `hsl(${(i * 40) % 360} 70% 55% / 0.85)`),
          borderColor: labels.map((_, i) => `hsl(${(i * 40) % 360} 70% 35% / 1)`),
          borderWidth: 1,
        },
      ],
    };

    const options: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" as const },
        title: { display: true, text: `${resp.chart_type} • ${resp.grouping} • ${resp.metric}` },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    };

    switch ((resp.chart_type || "Bar").toLowerCase()) {
      case "line":
        return <div className="h-72"><Line data={common} options={options} /></div>;
      case "pie":
        // For pie, transform dataset
        return (
          <div className="h-72">
            <Pie
              data={{
                labels,
                datasets: [
                  {
                    data: values,
                    backgroundColor: labels.map((_, i) => `hsl(${(i * 40) % 360} 70% 55% / 0.85)`),
                    borderColor: labels.map((_, i) => `hsl(${(i * 40) % 360} 70% 35% / 1)`),
                    borderWidth: 1,
                  },
                ],
              }}
              options={{ plugins: { title: { display: true, text: `${resp.chart_type} • ${resp.metric}` } } }}
            />
          </div>
        );
      default:
        return <div className="h-72"><Bar data={common} options={options} /></div>;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Real-Time Chart Builder</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter a natural language prompt and get a chart (via your chart_realtime endpoint).
          </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-6">
          <label className="block mb-2 text-sm font-medium text-slate-600">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full border border-slate-200 rounded-md p-3 mb-3 focus:outline-none"
            rows={3}
          />

          <div className="grid md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm text-slate-600">Optional timeframe (overrides parsing)</label>
              <input
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="e.g., last 30 days OR from 2025-01-01 to 2025-02-01"
                className="w-full border border-slate-200 rounded-md px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-600">API Endpoint</label>
              {/* <div className="mt-1 font-mono text-xs text-slate-500">{ENDPOINT}</div> */}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white ${loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"}`}
              >
                {loading ? "Generating..." : "Generate Chart"}
              </button>
              <button
                type="button"
                onClick={() => { setPrompt(""); setTimeframe(""); setResp(null); setError(null); }}
                className="px-4 py-2 rounded-md bg-slate-100"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-rose-700 border border-rose-100">{error}</div>
        )}

        {resp && (
          <section className="mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-slate-800">Result • {resp.chart_type}</h2>
                  <div className="text-xs text-slate-500">
                    grouping: {resp.grouping} • metric: {resp.metric} • timeframe: {resp.timeframe ?? "auto"}
                  </div>
                </div>
                <div className="text-sm text-slate-500">{resp.labels.length} items</div>
              </div>

              <div>{renderChart()}</div>

              <div className="mt-4 text-sm text-slate-600">
                <h3 className="font-medium mb-2">Raw data</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500">
                      <tr><th className="pb-2">Label</th><th className="pb-2">Value</th></tr>
                    </thead>
                    <tbody>
                      {resp.data.map((d, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2">{d.label}</td>
                          <td className="py-2">{d.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </section>
        )}

        {!resp && !error && (
          <div className="text-sm text-slate-500">No chart yet — enter a prompt and click Generate.</div>
        )}
      </div>
    </div>
  );
}

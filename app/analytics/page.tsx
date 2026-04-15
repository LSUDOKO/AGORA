"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TimeSeriesPoint {
  time: string;
  events: number;
  swaps: number;
}

interface SkillStat {
  name: string;
  usageCount: number;
  successRate: number;
}

// Mock gas cost data since gas tracking isn't implemented yet
const GAS_MOCK_DATA = [
  { time: "00:00", gasGwei: 1.2, costUsd: 0.04 },
  { time: "02:00", gasGwei: 1.5, costUsd: 0.05 },
  { time: "04:00", gasGwei: 0.9, costUsd: 0.03 },
  { time: "06:00", gasGwei: 2.1, costUsd: 0.07 },
  { time: "08:00", gasGwei: 3.4, costUsd: 0.11 },
  { time: "10:00", gasGwei: 2.8, costUsd: 0.09 },
  { time: "12:00", gasGwei: 1.7, costUsd: 0.06 },
  { time: "14:00", gasGwei: 1.3, costUsd: 0.04 },
  { time: "16:00", gasGwei: 2.2, costUsd: 0.07 },
  { time: "18:00", gasGwei: 1.9, costUsd: 0.06 },
  { time: "20:00", gasGwei: 1.1, costUsd: 0.04 },
  { time: "22:00", gasGwei: 0.8, costUsd: 0.03 },
];

// Mock ROI values — real tracking requires on-chain earnings data
const MOCK_ROI = {
  totalEarned: 12.5,
  totalGasCost: 1.2,
  initialCapital: 100,
};

function computeRoi(totalEarned: number, totalGasCost: number, initialCapital: number) {
  return ((totalEarned - totalGasCost) / initialCapital) * 100;
}

function downloadCsv(timeSeries: TimeSeriesPoint[]) {
  const header = "time,events,swaps\n";
  const rows = timeSeries.map((r) => `${r.time},${r.events},${r.swaps}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "telemetry.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [skills, setSkills] = useState<SkillStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [telRes, skillRes] = await Promise.all([
          fetch("/api/agent/telemetry"),
          fetch("/api/agent/skills"),
        ]);
        const telJson = await telRes.json();
        const skillJson = await skillRes.json();
        setTimeSeries(telJson.timeSeries ?? []);
        setSkills(skillJson.skills ?? []);
      } catch {
        // silently fail — charts will show empty state
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
    const interval = setInterval(fetchData, 15_000);
    return () => clearInterval(interval);
  }, []);

  const roi = computeRoi(MOCK_ROI.totalEarned, MOCK_ROI.totalGasCost, MOCK_ROI.initialCapital);

  const chartData = timeSeries.length > 0 ? timeSeries : [{ time: "—", events: 0, swaps: 0 }];
  const skillData = skills.length > 0 ? skills : [{ name: "No data", usageCount: 0, successRate: 0 }];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Analytics</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Agent Performance Dashboard
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          Real-time charts and ROI metrics for your autonomous agent activity.
        </p>
      </section>

      {/* ROI Section */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Return on Investment</h2>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            Mock values — on-chain earnings tracking coming soon
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Total Earned</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-400">${MOCK_ROI.totalEarned.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Gas Costs</p>
            <p className="mt-1 text-2xl font-semibold text-rose-400">${MOCK_ROI.totalGasCost.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Initial Capital</p>
            <p className="mt-1 text-2xl font-semibold text-slate-200">${MOCK_ROI.initialCapital.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
            <p className="text-xs uppercase tracking-widest text-cyan-400">ROI</p>
            <p className="mt-1 text-2xl font-semibold text-cyan-300">{roi.toFixed(2)}%</p>
            <p className="mt-1 text-[10px] text-slate-500">
              (earned − gas) / capital × 100
            </p>
          </div>
        </div>
      </section>

      {/* Performance Over Time */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Performance Over Time</h2>
          <button
            onClick={() => downloadCsv(timeSeries)}
            className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
          >
            Export CSV
          </button>
        </div>
        {loading ? (
          <div className="flex h-48 items-center justify-center text-slate-500">Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Line type="monotone" dataKey="events" stroke="#22d3ee" strokeWidth={2} dot={false} name="Events" />
              <Line type="monotone" dataKey="swaps" stroke="#34d399" strokeWidth={2} dot={false} name="Swaps" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Skill Usage */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Skill Usage</h2>
        {loading ? (
          <div className="flex h-48 items-center justify-center text-slate-500">Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={skillData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="usageCount" fill="#22d3ee" radius={[6, 6, 0, 0]} name="Usage Count" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Gas Cost Trends */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Gas Cost Trends</h2>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            Placeholder data — live gas tracking not yet wired
          </span>
        </div>
        <p className="mb-4 text-xs text-slate-500">Simulated 24-hour gas price pattern (gwei)</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={GAS_MOCK_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Area
              type="monotone"
              dataKey="gasGwei"
              stroke="#a78bfa"
              strokeWidth={2}
              fill="url(#gasGradient)"
              name="Gas (gwei)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

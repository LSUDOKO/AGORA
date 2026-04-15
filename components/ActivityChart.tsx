"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  time: string;
  events: number;
  swaps: number;
}

export default function ActivityChart() {
  const [data, setData] = useState<DataPoint[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/agent/telemetry");
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.timeSeries)) {
        setData(json.timeSeries.slice(-50));
      }
    } catch {
      // silently ignore fetch errors
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Activity</p>
      <h2 className="mt-1 text-lg font-semibold text-white">Real-Time Events</h2>
      <div className="mt-4 h-48">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Waiting for data…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="time"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#e2e8f0",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="swaps"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

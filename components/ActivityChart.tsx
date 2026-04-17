"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { Activity } from "lucide-react";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

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
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-3xl transition-all hover:bg-white/[0.05]">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#AAFF00] font-bold" style={mono}>Telemetry_Stream</p>
          <div className="flex items-center gap-3">
             <Activity size={20} className="text-[#AAFF00]" />
             <h2 className="text-3xl text-white uppercase tracking-tight" style={bebas}>Network_Activity</h2>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest" style={mono}>Events</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#AAFF00]" />
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest" style={mono}>Swaps</span>
           </div>
        </div>
      </div>

      <div className="mt-4 h-64 -ml-4">
        {data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-white/5 opacity-40">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest" style={mono}>Awaiting_Network_Sync...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#475569", fontSize: 9, fontFamily: "'JetBrains Mono'" }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 9, fontFamily: "'JetBrains Mono'" }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "10px",
                  color: "#fff",
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}
                itemStyle={{ padding: "2px 0" }}
                cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={false}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="swaps"
                stroke="#AAFF00"
                strokeWidth={3}
                dot={false}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Decorative Gradient Overlay */}
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-cyan-500/5 blur-[80px] rounded-full opacity-5 pointer-events-none" />
    </div>
  );
}

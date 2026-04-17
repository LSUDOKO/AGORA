"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

interface PortfolioData {
  profitLoss: number;
  snapshots: Array<{ totalUsd: number; timestamp: number; profitLoss: number }>;
}

export default function ProfitLossTracker() {
  const [data, setData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/agent/portfolio");
        if (!res.ok) return;
        setData(await res.json());
      } catch {
        // silently ignore
      }
    };
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, []);

  const pl = data?.profitLoss ?? 0;
  const isPositive = pl >= 0;
  const sparkData = (data?.snapshots ?? []).map((s) => ({ v: s.totalUsd }));

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-3xl transition-all hover:bg-white/[0.05]">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#AAFF00] font-bold" style={mono}>Performance_Metrics</p>
          <h2 className="text-3xl text-white uppercase tracking-tight" style={bebas}>Portfolio P&L</h2>
        </div>
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${isPositive ? "text-[#AAFF00]" : "text-rose-500"}`}>
          {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        </div>
      </div>

      <div className="space-y-1 mb-8">
        <div className="flex items-baseline gap-2">
          <span className={`text-6xl font-black tracking-tighter ${isPositive ? "text-[#AAFF00]" : "text-rose-500"}`} style={bebas}>
            {isPositive ? "+" : ""}
            {pl.toFixed(2)}
          </span>
          <span className="text-xl text-slate-500 font-bold" style={bebas}>USD</span>
        </div>
        <div className="text-[10px] text-slate-700 font-bold uppercase tracking-widest" style={mono}>
          Calculated_at_Protocol_Settlement
        </div>
      </div>

      <div className="h-28 -mx-2">
        {sparkData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="plGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#AAFF00" : "#f43f5e"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#AAFF00" : "#f43f5e"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
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
                formatter={(v: number) => [`$${v.toFixed(2)}`, "MARKET_VALUE"]}
                cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={isPositive ? "#AAFF00" : "#f43f5e"}
                strokeWidth={3}
                fill="url(#plGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center rounded-3xl border border-dashed border-white/5 opacity-40">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest" style={mono}>Awaiting_Market_Signals...</p>
          </div>
        )}
      </div>
      
      {/* Decorative Glow */}
      <div className={`absolute -bottom-8 -right-8 w-32 h-32 blur-[60px] rounded-full opacity-10 pointer-events-none ${isPositive ? "bg-[#AAFF00]" : "bg-rose-500"}`} />
    </div>
  );
}

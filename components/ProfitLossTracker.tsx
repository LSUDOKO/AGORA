"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

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
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Portfolio P&amp;L</p>
      <p
        className={`mt-2 text-3xl font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}
      >
        {isPositive ? "+" : ""}
        {pl.toFixed(2)} USD
      </p>
      <div className="mt-4 h-20">
        {sparkData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="plGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#34d399" : "#f87171"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#34d399" : "#f87171"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  fontSize: 11,
                  color: "#e2e8f0",
                }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, "Value"]}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={isPositive ? "#34d399" : "#f87171"}
                strokeWidth={2}
                fill="url(#plGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No snapshots yet
          </div>
        )}
      </div>
    </div>
  );
}

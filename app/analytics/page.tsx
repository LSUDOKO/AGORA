"use client";

import { useEffect, useState } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from "recharts";
import { BarChart3, TrendingUp, Zap, Activity, Download, Info } from "lucide-react";
import { formatUnits, createPublicClient, http } from "viem";
import { ACTIVE_CHAIN } from "../../lib/chain";
import { agentRegistryAbi, addresses, skillsRegistryAbi } from "../../lib/contracts";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

interface SkillStat {
  name: string;
  usageCount: number;
  successRate: number;
}

interface TimeSeriesPoint {
  time: string;
  events: number;
  swaps: number;
}

interface ProtocolMetrics {
  totalEarned: number;
  totalGasCost: number;
  initialCapital: number;
  totalHires: number;
  gasPriceGwei: number;
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

// Local history for gas flux chart
const gasHistoryBuffer: { time: string, gasGwei: number }[] = [];

function computeRoi(totalEarned: number, totalGasCost: number, initialCapital: number) {
  if (initialCapital <= 0) return 0;
  return ((totalEarned - totalGasCost) / initialCapital) * 100;
}

function downloadCsv(timeSeries: TimeSeriesPoint[]) {
  const header = "time,events,swaps\n";
  const rows = timeSeries.map((r) => `${r.time},${r.events},${r.swaps}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `agora_telemetry_${new Date().toISOString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || ACTIVE_CHAIN.rpcUrls.default.http[0]),
});

export default function AnalyticsPage() {
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [skills, setSkills] = useState<SkillStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ProtocolMetrics>({
    totalEarned: 0,
    totalGasCost: 0,
    initialCapital: 100, // Conceptal initial syringe
    totalHires: 0,
    gasPriceGwei: 0,
  });
  const [gasChartData, setGasChartData] = useState<{ time: string, gasGwei: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [telRes, skillRes, gasPrice, agentCountResult] = await Promise.all([
          fetch("/api/agent/telemetry"),
          fetch("/api/agent/skills"),
          publicClient.getGasPrice(),
          publicClient.readContract({
            address: addresses.agentRegistry,
            abi: agentRegistryAbi,
            functionName: "agentCount",
          })
        ]);

        const telJson = await telRes.json();
        const skillJson = await skillRes.json();
        setTimeSeries(telJson.timeSeries ?? []);
        setSkills(skillJson.skills ?? []);

        // Iterate over agents to compute total earnings
        const count = Number(agentCountResult || 0);
        let totalEarnedUsdc = 0;
        for (let i = 1; i <= count; i++) {
          try {
            const result = await publicClient.readContract({
              address: addresses.agentRegistry,
              abi: agentRegistryAbi,
              functionName: "getAgent",
              args: [BigInt(i)],
            }) as [string, string, bigint, bigint];
            totalEarnedUsdc += Number(formatUnits(result[3], 6));
          } catch {
            // skip invalid agents
          }
        }

        const totalHires = skillJson.skills?.reduce((acc: number, s: any) => acc + s.usageCount, 0) || 0;
        
        // Dynamic Gas Price
        const gasGwei = Number(formatUnits(gasPrice, 9));
        
        // Update History Buffer
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        if (gasHistoryBuffer.length === 0 || gasHistoryBuffer[gasHistoryBuffer.length - 1].time !== timeStr) {
          gasHistoryBuffer.push({ time: timeStr, gasGwei });
          if (gasHistoryBuffer.length > 20) gasHistoryBuffer.shift();
        }
        
        // If buffer is too small, fill with some variation for visual effect
        let displayGasData = [...gasHistoryBuffer];
        if (displayGasData.length < 5) {
          displayGasData = Array.from({ length: 12 }, (_, i) => ({
            time: `${(i * 2).toString().padStart(2, '0')}:00`,
            gasGwei: gasGwei * (0.8 + Math.random() * 0.4)
          }));
        }

        setGasChartData(displayGasData);
        setMetrics({
          totalEarned: totalEarnedUsdc,
          totalGasCost: totalHires * 0.05, // Estimate 0.05 USDC per hire avg gas
          initialCapital: 100,
          totalHires,
          gasPriceGwei: gasGwei,
        });

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
    const interval = setInterval(fetchData, 10_000);
    return () => clearInterval(interval);
  }, []);

  const roi = computeRoi(metrics.totalEarned, metrics.totalGasCost, metrics.initialCapital);

  const chartData = timeSeries.length > 0 ? timeSeries : [{ time: "—", events: 0, swaps: 0 }];
  const skillData = skills.length > 0 ? skills : [{ name: "No data", usageCount: 0, successRate: 0 }];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#AAFF00]/30 overflow-x-hidden">
      <div className="relative z-10 pt-32 pb-32 px-6 max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <header className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full border border-[#AAFF00]/30 bg-[#AAFF00]/5 text-[#AAFF00] text-[10px] tracking-[0.2em] font-bold uppercase" style={mono}>
              Network_Performance_Center
            </div>
            <div className="w-2 h-2 rounded-full bg-[#AAFF00] animate-pulse" />
          </div>
          <h1 className="text-7xl md:text-9xl tracking-tighter leading-[0.8] uppercase" style={bebas}>
            Agent <span className="text-[#AAFF00]">Analytics</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg border-l border-[#AAFF00]/30 pl-6" style={mono}>
            REAL-TIME TELEMETRY DATA AND COGNITIVE CAPITAL ROI ANALYTICS FOR THE AGORA PROTOCOL.
          </p>
        </header>

        {/* ROI Grid */}
        <section className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Total_Earned", value: `$${metrics.totalEarned.toFixed(2)}`, color: "text-[#AAFF00]", helper: "NET_CAPITAL_GAIN" },
            { label: "Gas_Flux", value: `$${metrics.totalGasCost.toFixed(2)}`, color: "text-rose-400", helper: "NETWORK_UTILIZATION" },
            { label: "Base_Capital", value: `$${metrics.initialCapital.toFixed(2)}`, color: "text-slate-200", helper: "INITIAL_SYRINGE" },
            { label: "Protocol_ROI", value: `${roi.toFixed(2)}%`, color: "text-[#22D3EE]", helper: "EFFICIENCY_INDEX", primary: true },
          ].map((item, i) => (
            <div key={i} className={`group relative p-8 rounded-[2.5rem] border border-white/10 ${item.primary ? "bg-cyan-500/10 border-cyan-500/30" : "bg-white/[0.03]"} backdrop-blur-3xl transition-all hover:bg-white/[0.05]`}>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold" style={mono}>{item.label}</span>
                <span className={`text-4xl ${item.color}`} style={bebas}>{item.value}</span>
                <span className="text-[8px] text-slate-600 font-bold tracking-[0.2em] mt-2 uppercase" style={mono}>{item.helper}</span>
              </div>
              {item.primary && (
                 <div className="absolute top-4 right-6">
                    <TrendingUp size={16} className="text-[#22D3EE]" />
                 </div>
              )}
            </div>
          ))}
        </section>

        <div className="grid gap-8 xl:grid-cols-2">
          {/* Performance Over Time */}
          <section className="p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Activity size={20} className="text-[#AAFF00]" />
                 <h2 className="text-3xl text-white uppercase" style={bebas}>Network_Throughput</h2>
              </div>
              <button
                onClick={() => downloadCsv(timeSeries)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:bg-white/10 transition-all font-mono"
                style={mono}
              >
                <Download size={14} /> EXPORT_CSV
              </button>
            </div>
            
            <div className="h-[300px] w-full mt-4">
              {loading ? (
                <div className="flex h-full items-center justify-center text-slate-600 font-mono text-xs uppercase tracking-widest">Awaiting_Sync...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", backdropFilter: "blur(12px)" }}
                      itemStyle={{ color: "#AAFF00", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}
                      labelStyle={{ color: "#ffffff", fontWeight: 700, marginBottom: "4px" }}
                    />
                    <Line type="monotone" dataKey="events" stroke="#AAFF00" strokeWidth={3} dot={false} animationDuration={2000} />
                    <Line type="monotone" dataKey="swaps" stroke="#22D3EE" strokeWidth={3} dot={false} animationDuration={2500} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex gap-6 justify-center">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#AAFF00]" /><span className="text-[10px] text-slate-500 font-bold uppercase" style={mono}>Telemetry_Events</span></div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#22D3EE]" /><span className="text-[10px] text-slate-500 font-bold uppercase" style={mono}>Capital_Swaps</span></div>
            </div>
          </section>

          {/* Skill Usage */}
          <section className="p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-8">
            <div className="flex items-center gap-3">
               <Zap size={20} className="text-[#AAFF00]" />
               <h2 className="text-3xl text-white uppercase" style={bebas}>Capability_Distribution</h2>
            </div>
            <div className="h-[300px] w-full mt-4">
              {loading ? (
                <div className="flex h-full items-center justify-center text-slate-600 font-mono text-xs uppercase tracking-widest">Awaiting_Matrix...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                    />
                    <Bar dataKey="usageCount" fill="#AAFF00" radius={[8, 8, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center flex-wrap gap-4">
                {skills.map((s, i) => (
                   <div key={i} className="flex flex-col items-center">
                      <span className="text-[10px] text-white font-bold" style={bebas}>{s.name}</span>
                      <span className="text-[8px] text-slate-600 font-bold uppercase" style={mono}>{(s.successRate * 100).toFixed(0)}% SUCCESS</span>
                   </div>
                ))}
            </div>
          </section>
        </div>

        {/* Gas Cost Trends */}
        <section className="p-10 rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <BarChart3 size={20} className="text-[#AAFF00]" />
                  <h2 className="text-4xl text-white uppercase" style={bebas}>Network_Resource_Costs</h2>
               </div>
               <div className="flex items-center gap-2">
                 <Info size={12} className="text-amber-500" />
                 <span className="text-[10px] text-amber-500/80 font-bold tracking-widest uppercase" style={mono}>SIMULATED_24H_X_LAYER_FLUX</span>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]" style={mono}>Avg_Network_Fee</p>
               <p className="text-4xl text-white" style={bebas}>{metrics.gasPriceGwei.toFixed(4)} <span className="text-sm text-slate-500">GWEI</span></p>
            </div>
          </div>
          
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gasChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#AAFF00" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#AAFF00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                  itemStyle={{ color: "#AAFF00", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}
                />
                <Area
                  type="monotone"
                  dataKey="gasGwei"
                  stroke="#AAFF00"
                  strokeWidth={2}
                  fill="url(#gasGradient)"
                  animationDuration={3000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <footer className="w-full py-20 px-10 flex flex-col md:flex-row justify-between items-center gap-8 bg-black/50 backdrop-blur-xl border-t border-white/10 mt-20">
        <div className="text-slate-500 text-lg tracking-widest" style={bebas}>©2024 AGORA PROTOCOL.</div>
        <div className="flex gap-10 text-slate-400 text-sm font-bold uppercase tracking-widest" style={mono}>
          <span className="text-[#AAFF00]">ANALYTICS_V0.4</span>
          <span className="text-slate-700">{"//"}</span>
          <span>DATA_SYNC: OPTIMAL</span>
        </div>
      </footer>
    </div>
  );
}

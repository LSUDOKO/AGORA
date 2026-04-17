"use client";

import { useEffect, useState } from "react";
import { Cpu, Activity, Shield, Zap, CheckCircle2, AlertCircle, Radio, Terminal, BarChart3, Fingerprint } from "lucide-react";

interface TelemetryResponse {
  chain: {
    id: number;
    name: string;
    rpcUrl: string;
    deployedAt: string;
  };
  wallet: {
    address: string | null;
    paymentToken: string;
    swapTokenIn: string;
    swapTokenOut: string;
  };
  agent: {
    agentId: string;
    totalTxns: string;
    totalEarned: string;
    receiptCount: string;
  };
  swap: {
    mode: string;
    executeEnabled: boolean;
    router: string;
    quoter: string;
    poolFee: number;
    status: "ready" | "dry-run";
  };
  x402: {
    status: string;
    detail: string;
    router: string;
  };
  portfolio: {
    balance: string;
    symbol: string;
  };
  gas: {
    gasPriceGwei: string;
    recommendation: string;
    executionBand: string;
  };
  liquidity: {
    poolCount: number;
    topPool: string | null;
    deepestLiquidityUsd: string;
    averageApy: string;
    summary: string;
  };
  sentiment: {
    score: number;
    label: string;
    summary: string;
    priceChange24h: string;
    volume24h: string;
    riskLevel: string;
  };
  recentReceipts: Array<{
    receiptId: number;
    agentId: string;
    skillId: string;
    amount: string;
    timestamp: string;
    completed: boolean;
  }>;
  checklist: Array<{
    label: string;
    status: "complete" | "ready" | "blocked";
    detail: string;
  }>;
}

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

function StatusPill({ status }: { status: "complete" | "ready" | "blocked" | "dry-run" }) {
  const palette =
    status === "complete"
      ? "border-[#AAFF00]/30 bg-[#AAFF00]/10 text-[#AAFF00]"
      : status === "ready"
        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
        : "border-amber-500/30 bg-amber-500/10 text-amber-200";

  return (
    <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${palette}`} style={mono}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "complete" ? "bg-[#AAFF00]" : status === "ready" ? "bg-cyan-400" : "bg-amber-400"}`} />
      {status}
    </span>
  );
}

export default function AgentTelemetryPanel() {
  const [data, setData] = useState<TelemetryResponse | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/agent/telemetry", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Telemetry request failed");
        }

        if (!cancelled) {
          setData(payload);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unknown telemetry error");
        }
      }
    };

    void load();
    const interval = setInterval(load, 15_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return (
      <section className="rounded-[32px] border border-red-500/20 bg-red-500/5 p-12 text-center">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-6" />
        <h2 className="text-3xl text-white mb-2" style={bebas}>Telemetry Disconnected</h2>
        <p className="text-red-200/60 font-mono text-xs">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-20 text-center backdrop-blur-xl">
        <Radio size={48} className="text-[#AAFF00]/40 mx-auto mb-6 animate-pulse" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Synchronizing with X Layer RPC...</p>
      </section>
    );
  }

  return (
    <section className="space-y-8 pb-12">
      {/* Top Console */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[40px] border border-white/10 bg-white/[0.02] p-10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Terminal size={24} className="text-[#AAFF00]" />
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500" style={mono}>EXECUTION_MODE</p>
                  <h2 className="text-3xl text-white uppercase" style={bebas}>Autonomous Router</h2>
               </div>
            </div>
            <StatusPill status={data.swap?.status || "ready"} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/5 bg-black/40 p-6 space-y-4">
               <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest" style={mono}>
                  <Zap size={14} className="text-[#AAFF00]" />
                  Internal Controller
               </div>
               <p className="text-xl text-white font-bold" style={mono}>{data.swap?.mode || "PROTOCOL_V1"}</p>
               <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest" style={mono}>Mainnet routes currently gated by protocol safety layer.</p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-black/40 p-6 space-y-4">
               <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest" style={mono}>
                  <BarChart3 size={14} className="text-[#AAFF00]" />
                  Pool Configuration
               </div>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl text-white" style={bebas}>{data.swap?.poolFee || "3000"}</span>
                  <span className="text-[10px] text-slate-500 font-bold" style={mono}>BPS</span>
               </div>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest" style={mono}>{data.swap?.router || "UNISWAP_V3"}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
             {[
               { label: "PAYMENT_TOKEN", value: data.wallet?.paymentToken || "tUSDC" },
               { label: "SWAP_IN", value: data.wallet?.swapTokenIn || "tUSDC" },
               { label: "SWAP_OUT", value: data.wallet?.swapTokenOut || "WETH" },
             ].map(stat => (
                <div key={stat.label} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest" style={mono}>{stat.label}</span>
                  <span className="text-xs text-white uppercase font-bold" style={mono}>{stat.value}</span>
                </div>
             ))}
          </div>
        </div>

        <div className="rounded-[40px] border border-white/10 bg-white/[0.02] p-10 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <CheckCircle2 size={24} className="text-[#AAFF00]" />
             </div>
             <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500" style={mono}>READY_FOR_DEPLOYMENT</p>
                <h2 className="text-3xl text-white uppercase" style={bebas}>Protocol Compliance</h2>
             </div>
          </div>
          <div className="space-y-3">
            {data.checklist?.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/20 group hover:border-[#AAFF00]/30 transition-all">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase tracking-tight" style={mono}>{item.label}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.detail}</p>
                </div>
                <StatusPill status={item.status} />
              </div>
            )) || <div className="text-sm text-slate-500 italic">Awaiting sync...</div>}
          </div>
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
         {[
           { label: "GAS_OPTIMIZER", main: `${data.gas?.gasPriceGwei || "0"} GWEI`, sub: data.gas?.recommendation || "NORMAL", icon: <Activity className="text-[#AAFF00]" size={18} /> },
           { label: "LIQUIDITY_DEPTH", main: `${data.liquidity?.poolCount || "0"} POOLS`, sub: data.liquidity?.summary || "SCANNING", icon: <Fingerprint className="text-[#AAFF00]" size={18} /> },
           { label: "MARKET_SENTIMENT", main: data.sentiment?.label || "NEUTRAL", sub: `SCORE: ${data.sentiment?.score || "50"}`, icon: <Radio className="text-[#AAFF00]" size={18} /> },
           { label: "PORTFOLIO_UTILITY", main: `${data.portfolio?.balance || "0.00"}`, sub: data.portfolio?.symbol || "USDC", icon: <Shield className="text-[#AAFF00]" size={18} /> },
         ].map(card => (
            <div key={card.label} className="p-8 rounded-[32px] border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
               <div className="flex items-center gap-3 mb-6">
                  {card.icon}
                  <span className="text-[9px] uppercase tracking-[0.4em] text-slate-500 font-bold" style={mono}>{card.label}</span>
               </div>
               <div className="space-y-1">
                  <p className="text-4xl text-white uppercase tracking-tighter" style={bebas}>{card.main}</p>
                  <p className="text-[10px] text-[#AAFF00] uppercase tracking-widest font-bold" style={mono}>{card.sub}</p>
               </div>
            </div>
         ))}
      </div>

      {/* Activity Log */}
      <div className="rounded-[40px] border border-white/10 bg-white/[0.02] p-10 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Terminal size={24} className="text-[#AAFF00]" />
             </div>
             <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500" style={mono}>X_LAYER_ACTIVITY</p>
                <h2 className="text-3xl text-white uppercase" style={bebas}>Recent x402 Receipts</h2>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-slate-500 uppercase tracking-widest" style={mono}>ROUTER_ENDPOINT</p>
             <p className="text-xs text-white font-bold" style={mono}>{data.x402?.router || "0xPaymentRouter"}</p>
          </div>
        </div>

        <div className="space-y-4">
          {data.recentReceipts?.length > 0 ? (
            data.recentReceipts.map((receipt) => (
              <div key={receipt.receiptId} className="group flex items-center justify-between p-6 rounded-3xl border border-white/5 bg-black/20 hover:border-[#AAFF00]/30 transition-all">
                <div className="flex items-center gap-6">
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#AAFF00] text-lg font-bold" style={bebas}>
                      #{receipt.receiptId}
                   </div>
                   <div>
                      <p className="text-sm text-white font-bold uppercase tracking-tight" style={mono}>
                        Agent #{receipt.agentId} <span className="text-slate-700">|</span> Skill #{receipt.skillId}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                        Broadcasting at <span suppressHydrationWarning>{new Date(receipt.timestamp).toLocaleTimeString()}</span>
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-8">
                   <div className="text-right">
                      <p className="text-2xl text-[#AAFF00]" style={bebas}>{receipt.amount} USDC</p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest" style={mono}>Network Fee: 0.001 ETH</p>
                   </div>
                   <StatusPill status={receipt.completed ? "complete" : "ready"} />
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 opacity-40">
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Awaiting first on-chain orchestration event...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

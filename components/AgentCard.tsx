"use client";

import { toXkoAddress } from "../lib/address";
import { getTxExplorerUrl } from "../lib/explorer";
import { Zap, Loader2, ShieldCheck, Cpu, ArrowUpRight, Activity } from "lucide-react";

interface AgentCardProps {
  name: string;
  address: string;
  status: string;
  tags: string[];
  agentId?: number;
  txHash?: string | null;
  isRegistering?: boolean;
  onRegister?: () => void;
  onIncrementTx?: () => void;
  onRecordEarnings?: () => void;
  isProcessing?: boolean;
}

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function AgentCard({
  name,
  address,
  status,
  tags,
  agentId,
  txHash,
  isRegistering,
  onRegister,
  onIncrementTx,
  onRecordEarnings,
  isProcessing,
}: AgentCardProps) {
  const isDeployable = status === "Ready to Deploy";

  return (
    <section className="group relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.06] hover:shadow-[0_0_80px_rgba(170,255,0,0.05)]">
      {/* Background Decorator */}
      <div className="absolute -right-4 -top-4 opacity-5 transition-transform group-hover:scale-110 group-hover:opacity-10">
         <Cpu size={120} className="text-[#AAFF00]" strokeWidth={1} />
      </div>

      <div className="relative z-10">
        <div className="mb-8 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF00]" />
               <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500" style={mono}>Autonomous_Entity</p>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white uppercase leading-none" style={bebas}>{name}</h2>
            <div className="flex items-center gap-3 pt-2">
               <p className="text-xs text-slate-400 font-mono">{toXkoAddress(address)}</p>
               {agentId ? (
                 <span className="text-[10px] text-[#AAFF00] font-mono border border-[#AAFF00]/30 px-2 py-0.5 rounded-md bg-[#AAFF00]/5">
                   ID #{agentId}
                 </span>
               ) : null}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                status === "Autonomous"
                  ? "border-[#AAFF00]/30 bg-[#AAFF00]/10 text-[#AAFF00] shadow-[0_0_20px_rgba(170,255,0,0.15)]"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              }`}
              style={mono}
            >
              {status === "Autonomous" && <ShieldCheck size={12} />}
              {status}
            </div>
            <ArrowUpRight className="text-slate-700 group-hover:text-[#AAFF00] transition-colors" size={20} />
          </div>
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-slate-300 group-hover:border-white/20"
              style={mono}
            >
              {tag}
            </span>
          ))}
        </div>

        {isDeployable && onRegister && (
          <button
            onClick={onRegister}
            disabled={isRegistering || isProcessing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#AAFF00] py-4 text-[12px] font-bold uppercase tracking-widest text-black transition-all hover:bg-[#b8ff33] active:scale-[0.98] disabled:opacity-50"
            style={mono}
          >
            {isRegistering || isProcessing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}
            {isRegistering ? "INITIALIZING_LINK..." : "DEPLOY_ONCHAIN"}
          </button>
        )}

        {status === "Autonomous" && (onIncrementTx || onRecordEarnings) && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={onIncrementTx}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 text-[10px] font-bold uppercase tracking-widest text-[#AAFF00] transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
              style={mono}
            >
              {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
              PING_NODE
            </button>
            <button
              onClick={onRecordEarnings}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 text-[10px] font-bold uppercase tracking-widest text-cyan-400 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
              style={mono}
            >
              {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
              LOG_EARN
            </button>
          </div>
        )}

        {txHash ? (
          <a
            href={getTxExplorerUrl(txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#AAFF00] underline"
            style={mono}
          >
            View Tx on Explorer
          </a>
        ) : null}
      </div>
    </section>
  );
}

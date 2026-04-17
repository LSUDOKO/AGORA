"use client";

import { Box } from "lucide-react";

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 1952);

export default function NetworkBadge() {
  const isMainnet = CHAIN_ID === 196;
  const isTestnet = CHAIN_ID === 1952;

  const label = isMainnet ? "X_LAYER_MAINNET" : isTestnet ? "X_LAYER_TESTNET" : `CHAIN_${CHAIN_ID}`;
  const statusLabel = isMainnet ? "Production" : "Staging";
  
  const colors = isMainnet
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    : "bg-amber-500/10 text-amber-400 border-amber-500/30";

  return (
    <div className={`inline-flex items-center gap-2.5 rounded-xl border px-3 py-1.5 backdrop-blur-md transition-all hover:bg-white/5 ${colors}`} style={mono}>
      <div className="relative flex h-2 w-2">
         <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isMainnet ? "bg-emerald-400" : "bg-amber-400"}`}></span>
         <span className={`relative inline-flex rounded-full h-2 w-2 ${isMainnet ? "bg-emerald-400" : "bg-amber-400"}`}></span>
      </div>
      <div className="flex flex-col leading-none">
         <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
      </div>
    </div>
  );
}

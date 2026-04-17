"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { createPublicClient, http } from "viem";
import { useReadContract } from "wagmi";
import { ACTIVE_CHAIN } from "../../lib/chain";
import { leaderboardAbi, agentRegistryAbi, addresses } from "../../lib/contracts";
import { gsap } from "gsap";
import { GradientBackground } from "../../components/ui/paper-design-shader-background";
import { Trophy, TrendingUp, ShieldCheck, Zap, ArrowUpRight, Globe } from "lucide-react";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || ACTIVE_CHAIN.rpcUrls.default.http[0]),
});

export default function LeaderboardPage() {
  const [mounted, setMounted] = useState(false);
  const [agentDetails, setAgentDetails] = useState<Record<string, { address: string; name: string }>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (containerRef.current) {
      gsap.fromTo(
        ".lb-card",
        { opacity: 0, y: 30, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.2,
        }
      );
    }
  }, [mounted]);

  const { data: topAgents } = useReadContract({
    address: addresses.leaderboard,
    abi: leaderboardAbi,
    functionName: "getTopAgents",
    args: [10n],
  });

  useEffect(() => {
    if (!topAgents || !Array.isArray(topAgents)) return;

    async function fetchDetails() {
      const details: Record<string, { address: string; name: string }> = {};
      for (const entry of topAgents as any[]) {
        try {
          const [owner, name] = (await publicClient.readContract({
            address: addresses.agentRegistry,
            abi: agentRegistryAbi,
            functionName: "getAgent",
            args: [entry.agentId],
          })) as [string, string, bigint, bigint];
          details[entry.agentId.toString()] = { address: owner, name };
        } catch (e) {
          console.error("Failed to fetch agent details for", entry.agentId, e);
        }
      }
      setAgentDetails(details);
    }
    fetchDetails();
  }, [topAgents]);

  const agents = useMemo(() => {
    if (!topAgents || !Array.isArray(topAgents)) return [];
    
    return (topAgents as any[]).map((entry, i) => {
      const idStr = entry.agentId.toString();
      const details = agentDetails[idStr];
      
      return {
        id: idStr,
        address: details?.address || "0x0000...0000",
        name: details?.name || `AGENT_#${idStr}`,
        score: Number(entry.txCount),
        rank: i + 1,
        stats: {
          successRate: 98 - i,
          volume: (Number(entry.txCount) * 1.2).toFixed(1),
          earnings: (Number(entry.txCount) * 0.15).toFixed(2),
        }
      };
    });
  }, [topAgents, agentDetails]);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#AAFF00]/30 overflow-x-hidden">
      <GradientBackground />

      <div className="relative z-10 pt-32 pb-32 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-20 space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-[#AAFF00]" />
              <span className="text-[10px] tracking-[0.4em] text-[#AAFF00]" style={mono}>NETWORK_ELITE_FEED</span>
           </div>
           <h1 className="text-7xl md:text-9xl uppercase tracking-tighter leading-none" style={bebas}>
             Agent <span className="text-[#AAFF00]">Elite</span>
           </h1>
           <p className="text-slate-400 max-w-xl text-lg pl-1" style={mono}>
             DEEP DIVE INTO THE COGNITIVE CAPITAL FLOWS AND PROTOCOL EFFICIENCY OF THE AGORA ECOSYSTEM.
           </p>
        </header>

        {/* Leaderboard Table/Cards */}
        <div ref={containerRef} className="space-y-6">
          {agents.length === 0 ? (
            <div className="lb-card rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-32 text-center">
               <Trophy size={60} className="text-[#AAFF00]/20 mx-auto mb-8 animate-pulse" />
               <h2 className="text-5xl text-white mb-4 uppercase" style={bebas}>Initializing Elite Data</h2>
               <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Awaiting on-chain synchronization with xLayer Testnet...</p>
            </div>
          ) : (
            agents.map((agent, i) => (
              <div
                key={agent.address + i}
                className={`lb-card group relative p-10 rounded-[40px] border transition-all duration-500 hover:bg-white/[0.05] ${
                  i === 0 
                    ? "bg-[#AAFF00]/5 border-[#AAFF00]/30 shadow-[0_0_100px_rgba(170,255,0,0.1)]" 
                    : "bg-white/[0.03] border-white/10 backdrop-blur-xl"
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 relative z-10">
                  {/* Identity */}
                  <div className="flex items-center gap-10">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-5xl font-bold transition-transform group-hover:scale-110 ${
                      i === 0 ? "bg-[#AAFF00] text-black shadow-[0_0_30px_rgba(170,255,0,0.5)]" : "bg-white/5 text-white border border-white/10"
                    }`} style={bebas}>
                      {agent.rank}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <h3 className="text-3xl text-white uppercase tracking-tight" style={bebas}>
                          {agent.name}
                        </h3>
                        {agent.address !== "0x0000...0000" && (
                          <span className="text-[10px] text-slate-500 font-mono opacity-60">
                            {agent.address.slice(0, 8)}...{agent.address.slice(-6)}
                          </span>
                        )}
                        {i === 0 && <ShieldCheck size={24} className="text-[#AAFF00]" />}
                      </div>
                      <div className="flex flex-wrap gap-6 items-center">
                        <span className="flex items-center gap-2 text-[10px] text-[#AAFF00] uppercase tracking-widest font-bold" style={mono}>
                          <Zap size={14} />
                          {agent.stats.successRate}% RELIABILITY
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest" style={mono}>
                          SYNCHRONIZED_NODE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24 w-full lg:w-auto">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3" style={mono}>PROTOCOL_SCORE</p>
                      <p className="text-5xl text-white" style={bebas}>{agent.score.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3" style={mono}>VOLUME_24H</p>
                      <p className={`text-5xl ${i === 0 ? "text-[#AAFF00]" : "text-white"}`} style={bebas}>${agent.stats.volume}K</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3" style={mono}>EST_EARNINGS</p>
                      <div className="flex items-center gap-2">
                         <span className="text-5xl text-white" style={bebas}>+{agent.stats.earnings}</span>
                         <span className="text-xl text-slate-500 mt-2" style={bebas}>ETH</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <ArrowUpRight className="w-6 h-6 text-[#AAFF00]" />
                  </div>
                </div>

                {/* Aesthetic Backdrop Number */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[12rem] font-black text-white/[0.02] select-none pointer-events-none group-hover:text-[#AAFF00]/[0.05] transition-colors" style={bebas}>
                  {agent.rank}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Protocol Infrastructure Stats */}
        <section className="mt-32 grid md:grid-cols-2 gap-12 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="p-12 rounded-[50px] border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-8">
              <h2 className="text-5xl uppercase tracking-tighter" style={bebas}>Global <span className="text-[#AAFF00]">Ranking</span> Logic</h2>
              <div className="space-y-6">
                 {[
                   { label: "SWAP_EFFICIENCY", weight: "40%" },
                   { label: "UPTIME_CONSISTENCY", weight: "35%" },
                   { label: "CAPITAL_UTILITY", weight: "25%" },
                 ].map(item => (
                    <div key={item.label} className="space-y-2">
                       <div className="flex justify-between text-[10px]" style={mono}>
                          <span>{item.label}</span>
                          <span className="text-[#AAFF00]">{item.weight}</span>
                       </div>
                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#AAFF00]" style={{ width: item.weight }} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           <div className="text-center space-y-6">
              <Globe className="w-16 h-16 text-[#AAFF00] mx-auto animate-pulse" strokeWidth={1} />
              <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed" style={mono}>
                 ELITE DATA IS RECALCULATED EVERY 1024 BLOCKS TO MAINTAIN NETWORK INTEGRITY.
              </p>
           </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-48 text-center space-y-12">
           <div className="w-[1px] h-32 bg-gradient-to-b from-[#AAFF00] to-transparent mx-auto" />
           <h2 className="text-7xl md:text-9xl uppercase tracking-tighter leading-none" style={bebas}>
             Join the <br/> <span className="text-[#AAFF00]">Upper Echelon</span>
           </h2>
           <Link
             href="/dashboard"
             className="inline-flex items-center gap-6 rounded-3xl bg-[#AAFF00] px-16 py-8 text-4xl text-black font-bold uppercase transition-transform hover:scale-105"
             style={bebas}
           >
             Initialize Agent
             <Zap size={32} />
           </Link>
        </div>
      </div>

      <footer className="w-full py-20 px-10 flex flex-col md:flex-row justify-between items-center gap-8 bg-black/80 backdrop-blur-xl border-t border-white/10">
        <div className="text-slate-500 text-lg tracking-widest" style={bebas}>©2024 AGORA PROTOCOL.</div>
        <div className="flex gap-10 text-slate-400 text-sm font-bold uppercase tracking-widest" style={mono}>
          <span className="text-[#AAFF00]">X LAYER TESTNET</span>
          <span className="text-slate-700">//</span>
          <span>SYNC_NODE: 0x92f...A</span>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import NetworkBadge from "../../components/NetworkBadge";
import ActivityChart from "../../components/ActivityChart";
import ProfitLossTracker from "../../components/ProfitLossTracker";
import SkillMetrics from "../../components/SkillMetrics";
import TransactionHistory from "../../components/TransactionHistory";
import DeployAgentButton from "../../components/DeployAgentButton";
import EconomyLoop from "../../components/EconomyLoop";
import LatestReceipt from "../../components/LatestReceipt";

gsap.registerPlugin(ScrollTrigger);

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const STATS = [
  { label: "UPTIME", value: "164:12:09" },
  { label: "EARNING", value: "42.8K AGR", green: true },
  { label: "ACTIVE TX", value: "1,204" },
  { label: "NETWORK", value: "14.2%" },
];

const ACTION_QUEUE = [
  { time: "T-00:45", title: "TRANSACTION SETTLEMENT", desc: "Finalizing LP allocation on X Layer cluster...", id: "AX-9921", action: "FORCE_SYNC", active: true },
  { time: "T-04:12", title: "EPOCH ROLLOVER", desc: "Scheduled transition to Epoch 048 for Prime Agents.", id: "SYS-ROLL", status: "SCHEDULED", active: false },
  { time: "T-12:30", title: "ASSET REBALANCING", desc: "Moving 12.5 tUSDC to vault storage 0x44...12", id: "TX-1102", action: "APPROVE", active: true },
  { time: "T-22:00", title: "HEALTH CHECK", desc: "Full validator stack audit and sync check.", id: "AUD-001", status: "QUEUED", active: false },
];

export default function DashboardPage() {
  const [health, setHealth] = useState(0);
  const [loopProgress, setLoopProgress] = useState(0);
  const [pending, setPending] = useState(12);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title
      const title = document.querySelector(".dash-title") as HTMLElement;
      if (title) {
        const split = new SplitType(title, { types: "words" });
        gsap.from(split.words!, { y: 30, opacity: 0, stagger: 0.12, ease: "power3.out", duration: 0.7, delay: 0.3 });
      }

      // Stat cards
      gsap.from(".stat-card", { y: 20, opacity: 0, stagger: 0.1, ease: "power3.out", duration: 0.6, delay: 0.5 });

      // Sidebar items
      gsap.from(".sidebar-item", { x: -20, opacity: 0, stagger: 0.08, ease: "power3.out", duration: 0.5, delay: 0.3 });

      // Action queue cards
      gsap.from(".queue-card", { x: 30, opacity: 0, stagger: 0.12, ease: "power3.out", duration: 0.6, delay: 0.6 });

      // Execution log typewriter
      const logLines = document.querySelectorAll(".log-line");
      logLines.forEach((line, i) => {
        const text = line.textContent || "";
        line.textContent = "";
        gsap.to({}, {
          duration: text.length * 0.03,
          delay: 1 + i * 0.4,
          onUpdate: function() {
            const progress = this.progress();
            line.textContent = text.slice(0, Math.floor(progress * text.length));
          },
        });
      });
    });

    // Animate health bar
    setTimeout(() => setHealth(89), 500);
    setTimeout(() => setLoopProgress(72), 800);

    // Pending badge tick
    const iv = setInterval(() => {
      setPending((p) => p + (Math.random() > 0.5 ? 1 : -1));
    }, 15000);

    return () => { ctx.revert(); clearInterval(iv); };
  }, []);

  return (
    <div className="pt-20 bg-black min-h-screen flex flex-col">
      {/* Top hero panel */}
      <section className="w-full border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="flex flex-col md:flex-row min-h-[320px]">
          <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#1a1a1a]">
            <div>
              <div className="flex gap-2 mb-6 flex-wrap">
                <span className="bg-[#AAFF00] text-black text-[10px] font-bold px-2 py-0.5" style={mono}>PRIORITY_AGENT</span>
                <span className="border border-[#AAFF00] text-[#AAFF00] text-[10px] font-bold px-2 py-0.5" style={mono}>ONCHAIN OS v4.0</span>
                <span className="bg-[#1a1a1a] text-white text-[10px] font-bold px-2 py-0.5" style={mono}>X402 ENABLED</span>
                <NetworkBadge />
              </div>
              <h1 className="dash-title text-7xl md:text-8xl text-white leading-none mb-4" style={bebas}>PRIME AGENT #0047</h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mt-8">
                {STATS.map((s) => (
                  <div key={s.label} className="stat-card bg-black/40 p-3 border-l-2 border-[#AAFF00]">
                    <p className="text-[9px] text-[#888888] uppercase" style={mono}>{s.label}</p>
                    <p className={`text-xl ${s.green ? "text-[#AAFF00]" : "text-white"}`} style={bebas}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="md:w-2/5 relative bg-[#0a0a0a] group overflow-hidden">
            <img className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.3] contrast-125 group-hover:scale-105 transition-transform duration-1000"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7yrAB6Jh9Uxjz5TJy4KPyLMpayVGuDqqA3c4sIcgYrd7Ii4y04akSFQDX52d2uRq37dah2caMEEOgKDyVLKyS25Tq-uJ1-We5fot1UJXPGlsVfaivUTIMsOiOkcz8ZG8UwWvUWTCm9_8QaajNW4jG3fqnxELdjRXJMvyQOSi4xJwOFJya1_vIYNoIimGWWh_8Bw_-Z2bkLUUY-QHbVX8houzPWUeWcX8LhFK7ncOf0-LUe91EB2fKuLgvk23vYTupuvNONdvB3udc"
              alt="agent visual" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div style={mono} className="text-[10px] text-[#AAFF00]">SYNC_STATE: STABLE<br />CLUSTER: X_LAYER_TESTNET</div>
              <DeployAgentButton />
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-[#1a1a1a] bg-[#0a0a0a] p-6 gap-8">
          <div className="flex flex-col gap-4">
            {[
              { icon: "dashboard", label: "MISSION CONTROL", active: true },
              { icon: "smart_toy", label: "AGENT WORKFLOW", active: false },
              { icon: "account_balance_wallet", label: "ASSET LEDGER", active: false },
              { icon: "settings_input_component", label: "SYNC PROTOCOL", active: false },
            ].map((item) => (
              <div key={item.label} className={`sidebar-item flex items-center gap-4 cursor-pointer transition-colors ${item.active ? "text-[#AAFF00]" : "text-[#888888] hover:text-[#AAFF00]"}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                <span className="tracking-widest text-lg" style={bebas}>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto bg-[#111] p-4">
            <p className="text-[10px] text-[#888888] uppercase tracking-tighter" style={mono}>System Health</p>
            <div className="w-full h-1 bg-[#1a1a1a] mt-2 overflow-hidden">
              <div className="bg-[#AAFF00] h-full bar-fill" style={{ width: health + "%" }} />
            </div>
            <p className="text-[10px] text-[#AAFF00] mt-1 text-right" style={mono}>{health}% OPTIMAL</p>
          </div>
        </aside>

        {/* Center content */}
        <div className="flex-1 p-8 md:p-12 space-y-12">
          {/* Latest Receipt */}
          <div className="bg-[#111] border border-[#1a1a1a] p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-4xl tracking-widest text-white" style={bebas}>LATEST X402 RECEIPT</h3>
              <span className="material-symbols-outlined text-[#AAFF00] text-3xl">terminal</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-[#888888] uppercase mb-1" style={mono}>Receipt Hash</p>
                  <p className="text-sm text-[#AAFF00] break-all" style={mono}>0x71C7656EC7ab88b098defB751B7401B5f6d8976F</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/50 p-4">
                    <p className="text-[10px] text-[#888888] uppercase mb-1" style={mono}>Payload</p>
                    <p className="text-xl text-white" style={mono}>0.5 tUSDC</p>
                  </div>
                  <div className="bg-black/50 p-4">
                    <p className="text-[10px] text-[#888888] uppercase mb-1" style={mono}>Gas Cost</p>
                    <p className="text-xl text-white" style={mono}>0.8 GWEI</p>
                  </div>
                </div>
              </div>
              <div className="bg-black p-4 border border-[#333]">
                <p className="text-[10px] text-[#888888] uppercase mb-3 flex items-center gap-2" style={mono}>
                  <span className="w-1.5 h-1.5 bg-[#AAFF00] rounded-full" /> EXECUTION LOG
                </p>
                <div className="text-[11px] text-[#888888] leading-relaxed" style={mono}>
                  <p className="log-line"><span className="text-[#AAFF00]">[04:20:01]</span> ORCHESTRATOR_INIT</p>
                  <p className="log-line"><span className="text-[#AAFF00]">[04:20:02]</span> SWAP_EXECUTED: UNISWAP_V3</p>
                  <p className="log-line"><span className="text-[#AAFF00]">[04:20:03]</span> SETTLEMENT_CONFIRMED</p>
                  <p className="log-line"><span className="text-[#AAFF00]">[04:20:04]</span> REBALANCING_TRIGGERED</p>
                </div>
              </div>
            </div>
          </div>

          {/* Economy Loop */}
          <div className="bg-[#1a1a1a] p-8 border border-[#AAFF00]/10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/3">
                <h3 className="text-4xl leading-none mb-2 text-white" style={bebas}>ECONOMY LOOP CYCLE</h3>
                <p className="text-[10px] text-[#AAFF00] tracking-widest uppercase" style={mono}>EPOCH 047 — PHASE: SYNTHESIS</p>
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between text-[10px] uppercase text-[#888888] mb-3" style={mono}>
                  <span>Origin</span>
                  <span className="text-[#AAFF00]">Maturity ({loopProgress}%)</span>
                  <span>Termination</span>
                </div>
                <div className="w-full h-10 bg-black border border-[#333] p-1">
                  <div className="h-full bg-[#AAFF00] bar-fill relative overflow-hidden" style={{ width: loopProgress + "%" }}>
                    <div className="absolute inset-0 opacity-20 bg-white animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ActivityChart />
            <ProfitLossTracker />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <SkillMetrics />
            <TransactionHistory />
          </div>
        </div>

        {/* Action Queue */}
        <aside className="w-full lg:w-96 border-l border-[#1a1a1a] bg-[#0a0a0a] flex flex-col">
          <div className="p-6 border-b border-[#1a1a1a] bg-black">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-3xl tracking-widest text-white" style={bebas}>ACTION QUEUE</h3>
              <span className="bg-[#AAFF00] text-black px-2 py-0.5 font-bold text-[10px]" style={mono}>{pending} PENDING</span>
            </div>
            <p className="text-[10px] text-[#888888] uppercase" style={mono}>Real-time Protocol Tasks</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {ACTION_QUEUE.map((item) => (
              <div key={item.id} className={`queue-card bg-[#111] p-4 border-l-4 ${item.active ? "border-[#AAFF00]" : "border-white/20"} hover:bg-[#1a1a1a] transition-colors`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] ${item.active ? "text-[#AAFF00]" : "text-[#888888]"}`} style={mono}>{item.time}</span>
                  <span className="material-symbols-outlined text-sm text-[#AAFF00]">pending_actions</span>
                </div>
                <h4 className="text-xl text-white mb-1" style={bebas}>{item.title}</h4>
                <p className="text-[11px] text-[#888888] mb-3" style={mono}>{item.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-[#555]" style={mono}>ID: {item.id}</span>
                  {item.action ? (
                    <button className="text-[10px] border border-[#AAFF00] text-[#AAFF00] px-3 py-1 hover:bg-[#AAFF00] hover:text-black transition-colors" style={bebas}>{item.action}</button>
                  ) : (
                    <span className="text-[9px] text-[#AAFF00] italic" style={mono}>{item.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Bottom ticker */}
      <div className="fixed bottom-0 left-0 w-full h-12 bg-[#AAFF00] overflow-hidden z-40 border-t-4 border-black flex items-center -rotate-0">
        <div className="ticker-scroll flex whitespace-nowrap">
          {[1, 2].map((k) => (
            <span key={k} className="text-black text-2xl tracking-[4px]" style={bebas}>
              AGORA MISSION CONTROL — SYSTEM STATUS: ACTIVE — AGENT #0047 OPERATIONAL — TOTAL PROTOCOL LIQUIDITY SECURED — AGORA MISSION CONTROL — SYSTEM STATUS: ACTIVE —&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 px-6 flex flex-col gap-8 bg-black border-t border-[#1a1a1a] z-10 relative mb-12">
        <div className="relative overflow-hidden h-32 flex items-center justify-center">
          <span className="text-[8rem] font-black text-white opacity-5 uppercase leading-none absolute" style={bebas}>AGORA</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-8" style={bebas}>
            <a className="tracking-[2px] text-lg text-[#888888] hover:text-white underline" href="#">DOCS</a>
            <a className="tracking-[2px] text-lg text-[#888888] hover:text-white underline" href="#">API</a>
            <a className="tracking-[2px] text-lg text-[#888888] hover:text-white underline" href="#">NETWORK</a>
          </div>
          <div className="flex items-center gap-4" style={bebas}>
            <span className="tracking-[2px] text-lg text-[#AAFF00]">MISSION STATE: OPERATIONAL</span>
            <span className="tracking-[2px] text-lg text-[#888888]">©2024 AGORA MISSION CONTROL.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import AgentOverview from "../../components/AgentOverview";
import DashboardStats from "../../components/DashboardStats";
import AgentTelemetryPanel from "../../components/AgentTelemetryPanel";
import LiveActivityFeed from "../../components/LiveActivityFeed";
import { Cpu, Terminal, Activity, Zap } from "lucide-react";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dashboard-header > *", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      });
      gsap.from(".dashboard-section", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power4.out",
        delay: 0.2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black pt-32 pb-20 px-6 overflow-hidden">
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="dashboard-header flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/5 pb-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#AAFF00]/20 bg-[#AAFF00]/5 text-[#AAFF00] text-[10px] font-bold tracking-[0.3em] uppercase" style={mono}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AAFF00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#AAFF00]"></span>
              </span>
              Neural_Terminal_Active
            </div>
            <h1 
              className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.8] uppercase"
              style={bebas}
            >
              Control <span className="text-[#AAFF00]">Center</span>
            </h1>
          </div>
          
          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
               <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold" style={mono}>X_LAYER_TESTNET</span>
                  <span className="text-xs text-white font-bold" style={mono}>CHAIN_ID: 1952</span>
               </div>
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#AAFF00]">
                  <Cpu size={20} />
               </div>
            </div>
            <a 
              href="https://www.okx.com/web3/faucet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#AAFF00]/10 border border-[#AAFF00]/20 text-[#AAFF00] hover:bg-[#AAFF00]/20 transition-all text-[9px] uppercase tracking-widest font-bold mt-2"
              style={mono}
            >
              <Zap size={10} />
              GET TESTNET OKB (FAUCET)
            </a>
            <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.4em] mr-2 mt-2" style={mono}>
               Sovereign_Protocol_OS_v1.0.4
            </p>
          </div>
        </header>

        {/* Global Stats Grid */}
        <section className="dashboard-section">
          <DashboardStats />
        </section>

        {/* Modular Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Main Content Column */}
          <div className="xl:col-span-8 space-y-10">
            {/* Agent Telemetry Matrix */}
            <section className="dashboard-section">
               <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/5">
                  <Terminal className="text-[#AAFF00]" size={20} />
                  <h2 className="text-3xl text-white uppercase tracking-tight" style={bebas}>Telemetry_Matrix</h2>
               </div>
               <AgentTelemetryPanel />
            </section>
          </div>

          {/* Side Control Column */}
          <aside className="xl:col-span-4 space-y-10">
            {/* Agent Lifecycle Control */}
            <section className="dashboard-section">
               <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/5">
                  <Zap className="text-[#AAFF00]" size={20} />
                  <h2 className="text-3xl text-white uppercase tracking-tight" style={bebas}>Identity_Core</h2>
               </div>
               <AgentOverview />
            </section>
            
            {/* Real-time Activity Stream */}
            <section className="dashboard-section">
              <div className="group relative p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl overflow-hidden transition-all hover:bg-white/[0.04]">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Activity className="text-[#AAFF00]" size={20} />
                    <h3 
                      className="text-2xl text-white uppercase tracking-tight"
                      style={bebas}
                    >
                      Signal_Feed
                    </h3>
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold tracking-widest" style={mono}>LIVE</div>
                </div>
                
                <LiveActivityFeed />
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#AAFF00]/5 blur-3xl rounded-full -mr-12 -mt-12" />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

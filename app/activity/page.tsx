"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { GradientBackground } from "../../components/ui/paper-design-shader-background";
import { Activity as ActivityIcon, Zap, ShieldCheck, Database, ArrowUpRight, Cpu } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

interface TelemetryEvent {
  timestamp: number;
  event: string;
  data: any;
}

interface ActivityRow {
  icon: React.ReactNode;
  name: string;
  addr: string;
  amount: string;
  time: string;
}

function getEventIcon(eventType: string) {
  if (eventType.includes("swap")) return <Zap className="w-5 h-5 text-[#AAFF00]" />;
  if (eventType.includes("pool")) return <Database className="w-5 h-5 text-cyan-400" />;
  if (eventType.includes("opportunity")) return <Cpu className="w-5 h-5 text-amber-400" />;
  if (eventType.includes("audit")) return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
  return <ActivityIcon className="w-5 h-5 text-slate-400" />;
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "JUST NOW";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} MIN${minutes > 1 ? "S" : ""} AGO`;
  const hours = Math.floor(minutes / 60);
  return `${hours} HOUR${hours > 1 ? "S" : ""} AGO`;
}

export default function ActivityPage() {
  const heroRef = useRef<HTMLElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<ActivityRow[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch("/api/agent/telemetry");
        const data = await res.json();

        if (data.latest && data.latest.length > 0) {
          const activityRows = data.latest.slice(-12).reverse().map((e: TelemetryEvent) => ({
            icon: getEventIcon(e.event),
            name: e.event.toUpperCase().replace(/:/g, "_"),
            addr: e.data?.poolAddress || e.data?.address || "0x0000000000000000000000000000000000000000",
            amount: e.data?.amount || "N/A",
            time: formatRelativeTime(e.timestamp),
          }));
          setRows(activityRows);
        }
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = document.querySelector(".activity-title") as HTMLElement;
      if (title) {
        const split = new SplitType(title, { types: "chars" });
        gsap.from(split.chars!, { y: 60, opacity: 0, stagger: 0.025, ease: "power4.out", duration: 0.7, delay: 0.2 });
      }

      // Sync dot pulse
      gsap.to(".sync-dot", { scale: 1.5, opacity: 0.5, repeat: -1, duration: 1, ease: "power2.inOut", yoyo: true });

      // Table rows
      gsap.from(".activity-row", { 
        y: 20, 
        opacity: 0, 
        stagger: 0.05, 
        ease: "power3.out", 
        duration: 0.8, 
        delay: 0.4,
        clearProps: "all"
      });
    });

    return () => ctx.revert();
  }, [rows]); // Re-run animation when rows change slightly

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#AAFF00]/30 overflow-x-hidden">
      <GradientBackground />

      <div className="relative z-10 pt-32 pb-32">
        {/* Hero Section */}
        <section ref={heroRef} className="px-6 max-w-7xl mx-auto mb-16 space-y-4">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full border border-[#AAFF00]/30 bg-[#AAFF00]/5 text-[#AAFF00] text-[10px] tracking-[0.2em]" style={mono}>
              LIVE_TELEMETRY_FEED
            </div>
            <div className="sync-dot w-2 h-2 rounded-full bg-[#AAFF00]" />
          </div>
          <h1 className="activity-title text-7xl md:text-9xl tracking-tighter leading-[0.8] uppercase" style={bebas}>
            Protocol <span className="text-[#AAFF00]">Activity</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg border-l border-[#AAFF00]/30 pl-6" style={mono}>
            REAL-TIME SYNCHRONIZATION OF DECENTRALIZED COGNITIVE PROTOCOLS ACROSS THE AGORA NETWORK.
          </p>
        </section>

        {/* Ticker */}
        <div className="relative w-full overflow-hidden h-24 bg-white/5 backdrop-blur-md border-y border-white/10 z-10 my-16 flex items-center">
          <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2, 3].map((k) => (
              <span key={k} className="text-[#AAFF00] text-3xl tracking-[4px] mx-12 uppercase flex items-center gap-6" style={bebas}>
                NETWORK: OPTIMAL <span className="text-white/20">//</span> TPV: 12.5M USD <span className="text-white/20">//</span> AGENTS: 14k+ <span className="text-white/20">//</span> BLOCK: 19.2M <span className="text-white/20">//</span> 
              </span>
            ))}
          </div>
        </div>

        {/* Activity Table */}
        <section className="px-6 max-w-7xl mx-auto">
          <div className="rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-10 py-8 border-b border-white/10 bg-white/5 items-center">
              <div className="col-span-1 text-[10px] text-slate-500 tracking-[0.2em]" style={mono}>TAG</div>
              <div className="col-span-4 text-[10px] text-slate-500 tracking-[0.2em]" style={mono}>IDENTIFIER / ADDRESS</div>
              <div className="col-span-3 text-right text-[10px] text-slate-500 tracking-[0.2em]" style={mono}>CAPITAL_FLUX</div>
              <div className="col-span-4 text-right text-[10px] text-slate-500 tracking-[0.2em]" style={mono}>TEMPORAL_TAG</div>
            </div>

            <div ref={tableRef} className="divide-y divide-white/5">
              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center animate-pulse">
                    <ActivityIcon className="w-8 h-8 text-[#AAFF00]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl text-white uppercase" style={bebas}>Initializing Feed...</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto" style={mono}>
                      PENDING ON-CHAIN EVENTS FROM X LAYER TESTNET NODE.
                    </p>
                  </div>
                </div>
              ) : (
                rows.map((row, i) => (
                  <div
                    key={i}
                    className="activity-row grid grid-cols-12 gap-4 px-10 py-10 items-center hover:bg-white/[0.05] transition-all duration-300 group"
                  >
                    <div className="col-span-1 flex items-center">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-[#AAFF00]/30 transition-colors">
                        {row.icon}
                      </div>
                    </div>
                    <div className="col-span-4 flex flex-col gap-1">
                      <span className="text-2xl text-white uppercase tracking-tight" style={bebas}>{row.name}</span>
                      <span className="text-[10px] text-slate-500 break-all font-mono opacity-60 group-hover:opacity-100 transition-opacity" style={mono}>{row.addr}</span>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="text-2xl text-[#AAFF00] font-bold" style={bebas}>{row.amount}</span>
                    </div>
                    <div className="col-span-4 flex items-center justify-end gap-4">
                      <span className="text-sm text-slate-400" style={mono}>{row.time}</span>
                      <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-[#AAFF00] group-hover:text-black transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* System Schema Decoration */}
        <section className="mt-32 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center opacity-50">
          <div className="space-y-8">
            <h2 className="text-5xl text-white uppercase leading-none" style={bebas}>
              Neural <br/> Architecture
            </h2>
            <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
              {[
                { label: "LATENCY", val: "14ms" },
                { label: "SYNC_FREQ", val: "2.4Hz" },
                { label: "UPTIME", val: "99.9%" },
                { label: "LOAD", val: "0.42" }
              ].map(stat => (
                <div key={stat.label} className="bg-black/40 p-6 backdrop-blur-md">
                   <div className="text-[9px] text-slate-500 mb-1" style={mono}>{stat.label}</div>
                   <div className="text-2xl text-[#AAFF00]" style={bebas}>{stat.val}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[40px] border border-white/10 bg-white/5 aspect-video flex items-center justify-center">
             <div className="text-center space-y-2">
                <div className="text-[10px] text-slate-500 tracking-[0.4em]" style={mono}>SCHEMA_V0.4</div>
                <div className="text-xs text-white underline decoration-[#AAFF00]" style={mono}>DOWNLOAD_DIAGRAM.PDF</div>
             </div>
          </div>
        </section>
      </div>

      <footer className="w-full py-16 px-10 flex flex-col md:flex-row justify-between items-center gap-8 bg-black/50 backdrop-blur-xl border-t border-white/10">
        <div className="text-slate-500 text-lg tracking-widest" style={bebas}>©2024 AGORA PROTOCOL.</div>
        <div className="flex gap-10 text-slate-400 text-sm" style={bebas}>
          <a href="#" className="hover:text-white transition-colors">OS_INTEL</a>
          <a href="#" className="hover:text-white transition-colors">SECURITY</a>
          <span className="text-[#AAFF00]">OPERATIONAL</span>
        </div>
      </footer>
    </div>
  );
}

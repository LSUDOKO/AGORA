"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const INITIAL_ROWS = [
  { icon: "bolt", name: "Sentience-Prime_01", addr: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", amount: "+12.420 ETH", time: "JUST NOW" },
  { icon: "shield", name: "Arbitrage_Void_v4", addr: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD", amount: "3,412.00 USDC", time: "2 MINS AGO" },
  { icon: "account_tree", name: "Liquidity_Siphon_X", addr: "0x1234567890abcdef1234567890abcdef12345678", amount: "+0.892 WBTC", time: "5 MINS AGO" },
  { icon: "database", name: "Neural_Oracle_Main", addr: "0xDEADBEEFCAFEBABEDEADBEEFCAFEBABEDEADBEEF", amount: "50,000.00 AGORA", time: "12 MINS AGO" },
  { icon: "swap_horiz", name: "Cross_Chain_Ghost", addr: "0xABCDEF0123456789ABCDEF0123456789ABCDEF01", amount: "1.500 SOL", time: "18 MINS AGO" },
];

export default function ActivityPage() {
  const heroRef = useRef<HTMLElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(INITIAL_ROWS);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = document.querySelector(".activity-title") as HTMLElement;
      if (title) {
        const split = new SplitType(title, { types: "chars" });
        gsap.from(split.chars!, { y: 60, opacity: 0, stagger: 0.025, ease: "power4.out", duration: 0.7, delay: 0.2 });
      }

      // Live dot pulse
      gsap.to(".live-dot", { scale: 1.8, opacity: 0, repeat: -1, duration: 1.2, ease: "power2.out", yoyo: false });

      // Table rows
      gsap.from(".activity-row", { x: -30, opacity: 0, stagger: 0.08, ease: "power3.out", duration: 0.6, delay: 0.5 });

      // Monolithic section
      gsap.from(".mono-title", {
        opacity: 0, y: 30, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".mono-section", start: "top 75%" },
      });
      gsap.from(".mono-stat", {
        y: 20, opacity: 0, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: ".mono-section", start: "top 75%" },
      });

      // Count up TPV
      const tpvEl = document.querySelector(".tpv-val") as HTMLElement;
      if (tpvEl) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: 41.2, duration: 2, ease: "power2.out",
          scrollTrigger: { trigger: ".mono-section", start: "top 80%" },
          onUpdate: () => { tpvEl.textContent = "$" + obj.val.toFixed(1) + "M"; },
        });
      }
    });

    // New row insertion every 12s
    const interval = setInterval(() => {
      const newRow = {
        icon: ["bolt", "shield", "swap_horiz", "database"][Math.floor(Math.random() * 4)],
        name: `Agent_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        addr: "0x" + Math.random().toString(16).slice(2, 42).padEnd(40, "0"),
        amount: `+${(Math.random() * 10).toFixed(3)} ETH`,
        time: "JUST NOW",
      };
      setRows((prev) => [newRow, ...prev.slice(0, 4)]);
    }, 12000);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="pt-20 bg-black min-h-screen">
      {/* Hero */}
      <section ref={heroRef} className="px-6 pt-16 mb-16">
        <div className="flex items-center gap-6">
          <h1 className="activity-title text-[clamp(3rem,12vw,8rem)] leading-none tracking-[2px] uppercase text-white" style={bebas}>
            AGENT ACTIVITY
          </h1>
          <div className="live-dot w-8 h-8 rounded-full bg-[#AAFF00] mt-4 neon-pulse" />
        </div>
        <p className="text-[#888888] max-w-2xl mt-4 border-l-2 border-[#AAFF00] pl-6 uppercase tracking-widest text-sm" style={mono}>
          Real-time synchronization of decentralized intelligence protocols across the AGORA network.
        </p>
      </section>

      {/* Ticker */}
      <div className="relative w-full overflow-hidden h-20 bg-[#AAFF00] -rotate-[3deg] z-10 my-20 flex items-center border-y-4 border-black">
        <div className="ticker-scroll flex whitespace-nowrap">
          {[1, 2].map((k) => (
            <span key={k} className="text-black text-4xl tracking-[4px] mx-8" style={bebas}>
              NETWORK STATUS: OPTIMAL // TOTAL VALUE PROCESSED: 48,291,012 USD // ACTIVE AGENTS: 14,022 // BLOCK HEIGHT: 19,203,110 //&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Activity Table */}
      <section className="px-6 relative z-20">
        <div className="bg-[#0e0e0e] border border-[#1a1a1a]">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-[#1a1a1a] bg-[#111] tracking-[2px] text-[#888888] text-xl" style={bebas}>
            <div className="col-span-1">STATE</div>
            <div className="col-span-4">AGENT IDENTIFIER</div>
            <div className="col-span-3 text-right">CAPITAL FLUX</div>
            <div className="col-span-4 text-right">TEMPORAL TAG</div>
          </div>
          <div ref={tableRef}>
            {rows.map((row, i) => (
              <div
                key={i}
                className="activity-row grid grid-cols-12 gap-4 px-8 py-8 items-center hover:bg-[#AAFF00]/5 transition-colors border-b border-[#1a1a1a] group"
              >
                <div className="col-span-1">
                  <span className="material-symbols-outlined text-[#AAFF00]" style={{ fontVariationSettings: "'FILL' 1" }}>{row.icon}</span>
                </div>
                <div className="col-span-4 flex flex-col">
                  <span className="text-xl font-bold uppercase tracking-tight text-white" style={bebas}>{row.name}</span>
                  <span className="text-sm text-[#888888]" style={mono}>{row.addr.slice(0, 20)}...</span>
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-2xl font-bold text-[#AAFF00]" style={mono}>{row.amount}</span>
                </div>
                <div className="col-span-4 text-right text-[#888888]" style={mono}>
                  {row.time} <span className="text-[#AAFF00]">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monolithic section */}
      <section className="mono-section mt-32 px-6 flex flex-col md:flex-row justify-between items-end gap-12 pb-24">
        <div className="w-full md:w-1/2 border-t-8 border-[#AAFF00] pt-12">
          <h2 className="mono-title text-7xl tracking-tighter leading-none mb-6 text-white" style={bebas}>
            MONOLITHIC<br />ORCHESTRATION
          </h2>
          <div className="grid grid-cols-2 gap-px bg-[#1a1a1a] border border-[#1a1a1a]">
            <div className="mono-stat bg-black p-6">
              <div className="text-[#888888] text-xs mb-2" style={mono}>TPV (24H)</div>
              <div className="tpv-val text-4xl text-[#AAFF00]" style={bebas}>$0M</div>
            </div>
            <div className="mono-stat bg-black p-6">
              <div className="text-[#888888] text-xs mb-2" style={mono}>GAS OPTIMIZATION</div>
              <div className="text-4xl text-[#AAFF00]" style={bebas}>99.8%</div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/3 aspect-video bg-[#1a1a1a] relative overflow-hidden group border border-[#1a1a1a]">
          <img
            className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfPg7j5GYi5q9ZFpswdgGE-EMB8_B9BxAZ066bhXqf-1ENEbwKOlMZ_e7dpkhiUNmOwJlpGplRtmPnzoTqjtFika2i8_lBaabDkqnE-3btZMIVCFJilL85MjiOegUkA_g9NMIDqiy9bunc_8U4FEtNHZLCAR8CNsGKB_B6ULKh5nDIXCAQy80oKesCMDX1R86UpphMoAO9R6eK3OeZ3nm741GM0tIaMPtwdyH-gURxtRq4BwZCW53skKqD3_BTjpRiqfmVNCUklKJP"
            alt="system schematic"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
          <div className="absolute bottom-6 left-6 text-2xl tracking-widest text-white" style={bebas}>SYSTEM SCHEMATIC v0.4</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 flex flex-col gap-8 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="tracking-[2px] text-lg text-[#888888]" style={bebas}>©2024 AGORA PROTOCOL. ALL RIGHTS RESERVED.</div>
          <div className="flex flex-wrap justify-center gap-8 tracking-[2px] text-lg" style={bebas}>
            <a className="text-[#888888] hover:text-white underline" href="#">DOCUMENTATION</a>
            <a className="text-[#888888] hover:text-white underline" href="#">SECURITY</a>
            <span className="text-[#AAFF00]">STATUS: OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

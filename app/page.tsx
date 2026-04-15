"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { GradientBackground } from "../components/ui/paper-design-shader-background";
import { LoopCard } from "../components/ui/economy-loop-card";
import {
  ScanSearch,
  UserPlus,
  ShieldCheck,
  Zap,
  BookOpen,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ECONOMY_STEPS = [
  {
    step: "01",
    label: "SCAN",
    sublabel: "Yield Discovery",
    Icon: ScanSearch,
    desc: "Prime Agent queries Onchain OS for live liquidity pools. Analyzes token holders, rug-pull risk, and 24h volatility.",
    tech: ["Onchain OS", "token liquidity", "cluster-overview"],
  },
  {
    step: "02",
    label: "HIRE",
    sublabel: "x402 Skill Payment",
    Icon: UserPlus,
    desc: "Agent pays Risk Auditor via x402PaymentRouter in tUSDC. Separate provider wallet prevents self-hire.",
    tech: ["x402PaymentRouter", "SkillsRegistry", "tUSDC"],
  },
  {
    step: "03",
    label: "AUDIT",
    sublabel: "Risk Scoring",
    Icon: ShieldCheck,
    desc: "Pool scored 0–100: liquidity depth 30%, holders 25%, volatility 25%, cluster risk 20%. Pass ≥ 65.",
    tech: ["4 risk factors", "Pass ≥ 65", "AuditResult"],
  },
  {
    step: "04",
    label: "EXECUTE",
    sublabel: "Uniswap V3 Swap",
    Icon: Zap,
    desc: "Uniswap Trading API quote → token approval → swap broadcast on X Layer testnet (chain 1952).",
    tech: ["Uniswap Trading API", "chain 1952", "UniswapDexRouter"],
  },
  {
    step: "05",
    label: "RECORD",
    sublabel: "On-Chain Bookkeeping",
    Icon: BookOpen,
    desc: "AgentRegistry.incrementTxCount() and recordEarnings() called. LeaderboardTracker updates rankings.",
    tech: ["AgentRegistry", "recordEarnings()", "LeaderboardTracker"],
  },
  {
    step: "06",
    label: "EARN",
    sublabel: "Yield Distribution",
    Icon: TrendingUp,
    desc: "Profits flow to agent owner. Portfolio snapshots track P&L. Rebalancer queues trades on drift.",
    tech: ["PortfolioTracker", "P&L snapshots", "Rebalancer"],
  },
];

const STATS = [
  { value: 1.2, suffix: "B+", label: "VOLUME_SETTLED", prefix: "$" },
  { value: 842, suffix: "K", label: "AGENT_CALLS_24H", prefix: "" },
  { value: 14, suffix: "MS", label: "AVG_LATENCY", prefix: "" },
  { value: 0.02, suffix: "%", label: "PROTOCOL_FEE", prefix: "" },
];

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function HomePage() {
  const statsRef = useRef<HTMLElement>(null);
  const loopRef = useRef<HTMLElement>(null);
  const infraRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTitle = document.querySelector(".hero-title") as HTMLElement;
      if (heroTitle) {
        const split = new SplitType(heroTitle, { types: "chars" });
        gsap.from(split.chars!, { y: 80, opacity: 0, stagger: 0.03, ease: "power4.out", duration: 0.8, delay: 0.2 });
      }
      gsap.from(".hero-status-line", { x: -30, opacity: 0, stagger: 0.15, delay: 1.2, duration: 0.6, ease: "power3.out" });
      gsap.from(".hero-cta", { scale: 0.9, opacity: 0, delay: 1.8, duration: 0.5, ease: "back.out(1.7)" });

      gsap.from(".economy-card", {
        y: 60, opacity: 0, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: loopRef.current, start: "top 75%" },
      });

      STATS.forEach((stat, i) => {
        const el = document.querySelector(`.stat-val-${i}`) as HTMLElement;
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: stat.value, duration: 2, ease: "power2.out",
          scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
          onUpdate: () => {
            const v = obj.val;
            el.textContent = stat.prefix + (stat.suffix === "K" ? Math.round(v) + "K" : stat.suffix === "B+" ? v.toFixed(1) + "B+" : stat.suffix === "MS" ? Math.round(v) + "MS" : v.toFixed(2) + "%");
          },
        });
      });

      gsap.from(".infra-left", { x: -50, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: infraRef.current, start: "top 70%" } });
      gsap.from(".infra-right", { x: 50, opacity: 0, duration: 0.8, delay: 0.2, ease: "power3.out", scrollTrigger: { trigger: infraRef.current, start: "top 70%" } });
      gsap.from(".infra-item", { x: -20, opacity: 0, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: infraRef.current, start: "top 70%" } });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-black overflow-hidden">
        {/* Shader background — fills the section, sits behind everything */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <GradientBackground />
        </div>
        {/* Dark overlay for text readability — light enough to let lime glow through */}
        <div className="absolute inset-0 bg-black/55" style={{ zIndex: 1 }} />

        <div className="container mx-auto px-6 relative py-24" style={{ zIndex: 2 }}>
          <div className="max-w-5xl">
            {/* Badge row */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="border border-[#AAFF00]/40 text-[#AAFF00] text-xs px-3 py-1 tracking-[2px]" style={mono}>X LAYER</span>
              <span className="border border-[#AAFF00]/40 text-[#AAFF00] text-xs px-3 py-1 tracking-[2px]" style={mono}>UNISWAP V3</span>
              <span className="border border-white/20 text-[#888888] text-xs px-3 py-1 tracking-[2px]" style={mono}>ONCHAIN OS</span>
              <span className="border border-white/20 text-[#888888] text-xs px-3 py-1 tracking-[2px]" style={mono}>x402 PAYMENTS</span>
              <span className="border border-white/20 text-[#888888] text-xs px-3 py-1 tracking-[2px]" style={mono}>CHAIN 1952</span>
            </div>

            {/* Main headline */}
            <h1 className="hero-title text-[clamp(4rem,11vw,10rem)] leading-[0.88] tracking-[2px] uppercase text-white mb-8" style={bebas}>
              WE BUILD THE<br />
              <span className="text-[#AAFF00]">AGENTIC</span><br />
              ECONOMY
            </h1>

            {/* Sub-copy + CTAs */}
            <div className="flex flex-col md:flex-row gap-10 items-start md:items-end justify-between mt-10">
              <p className="hero-status-line max-w-xl text-[#888888] text-base leading-7 tracking-normal" style={{ fontFamily: "Inter, sans-serif" }}>
                AGORA is the first autonomous agent economy on X Layer where AI agents scan for yield,
                hire specialist skills via x402 payments, execute Uniswap V3 swaps, and record earnings
                on-chain. No human friction. Pure protocol.
              </p>

              <div className="flex flex-col gap-4 shrink-0">
                <Link
                  href="/dashboard"
                  className="hero-cta inline-block bg-[#AAFF00] text-black text-3xl px-12 py-4 hover:brightness-110 active:scale-95 transition-all text-center"
                  style={bebas}
                >
                  INITIALIZE AGENT →
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-block border border-[#AAFF00] text-[#AAFF00] text-xl px-12 py-3 hover:bg-[#AAFF00] hover:text-black transition-all text-center"
                  style={bebas}
                >
                  BROWSE SKILLS
                </Link>
              </div>
            </div>

            {/* Real on-chain data strip */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-0 border border-[#AAFF00]/20">
              {[
                { label: "NETWORK", value: "X LAYER TESTNET" },
                { label: "DEX", value: "UNISWAP V3" },
                { label: "PAYMENT TOKEN", value: "tUSDC" },
                { label: "CHAIN ID", value: "1952" },
              ].map((s) => (
                <div key={s.label} className="border-r border-[#AAFF00]/20 last:border-r-0 px-6 py-4">
                  <div className="text-[10px] text-[#888888] uppercase tracking-widest mb-1" style={mono}>{s.label}</div>
                  <div className="text-xl text-[#AAFF00]" style={bebas}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ticker — real project data */}
      <div className="relative z-20 h-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#AAFF00] -rotate-[3deg] scale-110 flex items-center overflow-hidden border-y-4 border-black">
          <div className="ticker-scroll flex whitespace-nowrap">
            {[1, 2].map((k) => (
              <span key={k} className="text-3xl text-black tracking-[3px] mx-6" style={bebas}>
                X LAYER TESTNET •&nbsp;
                UNISWAP V3 SWAPS •&nbsp;
                x402 SKILL PAYMENTS •&nbsp;
                ONCHAIN OS POWERED •&nbsp;
                AGENT REGISTRY: 0x9FCe...Ef1d •&nbsp;
                SKILLS REGISTRY: 0xc247...b841 •&nbsp;
                PAYMENT ROUTER: 0x1d44...CaE •&nbsp;
                CHAIN ID: 1952 •&nbsp;
                tUSDC: 0x7079...993 •&nbsp;
                DEPLOYED: APR 14 2026 •&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Economy Loop — 2-column alternating layout */}
      <section ref={loopRef} className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="text-[#AAFF00] text-xs tracking-[4px] uppercase mb-3" style={mono}>HOW IT WORKS</p>
              <h2 className="text-6xl tracking-[2px] text-white" style={bebas}>THE ECONOMY LOOP</h2>
            </div>
            <p className="text-[#888888] max-w-xs text-sm leading-6" style={{ fontFamily: "Inter, sans-serif" }}>
              Six autonomous steps. Zero human intervention. Every action verifiable on X Layer.
            </p>
          </div>

          {/* 3 rows × 2 cards — arrow between each pair */}
          <div className="space-y-4">
            {[
              [ECONOMY_STEPS[0], ECONOMY_STEPS[1]],
              [ECONOMY_STEPS[2], ECONOMY_STEPS[3]],
              [ECONOMY_STEPS[4], ECONOMY_STEPS[5]],
            ].map((pair, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-0">
                {/* Left card */}
                <LoopCard {...pair[0]} />

                {/* Center arrow */}
                <div className="hidden md:flex items-center justify-center w-12 bg-[#0a0a0a]">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-6 bg-[#AAFF00]/20" />
                    <ArrowRight size={16} className="text-[#AAFF00]" />
                    <div className="w-px h-6 bg-[#AAFF00]/20" />
                  </div>
                </div>

                {/* Right card */}
                <LoopCard {...pair[1]} />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 border border-[#1a1a1a] p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-black">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#AAFF00] neon-pulse shrink-0" />
              <p className="text-[#888888] text-xs" style={mono}>
                Set <span className="text-[#AAFF00]">UNISWAP_EXECUTE=true</span> to run live on X Layer testnet (chain 1952)
              </p>
            </div>
            <Link href="/dashboard" className="shrink-0 border border-[#AAFF00] text-[#AAFF00] px-8 py-2.5 text-lg hover:bg-[#AAFF00] hover:text-black transition-all" style={bebas}>
              VIEW LIVE AGENT →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="border-l-2 border-[#1a1a1a] pl-8">
                <div className={`stat-val-${i} text-7xl text-[#AAFF00] tracking-tighter`} style={bebas}>{stat.prefix}0{stat.suffix}</div>
                <div className="text-[#888888] text-sm uppercase tracking-widest" style={mono}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section ref={infraRef} className="py-32 bg-[#0a0a0a] overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="infra-left space-y-12">
              <h2 className="text-6xl tracking-[2px] text-white" style={bebas}>THE INFRASTRUCTURE</h2>
              {[
                { n: "01", title: "NEURAL ROUTING", desc: "AGORA employs a proprietary mesh network that routes intent to the most capable agent in milliseconds." },
                { n: "02", title: "IMMUTABLE LOGIC", desc: "All agent behaviors are compiled into verifiable ZK-proofs, ensuring execution matches intent every time." },
                { n: "03", title: "CROSS-CHAIN FLOW", desc: "Agents operate natively across all EVM environments, bridging liquidity without bridges." },
              ].map((item) => (
                <div key={item.n} className="infra-item flex gap-6 items-start">
                  <span className="text-4xl text-[#AAFF00] opacity-50" style={bebas}>{item.n}</span>
                  <div>
                    <h4 className="text-3xl text-white mb-2" style={bebas}>{item.title}</h4>
                    <p className="text-[#888888]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="infra-right relative border-8 border-black shadow-2xl overflow-hidden">
              <div className="scanline" />
              <img className="w-full grayscale brightness-50 contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD9m8OpeE9puzUmcq7JoDS5ETtaP7GgRnIJVJiehCdVR_BXVFcnRjQXslti-NM4o3RC5icD-t_2KIq1ldPltvp_3wTFMk24guQ9BDEw1jSdY00ooKr1gghfORSSy4AansRpzsyTD40osnxNS1DnihSOiFlNu8bEMhtisIZp9ZUZ29KaIJNi7ObvnTfGFNNPcCQNdJhXx18eCRSETQCAkLEgZCfX74Asdg0Wulu8OwQCiCBOmBKpjQUqDNmxSeftLtD6Qmb38FnbSG1" alt="terminal" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] bg-[#AAFF00] rotate-[15deg] py-4 text-center z-10">
                <span className="text-4xl text-black tracking-[10px]" style={bebas}>AGORA TAPE AGORA TAPE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 flex flex-col gap-8 bg-black border-t border-[#1a1a1a]">
        <div className="text-[8rem] font-black text-white opacity-5 uppercase leading-none select-none overflow-hidden" style={bebas}>AGORA PROTOCOL</div>
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="tracking-[2px] text-lg flex flex-wrap gap-8" style={bebas}>
            <a className="text-[#888888] hover:text-white underline" href="#">DOCUMENTATION</a>
            <a className="text-[#888888] hover:text-white underline" href="#">SECURITY</a>
            <a className="text-[#888888] hover:text-white underline" href="#">GOVERNANCE</a>
            <span className="text-[#AAFF00]">STATUS: OPERATIONAL</span>
          </div>
          <div className="tracking-[2px] text-lg text-[#888888]" style={bebas}>©2024 AGORA PROTOCOL. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </div>
  );
}

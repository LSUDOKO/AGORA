"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { GradientBackground } from "../components/ui/paper-design-shader-background";
import { 
  ScanSearch, UserPlus, ShieldCheck, Zap, BookOpen, 
  TrendingUp, ArrowRight, Activity, Globe, Cpu 
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ECONOMY_STEPS = [
  {
    step: "01",
    label: "DISCOVER",
    sublabel: "Yield Engine",
    Icon: ScanSearch,
    desc: "Prime Agent scans X Layer liquidity pools via Onchain OS. Maps cluster risk and holder distribution.",
  },
  {
    step: "02",
    label: "ACQUIRE",
    sublabel: "x402 Protocol",
    Icon: UserPlus,
    desc: "Seamless machine-to-machine payments via x402PaymentRouter for instant skill acquisition.",
  },
  {
    step: "03",
    label: "VERIFY",
    sublabel: "Risk Sentinel",
    Icon: ShieldCheck,
    desc: "Real-time auditing of smart contract safety and liquidity depth using weighted risk scoring.",
  },
  {
    step: "04",
    label: "EXECUTE",
    sublabel: "V3 Orchestration",
    Icon: Zap,
    desc: "Broadcasts multi-hop swaps across Uniswap V3 pools with sub-second finality on testnet.",
  },
  {
    step: "05",
    label: "RECORD",
    sublabel: "Ledger Sync",
    Icon: BookOpen,
    desc: "Every interaction is logged on-chain. Revenue shares and protocol fees settled automatically.",
  },
  {
    step: "06",
    label: "SCALE",
    sublabel: "Neural Growth",
    Icon: TrendingUp,
    desc: "Compounding earnings directly to agent owners. Automated rebalancing based on drift.",
  },
];

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const loopRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const ctx = gsap.context(() => {
      // Hero Title Animation
      const heroTitle = document.querySelector(".hero-title") as HTMLElement;
      if (heroTitle) {
        const split = new SplitType(heroTitle, { types: "chars" });
        gsap.from(split.chars!, { 
          y: 100, 
          opacity: 0, 
          stagger: 0.02, 
          ease: "power4.out", 
          duration: 1, 
          delay: 0.5 
        });
      }

      // Scroll Animations
      gsap.from(".anim-item", {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".anim-trigger",
          start: "top 80%",
        }
      });

      // Stats appearance
      gsap.from(".stat-card", {
        scale: 0.9,
        opacity: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".stats-trigger",
          start: "top 85%",
        }
      });
    });
    return () => ctx.revert();
  }, []);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#AAFF00]/30 overflow-x-hidden">
      <GradientBackground />

      <div className="relative z-10">
        {/* Hero Section */}
        <section ref={heroRef} className="min-h-screen flex flex-col justify-center px-6 pt-32 pb-24 max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 rounded-full border border-[#AAFF00]/30 bg-[#AAFF00]/5 text-[#AAFF00] text-[10px] tracking-[0.2em]" style={mono}>
                PROTOCOL_VERSION_4.2
              </div>
              <div className="h-2 w-2 rounded-full bg-[#AAFF00] animate-pulse" />
            </div>

            <h1 className="hero-title text-[clamp(4rem,12vw,11rem)] leading-[0.85] tracking-tighter uppercase font-black" style={bebas}>
              <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">The</span>{" "}
              <span className="text-[#AAFF00] drop-shadow-[0_0_40px_rgba(170,255,0,0.5)]">Sovereign</span>
              <br />
              <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">Agent Core</span>
            </h1>

            <div className="flex flex-col md:flex-row gap-12 items-start md:items-end justify-between pt-8">
              <p className="max-w-xl text-xl text-slate-400 leading-relaxed font-light border-l border-[#AAFF00]/30 pl-8" style={mono}>
                Agora is the first unified orchestration layer for autonomous agents on X Layer. 
                Scan, hire, and execute complex on-chain strategies with zero-trust architecture.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/dashboard"
                  className="group relative px-12 py-6 bg-[#AAFF00] text-black text-3xl overflow-hidden rounded-2xl transition-transform active:scale-95"
                  style={bebas}
                >
                  <span className="relative z-10">ENTER_DASHBOARD</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>
                <Link
                  href="/marketplace"
                  className="px-12 py-6 border border-white/20 bg-white/5 backdrop-blur-md text-white text-3xl rounded-2xl hover:bg-white/10 transition-all text-center"
                  style={bebas}
                >
                  HIRE_SKILLS
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="stats-trigger mt-32 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "NETWORK", value: "X LAYER", icon: <Globe className="w-4 h-4" /> },
              { label: "DEX_CORE", value: "UNISWAP_V3", icon: <Zap className="w-4 h-4" /> },
              { label: "PROTOCOL", value: "X402_PAY", icon: <Cpu className="w-4 h-4" /> },
              { label: "STATUS", value: "DEPLOYED", icon: <Activity className="w-4 h-4" /> },
            ].map((s, i) => (
              <div key={i} className="stat-card p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl group hover:border-[#AAFF00]/40 transition-all">
                <div className="flex justify-between items-center mb-3">
                   <div className="text-[9px] text-slate-500 uppercase tracking-widest" style={mono}>{s.label}</div>
                   <div className="text-[#AAFF00] opacity-40 group-hover:opacity-100 transition-opacity">{s.icon}</div>
                </div>
                <div className="text-2xl text-white" style={bebas}>{s.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Ticker */}
        <div className="relative w-full overflow-hidden h-24 bg-white/5 backdrop-blur-md border-y border-white/10 z-10 flex items-center">
          <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2, 3].map((k) => (
              <span key={k} className="text-[#AAFF00] text-3xl tracking-[4px] mx-12 uppercase flex items-center gap-6" style={bebas}>
                • X LAYER TESTNET • UNISWAP V3 SWAPS • x402 SKILL PAYMENTS • ONCHAIN OS POWERED • CHAIN ID: 1952 •&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* Economy Loop Section */}
        <section ref={loopRef} className="py-48 px-6 max-w-7xl mx-auto anim-trigger">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-[1px] bg-[#AAFF00]" />
                 <span className="text-[10px] tracking-[0.4em] text-[#AAFF00]" style={mono}>THE_AGORA_CYCLE</span>
              </div>
              <h2 className="text-7xl md:text-9xl uppercase tracking-tighter leading-none" style={bebas}>
                Economy <span className="text-[#AAFF00]">Loop</span>
              </h2>
            </div>
            <p className="max-w-sm text-slate-400 text-lg leading-relaxed pl-6 border-l border-white/10" style={mono}>
              A SELF-SUSTAINING ECOSYSTEM OF AUTONOMOUS COLLABORATION AND VALUE CAPTURE.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ECONOMY_STEPS.map((step, i) => (
              <div key={i} className="anim-item group relative p-10 rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.05] transition-all duration-500">
                <div className="absolute top-8 right-10 text-5xl text-white/5 group-hover:text-[#AAFF00]/10 transition-colors" style={bebas}>{step.step}</div>
                <div className="w-16 h-16 mb-8 rounded-2xl bg-[#AAFF00]/10 border border-[#AAFF00]/20 flex items-center justify-center text-[#AAFF00] group-hover:bg-[#AAFF00] group-hover:text-black transition-all duration-500">
                   <step.Icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-[#AAFF00] uppercase tracking-wider mb-1" style={mono}>{step.sublabel}</div>
                    <h3 className="text-4xl text-white uppercase" style={bebas}>{step.label}</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed" style={mono}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="py-48 px-6">
           <div className="max-w-7xl mx-auto rounded-[60px] overflow-hidden border border-white/10 bg-white/[0.02] relative group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#AAFF00]/10 via-transparent to-transparent opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative z-10 px-12 py-32 text-center space-y-12">
                 <h2 className="text-7xl md:text-9xl uppercase tracking-tighter leading-none" style={bebas}>
                   Ready to <span className="text-[#AAFF00]">Orchestrate?</span>
                 </h2>
                 <p className="max-w-2xl mx-auto text-xl text-slate-400" style={mono}>
                   START BUILDING YOUR AGENTIC PORTFOLIO ON THE MOST ADVANCED L2 PROTOCOL.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link href="/dashboard" className="px-16 py-8 bg-[#AAFF00] text-black text-4xl rounded-3xl hover:scale-105 transition-transform" style={bebas}>
                       LAUNCH_APP
                    </Link>
                    <Link href="/analytics" className="px-16 py-8 border border-white/10 bg-white/5 backdrop-blur-md text-white text-4xl rounded-3xl hover:bg-white/10 transition-all" style={bebas}>
                       VIEW_ANALYTICS
                    </Link>
                 </div>
              </div>
           </div>
        </section>

        {/* Global Footer */}
        <footer className="w-full py-24 px-10 border-t border-white/10 bg-black/50 backdrop-blur-xl">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(170,255,0,0.3)]">
                     <img 
                       src="/logo.png" 
                       alt="AGORA Logo" 
                       className="w-full h-full object-cover"
                     />
                   </div>
                   <h2 className="text-6xl text-white uppercase tracking-tighter" style={bebas}>Agora <span className="text-[#AAFF00]">Protocol</span></h2>
                 </div>
                 <p className="max-w-xs text-slate-500 text-sm leading-relaxed" style={mono}>
                    The infrastructure for a self-sovereign agentic future. Built for the OKX X Layer Hackathon 2024.
                 </p>
              </div>
              <div className="grid grid-cols-2 gap-20">
                 <div className="space-y-4">
                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.3em]" style={mono}>Protocol</div>
                    <div className="flex flex-col gap-2 uppercase text-lg" style={bebas}>
                       <Link href="/dashboard" className="hover:text-[#AAFF00] transition-colors">Dashboard</Link>
                       <Link href="/marketplace" className="hover:text-[#AAFF00] transition-colors">Marketplace</Link>
                       <Link href="/analytics" className="hover:text-[#AAFF00] transition-colors">Analytics</Link>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.3em]" style={mono}>Social</div>
                    <div className="flex flex-col gap-2 uppercase text-lg" style={bebas}>
                       <a href="#" className="hover:text-[#AAFF00] transition-colors">Twitter</a>
                       <a href="#" className="hover:text-[#AAFF00] transition-colors">Github</a>
                       <a href="#" className="hover:text-[#AAFF00] transition-colors">Docs</a>
                    </div>
                 </div>
              </div>
           </div>
           <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] text-slate-600" style={mono}>©2024 AGORA LABS. ALL SYSTEMS OPERATIONAL.</p>
              <div className="flex items-center gap-6">
                 <div className="w-2 h-2 rounded-full bg-[#AAFF00]" />
                 <span className="text-[10px] text-[#AAFF00] uppercase tracking-widest" style={mono}>X_LAYER_TESTNET_MAINLOCK</span>
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPublicClient, http } from "viem";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import NetworkBadge from "../../components/NetworkBadge";
import { ACTIVE_CHAIN } from "../../lib/chain";
import { addresses, leaderboardAbi } from "../../lib/contracts";

gsap.registerPlugin(ScrollTrigger);

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

interface AgentActivity { agentId: bigint; txCount: bigint; usdcPaid: bigint; }
interface EnrichedAgent { agentId: number; txCount: number; earnings: number; successRate: number; reputationScore: number; }
type SortKey = "earnings" | "txCount" | "successRate";

function computeReputationScore(e: number, t: number, s: number) { return e * 0.4 + t * 0.3 + s * 0.3; }

const MOCK_ROWS: EnrichedAgent[] = [
  { agentId: 1, txCount: 2109, earnings: 2109.22, successRate: 0.999, reputationScore: 0 },
  { agentId: 2, txCount: 1844, earnings: 1844.10, successRate: 0.98, reputationScore: 0 },
  { agentId: 3, txCount: 1511, earnings: 1511.09, successRate: 0.97, reputationScore: 0 },
  { agentId: 4, txCount: 1200, earnings: 1200.44, successRate: 0.95, reputationScore: 0 },
  { agentId: 5, txCount: 988, earnings: 988.12, successRate: 0.93, reputationScore: 0 },
].map((r) => ({ ...r, reputationScore: computeReputationScore(r.earnings, r.txCount, r.successRate) }));

export default function LeaderboardPage() {
  const [rows, setRows] = useState<AgentActivity[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("earnings");
  const heroRef = useRef<HTMLElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const publicClient = useMemo(() => createPublicClient({
    chain: ACTIVE_CHAIN,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || ACTIVE_CHAIN.rpcUrls.default.http[0]),
  }), []);

  useEffect(() => {
    if (addresses.leaderboard?.startsWith("0x") && addresses.leaderboard.length === 42) {
      let cancelled = false;
      const load = async () => {
        try {
          const result = await publicClient.readContract({ address: addresses.leaderboard, abi: leaderboardAbi, functionName: "getTopAgents", args: [10n] });
          if (!cancelled) setRows(result as AgentActivity[]);
        } catch {}
      };
      void load();
      const iv = setInterval(load, 10_000);
      return () => { cancelled = true; clearInterval(iv); };
    }
  }, [publicClient]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = document.querySelector(".lb-title") as HTMLElement;
      if (title) {
        const split = new SplitType(title, { types: "chars" });
        split.chars!.forEach((char, i) => {
          gsap.from(char, { y: i % 2 === 0 ? -40 : 40, opacity: 0, duration: 0.6, delay: 0.05 * i, ease: "power3.out" });
        });
      }

      // TVL count up
      const tvlEl = document.querySelector(".tvl-val") as HTMLElement;
      if (tvlEl) {
        const obj = { val: 0 };
        gsap.to(obj, { val: 14292055.12, duration: 2.5, ease: "power2.out", delay: 0.5,
          onUpdate: () => { tvlEl.textContent = "$" + obj.val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
        });
      }

      // Rows
      gsap.from(".lb-row", { x: -40, opacity: 0, stagger: 0.1, ease: "power3.out", duration: 0.6, delay: 0.4 });

      // Progress bars
      document.querySelectorAll(".lb-bar").forEach((bar, i) => {
        const target = bar.getAttribute("data-width") || "0";
        gsap.from(bar, { width: "0%", duration: 0.8, delay: 0.6 + i * 0.1, ease: "power2.out" });
        (bar as HTMLElement).style.width = target + "%";
      });

      // CTA
      gsap.from(".lb-cta", {
        scale: 0.95, opacity: 0, ease: "back.out(1.7)", duration: 0.7,
        scrollTrigger: { trigger: ".lb-cta", start: "top 85%" },
      });
    });
    return () => ctx.revert();
  }, []);

  const enriched: EnrichedAgent[] = useMemo(() => {
    if (rows.length === 0) return MOCK_ROWS;
    return rows.map((row) => {
      const txCount = Number(row.txCount);
      const earnings = Number(row.usdcPaid) / 1_000_000;
      const successRate = txCount / (txCount + 1);
      return { agentId: Number(row.agentId), txCount, earnings, successRate, reputationScore: computeReputationScore(earnings, txCount, successRate) };
    });
  }, [rows]);

  const sorted = useMemo(() => [...enriched].sort((a, b) => b[sortKey] - a[sortKey]), [enriched, sortKey]);

  const BAR_WIDTHS = [92, 78, 65, 51, 39];

  return (
    <div className="pt-20 bg-black min-h-screen overflow-x-hidden">
      {/* Hero */}
      <header ref={heroRef} className="pt-16 pb-12 px-6 max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-baseline gap-4">
        <div>
          <h1 className="lb-title text-[clamp(4rem,10vw,8rem)] leading-none tracking-tighter text-white" style={bebas}>
            AGENT <span className="text-[#AAFF00]">LEADERBOARD</span>
          </h1>
          <p className="text-[#888888] text-sm mt-4 uppercase tracking-widest max-w-xl" style={mono}>
            Real-time performance metrics for high-velocity autonomous agents. Data refreshed every block.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <NetworkBadge />
          <div className="bg-[#1a1a1a] p-6 border-l-4 border-[#AAFF00] mt-2">
            <div className="text-xs text-[#888888] mb-1" style={mono}>TOTAL AGENT TVL</div>
            <div className="tvl-val text-4xl text-[#AAFF00]" style={bebas}>$0.00</div>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <div className="relative w-full overflow-hidden h-20 mb-24 z-10">
        <div className="absolute left-[-5%] w-[110%] bg-[#AAFF00] py-4 whitespace-nowrap overflow-hidden -rotate-[8deg]">
          <div className="ticker-scroll flex" style={bebas}>
            {[1, 2].map((k) => (
              <span key={k} className="text-black text-4xl mx-8">
                NEW AGENT DETECTED: 0x82...f91a • X402 PROTOCOL STATUS: OPTIMAL • VOLUME ATH: $4.2M • NETWORK LOAD: 12% •&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="px-6 max-w-[1440px] mx-auto mb-8 flex items-center gap-4">
        <span className="text-[#888888] text-sm" style={mono}>SORT BY:</span>
        {(["earnings", "txCount", "successRate"] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={`px-4 py-1.5 text-sm transition-all ${sortKey === key ? "bg-[#AAFF00] text-black" : "border border-[#1a1a1a] text-[#888888] hover:border-[#AAFF00] hover:text-white"}`}
            style={bebas}
          >
            {key === "earnings" ? "EARNINGS" : key === "txCount" ? "TRANSACTIONS" : "SUCCESS RATE"}
          </button>
        ))}
      </div>

      {/* Tables */}
      <div ref={tableRef} className="px-6 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 pb-24">
        {/* By Volume */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-[#AAFF00]" />
            <h2 className="text-5xl tracking-widest text-white" style={bebas}>BY TRANSACTION VOLUME</h2>
          </div>
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-12 pb-4 border-b border-[#1a1a1a] text-[10px] text-[#888888] uppercase tracking-tighter" style={mono}>
              <div className="col-span-1">RNK</div>
              <div className="col-span-6">AGENT IDENTITY</div>
              <div className="col-span-5 text-right">VOLUME (24H)</div>
            </div>
            {sorted.map((agent, i) => (
              <div key={agent.agentId} className="lb-row grid grid-cols-12 items-center py-6 hover:bg-[#111] transition-colors px-2">
                <div className="col-span-1 text-3xl text-white" style={bebas}>{String(i + 1).padStart(2, "0")}</div>
                <div className="col-span-6 flex flex-col gap-1">
                  <span className={`text-sm ${i === 0 ? "text-[#AAFF00]" : "text-white"}`} style={mono}>
                    0x{agent.agentId.toString(16).padStart(4, "0")}...{i === 0 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#AAFF00] ml-2 neon-pulse" />}
                  </span>
                  <div className="w-full h-1 bg-[#1a1a1a] overflow-hidden mt-2">
                    <div className="lb-bar h-full bg-[#AAFF00]" data-width={BAR_WIDTHS[i] || 20} style={{ width: (BAR_WIDTHS[i] || 20) + "%" }} />
                  </div>
                </div>
                <div className="col-span-5 text-right text-3xl text-white" style={bebas}>${agent.earnings.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* By x402 Payments */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-white" />
            <h2 className="text-5xl tracking-widest text-white" style={bebas}>BY X402 PAYMENTS SENT</h2>
          </div>
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-12 pb-4 border-b border-[#1a1a1a] text-[10px] text-[#888888] uppercase tracking-tighter" style={mono}>
              <div className="col-span-1">RNK</div>
              <div className="col-span-6">AGENT IDENTITY</div>
              <div className="col-span-5 text-right">PAYMENTS (24H)</div>
            </div>
            {sorted.map((agent, i) => (
              <div key={agent.agentId} className="lb-row grid grid-cols-12 items-center py-6 hover:bg-[#111] transition-colors px-2">
                <div className="col-span-1 text-3xl text-white" style={bebas}>{String(i + 1).padStart(2, "0")}</div>
                <div className="col-span-6 flex flex-col gap-1">
                  <span className={`text-sm ${i === 0 ? "text-[#AAFF00]" : "text-white"}`} style={mono}>
                    0x{(agent.agentId * 7 + 100).toString(16).padStart(4, "0")}...
                  </span>
                  <div className="w-full h-1 bg-[#1a1a1a] overflow-hidden mt-2">
                    <div className="lb-bar h-full bg-[#AAFF00]" data-width={BAR_WIDTHS[i] || 20} style={{ width: (BAR_WIDTHS[i] || 20) + "%" }} />
                  </div>
                </div>
                <div className="col-span-5 text-right text-3xl text-white" style={bebas}>{agent.txCount.toLocaleString()} TX</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="lb-cta px-6 max-w-[1440px] mx-auto mb-24">
        <div className="max-w-4xl w-full p-1 border-2 border-[#AAFF00] relative mx-auto">
          <div className="absolute -top-6 left-6 bg-black px-4 text-2xl text-[#AAFF00]" style={bebas}>ACCELERATE YOUR AGENT</div>
          <div className="bg-[#111] p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h3 className="text-6xl text-white leading-none mb-4" style={bebas}>DEPLOY TO THE PROTOCOL</h3>
              <p className="text-[#888888] text-sm" style={mono}>Join the top tier of autonomous execution. Secure your position in the next block cycle.</p>
            </div>
            <button className="w-full md:w-auto bg-[#AAFF00] text-black px-16 py-8 text-4xl hover:bg-white transition-all active:scale-95 whitespace-nowrap" style={bebas}>
              JOIN THE LEADERBOARD →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 px-6 flex flex-col gap-8 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <div className="text-[clamp(4rem,15vw,12rem)] font-black text-white opacity-5 uppercase leading-none select-none" style={bebas}>AGORA PROTOCOL</div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 -mt-16 z-10 relative">
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

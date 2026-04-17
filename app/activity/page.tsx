"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import {
  Activity as ActivityIcon,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Download,
  RefreshCw,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { getTxExplorerUrl } from "../../lib/explorer";
gsap.registerPlugin(ScrollTrigger);

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

interface TelemetryEvent {
  event: string;
  timestamp: number;
  data: unknown;
}

interface TelemetryReceipt {
  receiptId: number;
  agentId: string;
  skillId: string;
  amount: string;
  timestamp: string;
  completed: boolean;
}

interface ChecklistItem {
  label: string;
  status: "complete" | "ready" | "blocked";
  detail: string;
}

interface TelemetryPayload {
  chain: {
    id: number;
    name: string;
    deployedAt: string;
  };
  agent: {
    agentId: string;
    totalTxns: string;
    totalEarned: string;
    receiptCount: string;
  };
  wallet: {
    address: string | null;
    paymentToken: string;
  };
  gas: {
    gasPriceGwei?: string;
    executionBand?: string;
  };
  liquidity: {
    poolCount?: number;
    deepestLiquidityUsd?: string;
    averageApy?: string;
    summary?: string;
  };
  sentiment: {
    score?: number;
    label?: string;
    volume24h?: string;
  };
  recentReceipts: TelemetryReceipt[];
  checklist: ChecklistItem[];
  total: number;
  latest: TelemetryEvent[];
}

function isTelemetryPayload(data: unknown): data is TelemetryPayload {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as Partial<TelemetryPayload>;
  return Boolean(candidate.chain && candidate.agent && candidate.wallet && Array.isArray(candidate.latest));
}

interface ActivityRow {
  tag: string;
  title: string;
  identifier: string;
  amount: string;
  timeLabel: string;
  href?: string;
  accent: "lime" | "cyan" | "emerald" | "amber" | "slate";
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds} SEC AGO`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} MIN AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} HR AGO`;
  const days = Math.floor(hours / 24);
  return `${days} DAY AGO`;
}

function parseEventData(data: unknown): Record<string, unknown> {
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
    return data[0] as Record<string, unknown>;
  }

  if (typeof data === "object" && data !== null) {
    return data as Record<string, unknown>;
  }

  return {};
}

function getEventMeta(eventType: string) {
  const type = eventType.toLowerCase();
  if (type.includes("swap")) return { tag: "SWAP", accent: "lime" as const };
  if (type.includes("approved")) return { tag: "APPROVED", accent: "emerald" as const };
  if (type.includes("rejected")) return { tag: "REJECTED", accent: "amber" as const };
  if (type.includes("opportunity")) return { tag: "SCAN", accent: "cyan" as const };
  if (type.includes("registered")) return { tag: "SETTLED", accent: "emerald" as const };
  if (type.includes("hired")) return { tag: "HIRED", accent: "lime" as const };
  if (type.includes("faucet")) return { tag: "MINTED", accent: "cyan" as const };
  if (type.includes("earnings")) return { tag: "EARNED", accent: "lime" as const };
  return { tag: "EVENT", accent: "slate" as const };
}

function getAccentClasses(accent: ActivityRow["accent"]) {
  if (accent === "lime") return "text-[#AAFF00] border-[#AAFF00]/20 bg-[#AAFF00]/5";
  if (accent === "cyan") return "text-cyan-300 border-cyan-400/20 bg-cyan-400/5";
  if (accent === "emerald") return "text-emerald-300 border-emerald-400/20 bg-emerald-400/5";
  if (accent === "amber") return "text-amber-300 border-amber-400/20 bg-amber-400/5";
  return "text-slate-300 border-white/10 bg-white/5";
}

function buildRows(payload: TelemetryPayload | null): ActivityRow[] {
  if (!payload) return [];

  const receiptRows: ActivityRow[] = payload.recentReceipts.map((receipt) => ({
    tag: receipt.completed ? "SETTLED" : "PENDING",
    title: `Receipt #${receipt.receiptId} / Skill #${receipt.skillId}`,
    identifier: `Agent #${receipt.agentId}`,
    amount: `${receipt.amount} ${payload.wallet.paymentToken}`,
    timeLabel: formatRelativeTime(new Date(receipt.timestamp).getTime()),
    href: (receipt as any).txHash ? getTxExplorerUrl((receipt as any).txHash) : undefined,
    accent: receipt.completed ? "emerald" : "lime",
  }));

  const eventRows: ActivityRow[] = payload.latest
    .slice()
    .reverse()
    .map((entry) => {
      const meta = getEventMeta(entry.event);
      const eventData = parseEventData(entry.data);
      const identifier =
        typeof eventData.poolAddress === "string"
          ? eventData.poolAddress
          : typeof eventData.address === "string"
            ? eventData.address
            : payload.wallet.address || payload.chain.name;

      let amount = "N/A";
      if (typeof eventData.amount === "string" || typeof eventData.amount === "number") {
        amount = String(eventData.amount);
      } else if (typeof eventData.estimatedAPY === "number") {
        amount = `${eventData.estimatedAPY}% APY`;
      } else if (typeof eventData.score === "number") {
        amount = `${eventData.score}/100`;
      }

      return {
        tag: meta.tag,
        title: entry.event.toUpperCase().replace(/:/g, "_"),
        identifier,
        amount,
        timeLabel: formatRelativeTime(entry.timestamp),
        href: eventData.txHash ? getTxExplorerUrl(String(eventData.txHash)) : undefined,
        accent: meta.accent,
      };
    });

  return [...receiptRows, ...eventRows].slice(0, 16);
}

export default function ActivityPage() {
  const heroRef = useRef<HTMLElement>(null);
  const [payload, setPayload] = useState<TelemetryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/telemetry", { cache: "no-store" });
      const data: unknown = await res.json();

      if (!res.ok || !isTelemetryPayload(data)) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String(data.error)
            : "Failed to load activity";
        throw new Error(message);
      }

      setPayload(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch activity:", err);
      setError(err instanceof Error ? err.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActivity();
    const interval = window.setInterval(() => {
      void loadActivity();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [loadActivity]);

  const rows = useMemo(() => buildRows(payload), [payload]);

  const tickerItems = useMemo(() => {
    if (!payload) {
      return ["NETWORK: SYNCING", "RECEIPTS: 0", "EVENTS: 0", "GAS: N/A"];
    }

    return [
      `NETWORK: ${payload.gas.executionBand || "OPTIMAL"}`,
      `RECEIPTS: ${payload.agent.receiptCount}`,
      `EVENTS: ${payload.total}`,
      `AGENT_TXNS: ${payload.agent.totalTxns}`,
      `POOLS: ${payload.liquidity.poolCount ?? 0}`,
      `24H_VOLUME: ${payload.sentiment.volume24h || "N/A"}`,
      `PAYMENT_TOKEN: ${payload.wallet.paymentToken}`,
      `CHAIN_ID: ${payload.chain.id}`,
    ];
  }, [payload]);

  const architectureStats = useMemo(() => {
    if (!payload) {
      return [
        { label: "GAS_GWEI", value: "..." },
        { label: "RECEIPTS", value: "0" },
        { label: "AGENT_TXNS", value: "0" },
        { label: "SENTIMENT", value: "..." },
      ];
    }

    return [
      { label: "GAS_GWEI", value: payload.gas.gasPriceGwei || "N/A" },
      { label: "RECEIPTS", value: payload.agent.receiptCount },
      { label: "AGENT_TXNS", value: payload.agent.totalTxns },
      { label: "SENTIMENT", value: `${payload.sentiment.score ?? 0}` },
    ];
  }, [payload]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = document.querySelector(".activity-title") as HTMLElement | null;
      if (title) {
        const split = new SplitType(title, { types: "chars" });
        gsap.from(split.chars ?? [], {
          y: 60,
          opacity: 0,
          stagger: 0.025,
          ease: "power4.out",
          duration: 0.7,
          delay: 0.2,
        });
      }

      gsap.to(".sync-dot", {
        scale: 1.5,
        opacity: 0.5,
        repeat: -1,
        duration: 1,
        ease: "power2.inOut",
        yoyo: true,
      });

      gsap.from(".activity-row", {
        y: 20,
        opacity: 0,
        stagger: 0.04,
        ease: "power3.out",
        duration: 0.6,
        delay: 0.2,
        clearProps: "all",
      });
    }, heroRef);

    return () => ctx.revert();
  }, [rows]);

  const downloadSnapshot = () => {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agora-activity-snapshot.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#AAFF00]/30 overflow-x-hidden">
      <div className="relative z-10 pt-32 pb-32">
        <section ref={heroRef} className="px-6 max-w-7xl mx-auto mb-16 space-y-4">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full border border-[#AAFF00]/30 bg-[#AAFF00]/5 text-[#AAFF00] text-[10px] tracking-[0.2em]" style={mono}>
              LIVE_TELEMETRY_FEED
            </div>
            <div className="sync-dot w-2 h-2 rounded-full bg-[#AAFF00]" />
            <button
              onClick={() => void loadActivity()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white"
              style={mono}
            >
              <RefreshCw className="w-3 h-3" />
              REFRESH
            </button>
          </div>
          <h1 className="activity-title text-7xl md:text-9xl tracking-tighter leading-[0.8] uppercase" style={bebas}>
            Protocol <span className="text-[#AAFF00]">Activity</span>
          </h1>
          <p className="text-slate-400 max-w-3xl text-lg border-l border-[#AAFF00]/30 pl-6" style={mono}>
            Real protocol receipts, agent telemetry, liquidity state, and monitoring signals from the deployed AGORA testnet stack.
          </p>
        </section>

        <div className="relative w-full overflow-hidden h-24 bg-white/5 backdrop-blur-md border-y border-white/10 z-10 my-16 flex items-center">
          <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2, 3].map((copy) => (
              <span key={copy} className="text-[#AAFF00] text-3xl tracking-[4px] mx-12 uppercase flex items-center gap-6" style={bebas}>
                {tickerItems.join(" // ")}
              </span>
            ))}
          </div>
        </div>

        <section className="px-6 max-w-7xl mx-auto grid gap-8 lg:grid-cols-[1.6fr_0.9fr] mb-12">
          <div className="rounded-[40px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                label="AGENT_EARNED"
                value={`${payload?.agent.totalEarned || "0"} ${payload?.wallet.paymentToken || "tUSDC"}`}
                icon={<Wallet className="w-4 h-4" />}
              />
              <MetricCard
                label="LIQUIDITY_POOLS"
                value={String(payload?.liquidity.poolCount ?? 0)}
                icon={<Database className="w-4 h-4" />}
              />
              <MetricCard
                label="SENTIMENT"
                value={payload?.sentiment.label || "SYNCING"}
                icon={<ShieldCheck className="w-4 h-4" />}
              />
              <MetricCard
                label="ROUTER_STATUS"
                value={payload?.gas.executionBand || "OPTIMAL"}
                icon={<Zap className="w-4 h-4" />}
              />
            </div>
          </div>

          <div className="rounded-[40px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl uppercase tracking-tight text-white" style={bebas}>
                Protocol State
              </h2>
              <CheckCircle2 className="w-5 h-5 text-[#AAFF00]" />
            </div>
            <div className="space-y-3">
              {(payload?.checklist || []).map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm uppercase text-white" style={bebas}>{item.label}</p>
                    <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${item.status === "complete" ? "bg-[#AAFF00]/10 text-[#AAFF00]" : item.status === "ready" ? "bg-cyan-400/10 text-cyan-300" : "bg-amber-400/10 text-amber-300"}`} style={mono}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400" style={mono}>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 max-w-7xl mx-auto">
          <div className="rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-10 py-8 border-b border-white/10 bg-white/5 items-center">
              <div className="col-span-2 text-[10px] text-slate-500 tracking-[0.2em]" style={mono}>TAG</div>
              <div className="col-span-4 text-[10px] text-slate-500 tracking-[0.2em]" style={mono}>IDENTIFIER / ADDRESS</div>
              <div className="col-span-3 text-right text-[10px] text-slate-500 tracking-[0.2em]" style={mono}>CAPITAL_FLUX</div>
              <div className="col-span-3 text-right text-[10px] text-slate-500 tracking-[0.2em]" style={mono}>TEMPORAL_TAG</div>
            </div>

            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center animate-pulse">
                    <ActivityIcon className="w-8 h-8 text-[#AAFF00]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl text-white uppercase" style={bebas}>Initializing Feed...</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto" style={mono}>
                      Pulling on-chain receipts and agent telemetry from the AGORA protocol.
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="py-24 text-center space-y-4">
                  <p className="text-3xl text-white uppercase" style={bebas}>Feed Offline</p>
                  <p className="text-sm text-rose-400" style={mono}>{error}</p>
                </div>
              ) : rows.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <p className="text-3xl text-white uppercase" style={bebas}>No Activity Yet</p>
                  <p className="text-sm text-slate-500" style={mono}>
                    Trigger a scan, audit, swap, or x402 hire to populate the feed.
                  </p>
                </div>
              ) : (
                rows.map((row, index) => (
                  <div key={`${row.tag}-${row.identifier}-${index}`} className="activity-row grid grid-cols-12 gap-4 px-10 py-8 items-center hover:bg-white/[0.05] transition-all duration-300 group">
                    <div className="col-span-2 flex items-center">
                      <div className={`rounded-2xl border px-4 py-2 text-[10px] uppercase tracking-[0.2em] ${getAccentClasses(row.accent)}`} style={mono}>
                        {row.tag}
                      </div>
                    </div>
                    <div className="col-span-4 flex flex-col gap-1">
                      <span className="text-2xl text-white uppercase tracking-tight" style={bebas}>{row.title}</span>
                      <span className="text-[10px] text-slate-500 break-all font-mono opacity-60 group-hover:opacity-100 transition-opacity" style={mono}>
                        {row.identifier}
                      </span>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="text-2xl text-[#AAFF00] font-bold" style={bebas}>{row.amount}</span>
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-4">
                      <span className="text-sm text-slate-400" style={mono}>{row.timeLabel}</span>
                      {row.href ? (
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-[#AAFF00] group-hover:text-black transition-all"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      ) : (
                        <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-500">
                          <ActivityIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-24 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <h2 className="text-5xl text-white uppercase leading-none" style={bebas}>
              Neural <br /> Architecture
            </h2>
            <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
              {architectureStats.map((stat) => (
                <div key={stat.label} className="bg-black/40 p-6 backdrop-blur-md">
                  <div className="text-[9px] text-slate-500 mb-1" style={mono}>{stat.label}</div>
                  <div className="text-2xl text-[#AAFF00]" style={bebas}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[40px] border border-white/10 bg-white/5 p-10 aspect-video flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-slate-500 tracking-[0.4em]" style={mono}>SNAPSHOT_V1.0</div>
              <div className="mt-3 text-sm text-slate-300" style={mono}>
                Export the current telemetry payload, receipts, and activity rows for debugging or investor demos.
              </div>
            </div>
            <button
              onClick={downloadSnapshot}
              disabled={!payload}
              className="inline-flex items-center gap-3 self-start rounded-2xl border border-[#AAFF00]/20 bg-[#AAFF00]/5 px-5 py-3 text-[#AAFF00] disabled:opacity-50"
              style={mono}
            >
              <Download className="w-4 h-4" />
              DOWNLOAD_SNAPSHOT.JSON
            </button>
          </div>
        </section>
      </div>

      <footer className="w-full py-16 px-10 flex flex-col md:flex-row justify-between items-center gap-8 bg-black/50 backdrop-blur-xl border-t border-white/10">
        <div className="text-slate-500 text-lg tracking-widest" style={bebas}>©2024 AGORA PROTOCOL.</div>
        <div className="flex gap-10 text-slate-400 text-sm" style={bebas}>
          <a href="/dashboard" className="hover:text-white transition-colors">CONTROL_CENTER</a>
          <a href="/marketplace" className="hover:text-white transition-colors">MARKETPLACE</a>
          <span className="text-[#AAFF00]">LIVE_ACTIVITY</span>
        </div>
      </footer>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 text-[#AAFF00]">
        {icon}
        <span className="text-[10px] tracking-[0.2em]" style={mono}>{label}</span>
      </div>
      <div className="mt-4 text-3xl text-white uppercase tracking-tight" style={bebas}>{value}</div>
    </div>
  );
}

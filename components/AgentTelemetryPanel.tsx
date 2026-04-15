"use client";

import { useEffect, useState } from "react";

interface TelemetryResponse {
  chain: {
    id: number;
    name: string;
    rpcUrl: string;
    deployedAt: string;
  };
  wallet: {
    address: string | null;
    paymentToken: string;
    swapTokenIn: string;
    swapTokenOut: string;
  };
  agent: {
    agentId: string;
    totalTxns: string;
    totalEarned: string;
    receiptCount: string;
  };
  swap: {
    mode: string;
    executeEnabled: boolean;
    router: string;
    quoter: string;
    poolFee: number;
    status: "ready" | "dry-run";
  };
  x402: {
    status: string;
    detail: string;
    router: string;
  };
  portfolio: {
    balance: string;
    symbol: string;
  };
  gas: {
    gasPriceGwei: string;
    recommendation: string;
    executionBand: string;
  };
  liquidity: {
    poolCount: number;
    topPool: string | null;
    deepestLiquidityUsd: string;
    averageApy: string;
    summary: string;
  };
  sentiment: {
    score: number;
    label: string;
    summary: string;
    priceChange24h: string;
    volume24h: string;
    riskLevel: string;
  };
  recentReceipts: Array<{
    receiptId: number;
    agentId: string;
    skillId: string;
    amount: string;
    timestamp: string;
    completed: boolean;
  }>;
  checklist: Array<{
    label: string;
    status: "complete" | "ready" | "blocked";
    detail: string;
  }>;
}

function StatusPill({ status }: { status: "complete" | "ready" | "blocked" | "dry-run" }) {
  const palette =
    status === "complete"
      ? "bg-emerald-400/15 text-emerald-200"
      : status === "ready"
        ? "bg-cyan-400/15 text-cyan-200"
        : "bg-amber-400/15 text-amber-100";

  return <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${palette}`}>{status}</span>;
}

export default function AgentTelemetryPanel() {
  const [data, setData] = useState<TelemetryResponse | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/agent/telemetry", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Telemetry request failed");
        }

        if (!cancelled) {
          setData(payload);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unknown telemetry error");
        }
      }
    };

    void load();
    const interval = setInterval(load, 15_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return (
      <section className="rounded-3xl border border-red-400/20 bg-red-400/5 p-6 text-sm text-red-100">
        Telemetry unavailable: {error}
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        Loading agent telemetry...
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Execution Control</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Testnet-only Uniswap mode</h2>
            </div>
            <StatusPill status={data.swap.status} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Mode</p>
              <p className="mt-2 text-lg font-medium text-white">{data.swap.mode}</p>
              <p className="mt-2 text-sm text-slate-400">Mainnet swap flow is intentionally disabled in this build.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pool Fee</p>
              <p className="mt-2 text-lg font-medium text-white">{data.swap.poolFee}</p>
              <p className="mt-2 text-sm text-slate-400">Router {data.swap.router}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Payment Token</p>
              <p className="mt-2 text-sm text-white">{data.wallet.paymentToken}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Swap In</p>
              <p className="mt-2 text-sm text-white">{data.wallet.swapTokenIn}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Swap Out</p>
              <p className="mt-2 text-sm text-white">{data.wallet.swapTokenOut}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Release State</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Hackathon readiness</h2>
          <div className="mt-6 space-y-4">
            {data.checklist.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <StatusPill status={item.status} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Agent Txns</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{data.agent.totalTxns}</h3>
          <p className="mt-2 text-sm text-slate-400">Live on-chain tx count for the connected agent.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Earned</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{data.agent.totalEarned}</h3>
          <p className="mt-2 text-sm text-slate-400">Recorded earnings in AgentRegistry.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Wallet Balance</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">
            {data.portfolio.balance} {data.portfolio.symbol}
          </h3>
          <p className="mt-2 text-sm text-slate-400">Portfolio tracker skill output.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Receipts</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{data.agent.receiptCount}</h3>
          <p className="mt-2 text-sm text-slate-400">x402 receipts recorded by the router.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gas Optimizer</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{data.gas.gasPriceGwei} gwei</h2>
          <p className="mt-3 text-sm text-slate-400">{data.gas.recommendation}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Liquidity Monitor</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{data.liquidity.poolCount} pools</h2>
          <p className="mt-3 text-sm text-slate-400">{data.liquidity.summary}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sentiment Analyzer</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {data.sentiment.label} · {data.sentiment.score}
          </h2>
          <p className="mt-3 text-sm text-slate-400">{data.sentiment.summary}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recent Receipts</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Latest x402 activity</h2>
          </div>
          <p className="text-sm text-slate-400">Router {data.x402.router}</p>
        </div>
        <p className="mt-3 text-sm text-slate-400">{data.x402.detail}</p>
        <div className="mt-6 space-y-4">
          {data.recentReceipts.length > 0 ? (
            data.recentReceipts.map((receipt) => (
              <div key={receipt.receiptId} className="rounded-2xl border border-white/8 bg-slate-950/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">
                    Receipt #{receipt.receiptId} · Agent #{receipt.agentId} · Skill #{receipt.skillId}
                  </p>
                  <StatusPill status={receipt.completed ? "complete" : "ready"} />
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {receipt.amount} USDC at {new Date(receipt.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4 text-sm text-slate-400">
              No x402 receipts yet. Seed skills from a second wallet to unblock this.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

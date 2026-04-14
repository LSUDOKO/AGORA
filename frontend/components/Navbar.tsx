"use client";

import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortAddress, toXkoAddress } from "../lib/address";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/marketplace", label: "Skills Marketplace" },
  { href: "/activity", label: "Activity Feed" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <Link href="/dashboard" className="text-2xl font-semibold tracking-[0.2em] text-white">
            AGORA
          </Link>
          <p className="text-xs text-slate-400">The On-Chain Economy Where Agents Hire Agents</p>
        </div>

        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-slate-300 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-right">
                <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">Connected</div>
                <div className="text-sm text-white">{shortAddress(toXkoAddress(address))}</div>
              </div>
              <button
                onClick={() => disconnect()}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Disconnect
              </button>
            </>
          ) : (
            connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isPending}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
              >
                {isPending ? "Connecting..." : `Connect ${connector.name}`}
              </button>
            ))
          )}
        </div>
      </div>
    </header>
  );
}

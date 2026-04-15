"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortAddress, toXkoAddress } from "../lib/address";

const navItems = [
  { href: "/", label: "HOME" },
  { href: "/marketplace", label: "MARKETPLACE" },
  { href: "/activity", label: "ACTIVITY" },
  { href: "/leaderboard", label: "LEADERBOARD" },
  { href: "/analytics", label: "ANALYTICS" },
  { href: "/chat", label: "AI CHAT" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const navRef = useRef<HTMLElement>(null);
  // Prevent hydration mismatch — wallet state only known on client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-black border-b border-[#1a1a1a]"
    >
      <Link
        href="/"
        className="text-3xl font-black text-[#AAFF00] tracking-tighter"
        style={{ fontFamily: "'Bebas Neue', cursive" }}
      >
        AGORA
      </Link>

      <div className="hidden md:flex gap-8 items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xl transition-colors duration-200 tracking-[2px] uppercase ${
                isActive
                  ? "text-[#AAFF00] border-b-2 border-[#AAFF00] pb-1"
                  : "text-white hover:text-[#AAFF00]"
              }`}
              style={{ fontFamily: "'Bebas Neue', cursive" }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Wallet section — only render after mount to avoid hydration mismatch */}
      <div className="flex items-center gap-3">
        {mounted && isConnected ? (
          <>
            <div className="border border-[#AAFF00]/30 bg-[#AAFF00]/10 px-4 py-2 text-right">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#AAFF00]">Connected</div>
              <div className="text-sm text-white font-mono">{shortAddress(toXkoAddress(address))}</div>
            </div>
            <button
              onClick={() => disconnect()}
              className="border border-white/15 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              style={{ fontFamily: "'Bebas Neue', cursive" }}
            >
              DISCONNECT
            </button>
          </>
        ) : mounted ? (
          connectors.slice(0, 1).map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="bg-[#AAFF00] text-black px-6 py-2 text-lg font-black hover:bg-white transition-all active:scale-95 disabled:opacity-60"
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "1px" }}
            >
              {isPending ? "CONNECTING..." : "CONNECT WALLET"}
            </button>
          ))
        ) : (
          // Placeholder during SSR — same size as the button to avoid layout shift
          <div className="bg-[#AAFF00] text-black px-6 py-2 text-lg font-black opacity-0 pointer-events-none" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            CONNECT WALLET
          </div>
        )}
      </div>
    </nav>
  );
}

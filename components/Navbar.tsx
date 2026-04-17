"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortAddress, toXkoAddress } from "../lib/address";
import { Menu, X, Wallet, Shield } from "lucide-react";

const navItems = [
  { href: "/", label: "HOME" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/marketplace", label: "MARKETPLACE" },
  { href: "/activity", label: "ACTIVITY" },
  { href: "/leaderboard", label: "LEADERBOARD" },
  { href: "/analytics", label: "ANALYTICS" },
  { href: "/chat", label: "AI CHAT" },
];

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-[100] px-6 py-4 md:px-10 md:py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20 rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#AAFF00] flex items-center justify-center text-black shadow-[0_0_20px_rgba(170,255,0,0.3)] group-hover:shadow-[0_0_30px_rgba(170,255,0,0.5)] transition-all">
            <Shield size={24} fill="currentColor" />
          </div>
          <span className="text-3xl font-black text-white tracking-tighter" style={bebas}>
            AGORA
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex gap-1 items-center px-2 py-1.5 rounded-2xl bg-white/[0.02] border border-white/5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2 text-sm transition-all duration-300 tracking-[1px] uppercase rounded-xl overflow-hidden group ${
                  isActive
                    ? "text-[#AAFF00] font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                style={bebas}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-[#AAFF00]/10 border border-[#AAFF00]/20 rounded-xl" />
                )}
                <span className="relative z-10">{item.label}</span>
                {!isActive && (
                   <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#AAFF00] transition-all group-hover:w-4 opacity-50" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Wallet section */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4">
            {mounted && isConnected ? (
              <div className="flex items-center gap-4 p-1 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="px-4 py-1.5 text-right">
                  <div className="text-[8px] uppercase tracking-[0.3em] text-[#AAFF00] font-bold">Protocol_Link</div>
                  <div className="text-xs text-white font-bold tracking-tight" style={mono}>
                    {shortAddress(toXkoAddress(address))}
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="px-5 py-2 rounded-xl bg-white/5 text-xs text-white hover:bg-white/10 transition font-bold tracking-widest"
                  style={bebas}
                >
                  EXIT
                </button>
              </div>
            ) : mounted ? (
              connectors.slice(0, 1).map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  disabled={isPending}
                  className="group flex items-center gap-3 px-6 py-2.5 rounded-xl bg-[#AAFF00] text-black text-sm font-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 shadow-[0_4px_15px_rgba(170,255,0,0.3)]"
                  style={bebas}
                >
                  <Wallet size={16} />
                  <span>{isPending ? "SCANNING..." : "INITIALIZE WALLET"}</span>
                </button>
              ))
            ) : null}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-6 right-6 mt-4 p-6 rounded-[2rem] border border-white/10 bg-black/90 backdrop-blur-3xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-6 py-4 rounded-2xl text-xl transition-all ${
                  pathname === item.href ? "bg-[#AAFF00]/10 text-[#AAFF00]" : "text-white hover:bg-white/5"
                }`}
                style={bebas}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="sm:hidden pt-4 border-t border-white/5">
             {mounted && isConnected ? (
               <button
                 onClick={() => { disconnect(); setMobileMenuOpen(false); }}
                 className="w-full py-4 rounded-2xl bg-white/5 text-white text-xl"
                 style={bebas}
               >
                 DISCONNECT
               </button>
             ) : mounted ? (
               connectors.slice(0, 1).map((connector) => (
                 <button
                   key={connector.uid}
                   onClick={() => { connect({ connector }); setMobileMenuOpen(false); }}
                   className="w-full py-4 rounded-2xl bg-[#AAFF00] text-black text-xl font-black"
                   style={bebas}
                 >
                   CONNECT WALLET
                 </button>
               ))
             ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}

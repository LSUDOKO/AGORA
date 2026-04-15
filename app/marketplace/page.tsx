"use client";

import { useEffect, useRef, useState } from "react";
import { getDefaultStrategies, getStrategies, saveStrategy, deleteStrategy, type Strategy } from "../../lib/strategies";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const SKILLS = [
  { id: "AG-001", name: "YIELD FINDER", desc: "Scans Onchain OS for live liquidity pools. Analyzes APY, reserves, and token risk.", fee: "0.3 tUSDC" },
  { id: "AG-092", name: "RISK AUDITOR", desc: "Weighted 4-factor pool scoring: liquidity, holders, volatility, cluster risk. Pass >= 65.", fee: "0.5 tUSDC" },
  { id: "AG-145", name: "GAS OPTIMIZER", desc: "Monitors gas price trend (rising/falling/stable). Recommends delay when gas is high.", fee: "0.1 tUSDC" },
  { id: "AG-330", name: "SENTIMENT ORACLE", desc: "Aggregates Onchain OS signals into a [-100, 100] sentiment score with confidence level.", fee: "0.2 tUSDC" },
  { id: "AG-552", name: "LIQUIDITY MONITOR", desc: "Tracks pool reserve changes. Alerts on >20% shift. Health score 0-100 per pool.", fee: "0.2 tUSDC" },
  { id: "AG-801", name: "PORTFOLIO TRACKER", desc: "Multi-token balance snapshots with USD value and P&L tracking over time.", fee: "0.1 tUSDC" },
];

export default function MarketplacePage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", riskThreshold: 65, preferredProtocols: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = getStrategies();
    setStrategies(saved.length > 0 ? saved : getDefaultStrategies());
  }, []);

  function handleExport(s: Strategy) {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "strategy-" + s.id + ".json"; a.click();
    URL.revokeObjectURL(url);
  }

  function handleDelete(id: string) {
    deleteStrategy(id);
    setStrategies((prev) => prev.filter((s) => s.id !== id));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const s: Strategy = {
      id: "custom-" + Date.now(), name: form.name, description: form.description,
      riskThreshold: form.riskThreshold,
      preferredProtocols: form.preferredProtocols.split(",").map((p) => p.trim()).filter(Boolean),
      tokenWhitelist: [], tokenBlacklist: [], author: "You", rating: 0, usageCount: 0,
    };
    saveStrategy(s);
    setStrategies(getStrategies());
    setForm({ name: "", description: "", riskThreshold: 65, preferredProtocols: "" });
    setShowForm(false);
  }

  return (
    <div className="pt-20 bg-black min-h-screen">
      <header className="pt-16 pb-12 px-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="max-w-2xl">
          <h1 className="text-8xl tracking-[2px] leading-tight mb-4 text-white uppercase" style={bebas}>
            SKILLS <span className="text-[#91db00]">MARKETPLACE</span>
          </h1>
          <p className="text-[#888888] text-sm max-w-md" style={mono}>
            [SYSTEM_LOG]: BROWSE AVAILABLE PROTOCOL SKILLS FOR IMMEDIATE X402 EXECUTION ON X LAYER TESTNET.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#91db00] animate-pulse" />
            <span className="text-xs text-[#91db00]" style={mono}>NETWORK STATUS: OPTIMAL</span>
          </div>
          <div className="text-right">
            <span className="text-4xl text-white" style={bebas}>{SKILLS.length}</span>
            <span className="block text-[10px] text-[#888888]" style={mono}>SKILLS AVAILABLE</span>
          </div>
        </div>
      </header>

      <div className="px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t border-[#1a1a1a]">
        {SKILLS.map((skill) => (
          <div key={skill.id} className="group relative p-8 border-r border-b border-[#1a1a1a] bg-[#0e0e0e] hover:bg-[#111] hover:border-[#AAFF00] transition-all duration-300">
            <div className="absolute top-4 right-4 text-[10px] text-[#555]" style={mono}>ID: {skill.id}</div>
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-3xl text-white mb-1" style={bebas}>{skill.name}</h3>
                <p className="text-[#888888] text-sm leading-relaxed">{skill.desc}</p>
              </div>
              <div className="flex justify-between items-end pt-2">
                <div style={mono}>
                  <span className="block text-[10px] text-[#555] mb-1">EXECUTION FEE</span>
                  <span className="text-lg text-[#AAFF00] font-bold">{skill.fee}</span>
                </div>
                <button className="bg-[#AAFF00] text-black px-6 py-2.5 text-base hover:bg-white transition-all active:scale-95" style={bebas}>
                  HIRE VIA X402
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="px-8 max-w-7xl mx-auto mt-20 pb-32 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
          <h2 className="text-4xl text-white" style={bebas}>STRATEGY MARKETPLACE</h2>
          <div className="flex gap-3">
            <input ref={fileInputRef} type="file" accept=".json" className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const parsed = JSON.parse(ev.target?.result as string) as Strategy;
                    if (!parsed.id || !parsed.name) throw new Error("Invalid");
                    saveStrategy(parsed); setStrategies(getStrategies());
                  } catch { alert("Invalid strategy JSON."); }
                };
                reader.readAsText(file); e.target.value = "";
              }}
            />
            <button onClick={() => fileInputRef.current?.click()} className="border border-[#1a1a1a] px-4 py-2 text-sm text-[#888888] hover:text-white hover:border-white transition-all" style={bebas}>IMPORT JSON</button>
            <button onClick={() => setShowForm((v) => !v)} className="bg-[#AAFF00] text-black px-4 py-2 text-sm hover:bg-white transition-all" style={bebas}>{showForm ? "CANCEL" : "CREATE STRATEGY"}</button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="border border-[#AAFF00]/20 bg-[#AAFF00]/5 p-6 space-y-4">
            <h3 className="text-2xl text-white" style={bebas}>NEW STRATEGY</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#888888]" style={mono}>Name</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="border border-[#1a1a1a] bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-[#AAFF00]" placeholder="My Strategy" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#888888]" style={mono}>Risk Threshold (0-100)</label>
                <input type="number" min={0} max={100} required value={form.riskThreshold} onChange={(e) => setForm((f) => ({ ...f, riskThreshold: Number(e.target.value) }))} className="border border-[#1a1a1a] bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-[#AAFF00]" />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-[#888888]" style={mono}>Description</label>
                <textarea required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="border border-[#1a1a1a] bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-[#AAFF00]" placeholder="Describe your strategy" />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-[#888888]" style={mono}>Preferred Protocols</label>
                <input value={form.preferredProtocols} onChange={(e) => setForm((f) => ({ ...f, preferredProtocols: e.target.value }))} className="border border-[#1a1a1a] bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-[#AAFF00]" placeholder="Uniswap V3, OKX DEX" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-[#AAFF00] text-black px-6 py-2 text-sm hover:bg-white transition-all" style={bebas}>SAVE STRATEGY</button>
            </div>
          </form>
        )}

        <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-3 border-l border-t border-[#1a1a1a]">
          {strategies.map((s) => (
            <div key={s.id} className="flex flex-col gap-3 border-r border-b border-[#1a1a1a] bg-[#0e0e0e] p-6 hover:bg-[#111] transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xl text-white" style={bebas}>{s.name}</h3>
                  <p className="text-xs text-[#555]" style={mono}>by {s.author}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-[#888888]">{s.description}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="border border-[#AAFF00]/30 bg-[#AAFF00]/10 px-2.5 py-0.5 text-[#AAFF00]" style={mono}>Risk {s.riskThreshold}</span>
                {s.preferredProtocols.map((p) => (
                  <span key={p} className="border border-[#1a1a1a] px-2.5 py-0.5 text-[#555]" style={mono}>{p}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#333]" style={mono}>{s.usageCount} uses</span>
                <div className="flex gap-2">
                  <button onClick={() => handleExport(s)} className="border border-[#1a1a1a] px-3 py-1 text-xs text-[#888888] hover:text-white transition-all" style={bebas}>EXPORT</button>
                  <button onClick={() => handleDelete(s.id)} className="border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10 transition-all" style={bebas}>DELETE</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="w-full py-12 px-8 bg-black border-t border-[#1a1a1a]">
        <div className="flex justify-between items-center">
          <div className="tracking-[2px] text-lg text-[#555]" style={bebas}>2024 AGORA PROTOCOL.</div>
          <span className="text-[#AAFF00] tracking-[2px]" style={bebas}>STATUS: OPERATIONAL</span>
        </div>
      </footer>
    </div>
  );
}

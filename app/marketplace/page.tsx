"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAccount, useReadContract, useWriteContract, useBalance, usePublicClient } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { formatUnits } from "viem";
import { addresses, skillsRegistryAbi, paymentRouterAbi, usdcAbi } from "../../lib/contracts";
import { wagmiConfig } from "../../lib/wagmiConfig";
import { GradientBackground } from "../../components/ui/paper-design-shader-background";
import RegisterSkillForm from "../../components/RegisterSkillForm";
import { 
  ShieldCheck, Zap, Download, Trash2, Plus, Info, 
  CheckCircle2, Loader2, ExternalLink, Cpu, Globe, 
  Layers, Rocket, Wallet
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

interface Skill {
  skillId: bigint;
  provider: string;
  name: string;
  description: string;
  priceUSDC: bigint;
  totalHires: bigint;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  author: string;
  usageCount: number;
  rating: number;
  riskThreshold: number;
  preferredProtocols: string[];
}

const ACTIVE_CHAIN = {
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: ["https://xlayer-testnet.okx.com"] } },
  blockExplorers: { default: { name: "XLayerScan", url: "https://www.okx.com/explorer/xlayer" } },
};

export default function MarketplacePage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const gridRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [showForm, setShowForm] = useState(false);
  const [showRegisterSkill, setShowRegisterSkill] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState("");
  const [txState, setTxState] = useState<Record<string, "idle" | "approving" | "broadcasting" | "done" | "error">>({});
  const [txHash, setTxHash] = useState<Record<string, string>>({});
  const [error, setError] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", description: "", riskThreshold: 50, preferredProtocols: "" });

  const { writeContractAsync } = useWriteContract();

  const { data: agentId } = useReadContract({
    address: addresses.agentRegistry,
    abi: [
      {
        name: "ownerToAgentId",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ],
    functionName: "ownerToAgentId",
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  const { data: usdcBalanceData } = useBalance({
    address: address,
    token: addresses.testUsdc || addresses.usdc,
    query: { refetchInterval: 5000 },
  });

  const usdcBalance = usdcBalanceData?.value || 0n;

  const loadSkills = useCallback(async () => {
    if (!publicClient) return;

    setSkillsLoading(true);
    setSkillsError("");

    try {
      const count = (await publicClient.readContract({
        address: addresses.skillsRegistry,
        abi: skillsRegistryAbi,
        functionName: "skillCount",
      })) as bigint;

      if (count === 0n) {
        setSkills([]);
        return;
      }

      const skillIndexes = Array.from({ length: Number(count) }, (_, index) => BigInt(index + 1));
      const loadedSkills = await Promise.all(
        skillIndexes.map(async (skillId) => {
          const [provider, name, priceUSDC, totalHires] = (await publicClient.readContract({
            address: addresses.skillsRegistry,
            abi: skillsRegistryAbi,
            functionName: "getSkill",
            args: [skillId],
          })) as [string, string, bigint, bigint];

          const description = (await publicClient.readContract({
            address: addresses.skillsRegistry,
            abi: skillsRegistryAbi,
            functionName: "getSkillDescription",
            args: [skillId],
          })) as string;

          return {
            skillId,
            provider,
            name,
            description,
            priceUSDC,
            totalHires,
          } satisfies Skill;
        }),
      );

      setSkills(
        loadedSkills.filter(
          (skill) => skill.provider !== "0x0000000000000000000000000000000000000000",
        ),
      );
    } catch (err) {
      console.error("Failed to load skills", err);
      setSkills([]);
      setSkillsError("REGISTRY_SYNC_FAILED");
    } finally {
      setSkillsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  useEffect(() => {
    if (!publicClient) return;

    const interval = window.setInterval(() => {
      loadSkills();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [loadSkills, publicClient]);

  // Actions
  const hireSkill = async (skill: Skill) => {
    if (!agentId || agentId === 0n) {
      setError(prev => ({ ...prev, [skill.skillId.toString()]: "REGISTER_AGENT_FIRST" }));
      return;
    }

    try {
      const id = skill.skillId.toString();
      setError(prev => ({ ...prev, [id]: "" }));
      
      // Check allowance
      setTxState(prev => ({ ...prev, [id]: "approving" }));
      const approveHash = await writeContractAsync({
        address: addresses.usdc,
        abi: usdcAbi,
        functionName: "approve",
        args: [addresses.paymentRouter, skill.priceUSDC],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      } else {
        await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });
      }

      // Hire
      setTxState(prev => ({ ...prev, [id]: "broadcasting" }));
      const hash = await writeContractAsync({
        address: addresses.paymentRouter,
        abi: paymentRouterAbi,
        functionName: "hireSkill",
        args: [agentId, skill.skillId],
      });

      setTxHash(prev => ({ ...prev, [id]: hash }));
      
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      } else {
        await waitForTransactionReceipt(wagmiConfig, { hash });
      }

      setTxState(prev => ({ ...prev, [id]: "done" }));
      loadSkills();
    } catch (err: unknown) {
      console.error(err);
      setTxState(prev => ({ ...prev, [skill.skillId.toString()]: "error" }));
    }
  };

  const btnLabel = (skill: Skill) => {
    const id = skill.skillId.toString();
    if (address?.toLowerCase() === skill.provider.toLowerCase()) return "OWNED_MODULE";
    if (error[id] === "REGISTER_AGENT_FIRST") return "ACTIVATE_AGENT";
    if (txState[id] === "approving") return "APPROVING_tUSDC...";
    if (txState[id] === "broadcasting") return "SYNCING_ROUTER...";
    if (txState[id] === "done") return "HIRE_SUCCESS";
    if (txState[id] === "error") return "RETRY_HIRE";
    return `HIRE_VIA_X402`;
  };

  // Local Strategies Logic
  useEffect(() => {
    const getStrategies = () => {
      const saved = localStorage.getItem("agora_strategies");
      if (saved) return JSON.parse(saved);
      return [
        { id: "1", name: "DELTA_NEUTRAL_V3", description: "Automated concentrated liquidity management for USDC/ETH pairs with rebalancing triggers.", author: "PROTOCOL_CORE", usageCount: 1240, rating: 4.8, riskThreshold: 30, preferredProtocols: ["UNISWAP_V3"] },
        { id: "2", name: "FLASH_LOAN_ARBITRAGE", description: "Multi-hop arbitrage execution across X Layer DEX clusters utilizing transient liquidity.", author: "AGENT_0x72...f2", usageCount: 856, rating: 4.5, riskThreshold: 85, preferredProtocols: ["UNISWAP_V3", "CURVE"] }
      ];
    };
    setStrategies(getStrategies());
  }, []);

  const saveStrategy = (s: Strategy) => {
    const existing = JSON.parse(localStorage.getItem("agora_strategies") || "[]");
    const updated = [s, ...existing];
    localStorage.setItem("agora_strategies", JSON.stringify(updated));
    setStrategies(updated);
  };

  const deleteStrategy = (strategyId: string) => {
    const updated = strategies.filter((strategy) => strategy.id !== strategyId);
    localStorage.setItem("agora_strategies", JSON.stringify(updated));
    setStrategies(updated);
  };

  const exportStrategy = (strategy: Strategy) => {
    const blob = new Blob([JSON.stringify(strategy, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${strategy.name.toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const normalizeStrategy = (raw: Partial<Strategy>): Strategy => ({
    id: raw.id || crypto.randomUUID(),
    name: (raw.name || "CUSTOM_STRATEGY").toUpperCase(),
    description: raw.description || "Imported strategy module.",
    author: raw.author || (address ? `AGENT_${address.slice(0, 6)}` : "IMPORTED"),
    usageCount: Number(raw.usageCount || 0),
    rating: Number(raw.rating || 5),
    riskThreshold: Number(raw.riskThreshold ?? 50),
    preferredProtocols: Array.isArray(raw.preferredProtocols)
      ? raw.preferredProtocols.map((protocol) => String(protocol).toUpperCase())
      : [],
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newStrategy: Strategy = {
      id: Math.random().toString(36).substr(2, 9),
      name: form.name.toUpperCase(),
      description: form.description,
      author: address ? `AGENT_${address.slice(0, 6)}` : "ANONYMOUS",
      usageCount: 0,
      rating: 5,
      riskThreshold: form.riskThreshold,
      preferredProtocols: form.preferredProtocols.split(",").map(p => p.trim().toUpperCase())
    };
    saveStrategy(newStrategy);
    setShowForm(false);
    setForm({ name: "", description: "", riskThreshold: 50, preferredProtocols: "" });
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#AAFF00]/30 overflow-hidden">
      <GradientBackground />

      <div className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-16">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-end gap-12">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#AAFF00]/20 bg-[#AAFF00]/5 text-[#AAFF00] text-[10px] font-bold tracking-[0.3em] uppercase" style={mono}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AAFF00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#AAFF00]"></span>
              </span>
              Neural_Registry_Active
            </div>
            <h1 className="text-7xl md:text-9xl tracking-tighter leading-[0.85] uppercase" style={bebas}>
              Protocol <br />
              <span className="text-[#AAFF00]">Marketplace</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed font-medium uppercase tracking-wide opacity-80" style={mono}>
              Universal capability scaling for sovereign agents via X Layer X402 payment routes.
            </p>
          </div>

          <div className="flex flex-col items-end gap-6 w-full lg:w-auto">
            {!isConnected ? (
               <div className="p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl text-center space-y-4">
                  <Wallet className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold" style={mono}>Wallet_Disconnected</p>
               </div>
            ) : (
              <div className="group relative w-full lg:w-72 p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl transition-all hover:bg-white/[0.05]">
                <div className="absolute top-4 right-6 text-[10px] text-slate-600 font-bold tracking-widest uppercase" style={mono}>CREDITS</div>
                 <div className="space-y-1">
                   <p className="text-[10px] uppercase tracking-widest text-[#AAFF00] font-bold" style={mono}>Available_tUSDC</p>
                   <div className="flex items-center justify-between">
                     <div className="text-5xl font-bold flex items-center gap-3" style={bebas}>
                       {formatUnits(usdcBalance, 6)}
                     </div>
                     <button
                       onClick={async () => {
                         if (!address) return;
                         setTxState(prev => ({ ...prev, "faucet": "broadcasting" }));
                         try {
                           const res = await fetch("/api/faucet", {
                             method: "POST",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify({ address })
                           });
                           if (!res.ok) throw new Error("Faucet failed");
                           const data = await res.json();
                           setTxHash(prev => ({ ...prev, "faucet": data.hash }));
                           setTxState(prev => ({ ...prev, "faucet": "done" }));
                           setTimeout(() => {
                             setTxState(prev => ({ ...prev, "faucet": "idle" }));
                             setTxHash(prev => ({ ...prev, "faucet": undefined }));
                           }, 10000);
                         } catch (e) {
                           console.error(e);
                           setTxState(prev => ({ ...prev, "faucet": "error" }));
                         }
                       }}
                       disabled={txState["faucet"] === "broadcasting"}
                       className="px-3 py-1.5 bg-[#AAFF00]/10 border border-[#AAFF00]/20 text-[#AAFF00] text-[9px] rounded-lg tracking-widest uppercase font-bold hover:bg-[#AAFF00]/20 transition-all disabled:opacity-50"
                       style={mono}
                     >
                       {txState["faucet"] === "broadcasting" ? "MINTING..." : "GET tUSDC"}
                     </button>
                   </div>
                 </div>
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                  {agentId && agentId !== 0n ? (
                    <div className="flex items-center gap-2 text-[10px] text-[#AAFF00] font-bold tracking-wider uppercase" style={mono}>
                      <ShieldCheck size={12} /> AGENT_{agentId.toString()}_SYNCED
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[10px] text-amber-400 font-bold tracking-wider uppercase" style={mono}>
                      <Info size={12} /> REGISTRATION_PENDING
                    </div>
                  )}
                </div>
                {/* Glow Effect */}
                <div className="absolute -inset-px bg-gradient-to-br from-[#AAFF00]/10 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            )}
          </div>
        </header>

        {/* Protocol Metadata Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 rounded-[2rem] overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-md">
          {[
            { label: "REGISTRY_ADDR", value: addresses.skillsRegistry.slice(0, 14) + "...", icon: Layers },
            { label: "ROUTER_ADDR", value: addresses.paymentRouter.slice(0, 14) + "...", icon: Globe },
            { label: "SETTLEMENT", value: "T+0_INSTANT", icon: Zap },
            { label: "NETWORK", value: "X_LAYER_TEST", icon: Cpu },
          ].map((item, i) => (
            <div key={i} className="px-8 py-6 border-r border-white/5 last:border-r-0 flex flex-col gap-2 group hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-2">
                 <item.icon size={12} className="text-[#AAFF00] opacity-50" />
                 <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold" style={mono}>{item.label}</span>
              </div>
              <span className="text-xs text-white font-bold tracking-tight truncate" style={mono}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Skills Registry Section */}
        <section className="space-y-10">
          <div className="flex items-baseline justify-between border-b border-white/5 pb-6">
            <h2 className="text-4xl text-white uppercase tracking-tight" style={bebas}>Capability <span className="text-[#AAFF00]">Matrix</span></h2>
            <div className="flex items-center gap-6">
               <div className="text-[10px] text-slate-500 font-bold tracking-[0.3em]" style={mono}>{skills.length}_MODULES_DETECTED</div>
               <button 
                 onClick={() => setShowRegisterSkill(true)}
                 className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#AAFF00] text-black text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                 style={bebas}
               >
                 <Rocket className="w-4 h-4" /> BUILD_AGENT_SKILL
               </button>
            </div>
          </div>

          {skillsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 rounded-[3rem] border border-white/10 bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : skillsError ? (
            <div className="rounded-[3rem] border border-rose-500/20 bg-rose-500/5 p-24 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto">
                 <Info className="w-8 h-8 text-rose-400" />
              </div>
              <p className="text-rose-300 text-sm uppercase tracking-widest font-bold" style={mono}>{skillsError}</p>
              <button
                onClick={() => loadSkills()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest"
                style={bebas}
              >
                RETRY_SYNC
              </button>
            </div>
          ) : skills.length === 0 ? (
            <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] p-24 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto">
                 <Info className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm uppercase tracking-widest font-bold" style={mono}>Matrix_Empty: Registry_Offline_or_Empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" ref={gridRef}>
              {skills.map(skill => (
                <div key={skill.skillId.toString()} className="skill-card group relative p-10 rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.06] hover:border-[#AAFF00]/40 transition-all duration-500 flex flex-col gap-8 overflow-hidden">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="p-4 rounded-2xl bg-[#AAFF00]/5 border border-[#AAFF00]/20 group-hover:scale-110 transition-transform">
                      <Zap className="w-8 h-8 text-[#AAFF00]" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {address?.toLowerCase() === skill.provider.toLowerCase() && (
                        <div className="px-2 py-0.5 rounded-md bg-[#AAFF00]/20 border border-[#AAFF00]/30 text-[#AAFF00] text-[8px] font-black uppercase tracking-widest" style={mono}>PROVIDER_OWNED</div>
                      )}
                      <div className="text-right">
                        <span className="text-[9px] text-slate-600 block mb-1 font-bold tracking-widest uppercase" style={mono}>HIRE_FREQ</span>
                        <span className="text-xl text-white font-black" style={bebas}>{skill.totalHires.toString()}X</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 relative z-10">
                    <h3 className="text-3xl text-white uppercase tracking-tight" style={bebas}>{skill.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-3 opacity-90">{skill.description}</p>
                    <div className="pt-4 flex items-center gap-2 group/prov">
                       <div className="w-2 h-2 rounded-full bg-[#AAFF00] opacity-40 group-hover/prov:opacity-100 transition-opacity" />
                       <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest truncate" style={mono}>Provider: {skill.provider}</span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10 flex items-center justify-between relative z-10">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-600 block mb-0.5 font-bold tracking-widest uppercase" style={mono}>ACCESS_FEE</span>
                      <span className="text-3xl text-[#AAFF00]" style={bebas}>{formatUnits(skill.priceUSDC, 6)} <span className="text-xs">tUSDC</span></span>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <button
                         onClick={() => {
                           if (address?.toLowerCase() === skill.provider.toLowerCase()) return;
                           if (error[skill.skillId.toString()] === "REGISTER_AGENT_FIRST") {
                             window.location.href = "/dashboard";
                           } else {
                             hireSkill(skill);
                           }
                         }}
                         disabled={txState[skill.skillId.toString()]?.includes("ing") || txState[skill.skillId.toString()] === "done" || address?.toLowerCase() === skill.provider.toLowerCase()}
                         className={`inline-flex items-center gap-3 px-8 py-3 rounded-2xl text-[16px] font-black tracking-widest transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed uppercase ${
                           txState[skill.skillId.toString()] === "done"
                             ? "bg-[#AAFF00]/10 text-[#AAFF00] border border-[#AAFF00]/30 shadow-[0_0_20px_rgba(170,255,0,0.1)]"
                             : address?.toLowerCase() === skill.provider.toLowerCase()
                               ? "bg-white/5 text-slate-500 border border-white/10"
                               : txState[skill.skillId.toString()] === "error"
                                 ? "bg-rose-500 text-white"
                                 : "bg-[#AAFF00] text-black hover:shadow-[0_0_30px_rgba(170,255,0,0.4)]"
                         }`}
                         style={bebas}
                       >
                         {txState[skill.skillId.toString()]?.includes("ing") && <Loader2 className="w-4 h-4 animate-spin" />}
                         {txState[skill.skillId.toString()] === "done" && <CheckCircle2 className="w-4 h-4" />}
                         {btnLabel(skill)}
                       </button>
                      {txHash[skill.skillId.toString()] && (
                        <a
                          href={`${ACTIVE_CHAIN.blockExplorers?.default.url}/tx/${txHash[skill.skillId.toString()]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[10px] text-[#22D3EE] font-bold hover:underline tracking-widest"
                          style={mono}
                        >
                          PROTOCOL_EXPLORER <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Aesthetic Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#AAFF00]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#AAFF00]/10 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Strategy Vault Section */}
        <section className="pt-20 space-y-12">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <h2 className="text-5xl text-white uppercase tracking-tight" style={bebas}>Strategy <span className="text-[#AAFF00]">Vault</span></h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] opacity-80" style={mono}>Localized JSON-driven orchestration layer.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <input ref={fileInputRef} type="file" accept=".json" className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => {
                    try {
                      const parsed = JSON.parse(ev.target?.result as string);
                      const strategyList = Array.isArray(parsed) ? parsed : [parsed];
                      const validStrategies = strategyList.map(normalizeStrategy);
                      validStrategies.reverse().forEach(saveStrategy);
                    } catch { alert("Invalid strategy JSON."); }
                  };
                  reader.readAsText(file); e.target.value = "";
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10 transition-all font-black uppercase tracking-widest"
                style={bebas}
              >
                <Download className="w-4 h-4" /> IMPORT_JSON
              </button>
              <button
                onClick={() => setShowForm(v => !v)}
                className={`inline-flex items-center gap-3 px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  showForm ? "bg-white/10 text-white" : "bg-[#AAFF00] text-black hover:scale-105"
                }`}
                style={bebas}
              >
                {showForm ? "DISCARD" : <><Plus className="w-4 h-4" /> NEW_STRATEGY</>}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="rounded-[3rem] border border-[#AAFF00]/10 bg-[#AAFF00]/[0.02] p-12 backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
              <form onSubmit={handleCreate} className="space-y-10">
                <div className="grid gap-10 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-[#AAFF00] font-black ml-1" style={mono}>Strategy_Label</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/50 px-6 py-4 text-sm text-white focus:outline-none focus:border-[#AAFF00] transition-colors" placeholder="e.g., NEURAL_ARBITRAGE" style={mono} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-[#AAFF00] font-black ml-1" style={mono}>Risk_Threshold (0-100)</label>
                    <input type="number" min={0} max={100} required value={form.riskThreshold} onChange={e => setForm(f => ({ ...f, riskThreshold: Number(e.target.value) }))} className="w-full rounded-2xl border border-white/10 bg-black/50 px-6 py-4 text-sm text-white focus:outline-none focus:border-[#AAFF00] transition-colors" style={mono} />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#AAFF00] font-black ml-1" style={mono}>Mission_Briefing</label>
                    <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className="w-full rounded-2xl border border-white/10 bg-black/50 px-6 py-4 text-sm text-white focus:outline-none focus:border-[#AAFF00] transition-colors" placeholder="Define the primary logic flow and objectives..." style={mono} />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#AAFF00] font-black ml-1" style={mono}>Preferred_Protocols (IDENTIFIERS)</label>
                    <input value={form.preferredProtocols} onChange={e => setForm(f => ({ ...f, preferredProtocols: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/50 px-6 py-4 text-sm text-white focus:outline-none focus:border-[#AAFF00] transition-colors" placeholder="UNISWAP_V3, AAVE_V3, CURVE" style={mono} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="group flex items-center gap-3 bg-[#AAFF00] text-black px-12 py-4 rounded-[2rem] text-xl font-black uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(170,255,0,0.2)]" style={bebas}>
                    COMMIT TO VAULT
                    <ShieldCheck size={24} />
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {strategies.map(s => (
              <div key={s.id} className="group relative flex flex-col gap-8 rounded-[3rem] border border-white/5 bg-white/[0.01] p-10 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 backdrop-blur-3xl overflow-hidden">
                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <h3 className="text-2xl text-white uppercase tracking-tight" style={bebas}>{s.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#AAFF00] animate-pulse" />
                       <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black" style={mono}>Author: {s.author}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                    {[1, 2, 3, 4, 5].map(v => (
                       <div key={v} className={`w-1.5 h-1.5 rounded-full transition-all ${v <= Math.round(s.rating) ? "bg-[#AAFF00] scale-110 shadow-[0_0_8px_rgba(170,255,0,0.5)]" : "bg-white/10"}`} />
                    ))}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-slate-400 font-medium flex-1 opacity-80 relative z-10">{s.description}</p>
                
                <div className="flex flex-wrap gap-3 relative z-10">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#AAFF00]/20 bg-[#AAFF00]/5 px-4 py-1.5 text-[8px] text-[#AAFF00] font-black uppercase tracking-widest" style={mono}>
                    RISK_LVL: {s.riskThreshold}%
                  </span>
                  {s.preferredProtocols.map(p => (
                    <span key={p} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[8px] text-slate-500 font-black uppercase tracking-widest" style={mono}>{p}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-white/5 relative z-10">
                  <div className="flex flex-col gap-0.5">
                     <span className="text-[10px] text-white font-black" style={bebas}>{s.usageCount} INSTALLED</span>
                     <span className="text-[8px] text-slate-600 font-black tracking-widest uppercase" style={mono}>Protocol_Saturation</span>
                  </div>
                  <div className="flex gap-6">
                    <button
                      onClick={() => exportStrategy(s)}
                      className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                      aria-label={`Export ${s.name}`}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteStrategy(s.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      aria-label={`Delete ${s.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Decorative Indicator */}
                <div className="absolute top-0 left-0 w-1 h-20 bg-gradient-to-b from-[#AAFF00] to-transparent opacity-30" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Register Skill Modal */}
      {showRegisterSkill && (
        <RegisterSkillForm 
          onClose={() => setShowRegisterSkill(false)} 
          onSuccess={() => { loadSkills(); }} 
        />
      )}
    </div>
  );
}

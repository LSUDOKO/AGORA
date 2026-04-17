"use client";

import { useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract, usePublicClient } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { parseUnits } from "viem";
import { addresses, skillsRegistryAbi } from "../lib/contracts";
import { wagmiConfig } from "../lib/wagmiConfig";
import { getTxExplorerUrl } from "../lib/explorer";
import { ACTIVE_CHAIN } from "../lib/chain";
import { Rocket, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";

interface RegisterSkillFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function RegisterSkillForm({ onClose, onSuccess }: RegisterSkillFormProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);

  const trackEvent = async (event: string, data: any) => {
    try {
      await fetch("/api/agent/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, data })
      });
    } catch (e) {
      console.warn("Telemetry track failed", e);
    }
  };
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      // Network check
      if (chainId !== ACTIVE_CHAIN.id) {
        try {
          await switchChainAsync({ chainId: ACTIVE_CHAIN.id });
        } catch (error) {
          console.error("Failed to switch network:", error);
          throw new Error("Please switch to X Layer Testnet to continue.");
        }
      }

      const priceUSDC = parseUnits(price, 6);
      
      const hash = await writeContractAsync({
        address: addresses.skillsRegistry,
        abi: skillsRegistryAbi,
        functionName: "registerSkill",
        args: [name, description, priceUSDC],
      });
      setTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      } else {
        await waitForTransactionReceipt(wagmiConfig, { hash });
      }

      setStatus("done");
      trackEvent("skill:registered", { name, description, price, txHash: hash });
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "shortMessage" in err
            ? String(err.shortMessage)
            : "Registration failed";
      setErrorMessage(message);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose}
      />
      
      {/* Form Container */}
      <div className="relative w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 md:p-16 backdrop-blur-3xl shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="space-y-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#AAFF00]/20 bg-[#AAFF00]/5 text-[#AAFF00] text-[10px] font-bold tracking-[0.3em] uppercase" style={mono}>
               PROVIDER_ONBOARDING
            </div>
            <h2 className="text-6xl text-white uppercase tracking-tighter" style={bebas}>
              Register <span className="text-[#AAFF00]">New Skill</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide opacity-80" style={mono}>
              Define a new capability module for the Agora Agentic Marketplace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-10">
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#AAFF00] font-black ml-1" style={mono}>
                SKILL_IDENTIFIER
              </label>
              <input 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., DEFI_YIELD_OPTIMIZER"
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#AAFF00] transition-colors"
                style={mono}
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#AAFF00] font-black ml-1" style={mono}>
                MISSION_DESCRIPTION
              </label>
              <textarea 
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the cognitive functionality this skill provides..."
                rows={4}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#AAFF00] transition-colors"
                style={mono}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#AAFF00] font-black ml-1" style={mono}>
                ACCESS_FEE (tUSDC)
              </label>
              <input 
                required
                type="number"
                step="0.000001"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#AAFF00] transition-colors"
                style={mono}
              />
            </div>

            <div className="flex items-end">
              <button 
                type="submit"
                disabled={status === "submitting" || status === "done"}
                className={`w-full group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-xl font-black uppercase transition-all active:scale-95 disabled:opacity-60 ${
                  status === "done" 
                    ? "bg-[#AAFF00]/10 text-[#AAFF00] border border-[#AAFF00]/30" 
                    : "bg-[#AAFF00] text-black hover:shadow-[0_0_30px_rgba(170,255,0,0.4)]"
                }`}
                style={bebas}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    BROADCASTING...
                  </>
                ) : status === "done" ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    REGISTERED
                  </>
                ) : (
                  <>
                    <Rocket className="w-6 h-6" />
                    COMMIT_DEPLOYMENT
                  </>
                )}
              </button>
            </div>

            {status === "error" && (
              <div className="md:col-span-2 flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold" style={mono}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}
            {txHash && (
              <div className="md:col-span-2 text-center mt-2">
                <a 
                  href={getTxExplorerUrl(txHash)}
                  target="_blank" rel="noreferrer"
                  className="text-[10px] text-[#AAFF00] underline font-bold uppercase tracking-widest" style={mono}
                >
                  View Transaction on X Layer Explorer ↗
                </a>
              </div>
            )}
          </form>
        </div>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#AAFF00]/5 rounded-full blur-3xl -mr-16 -mb-16 pointer-events-none" />
      </div>
    </div>
  );
}

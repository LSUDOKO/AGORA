"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Cpu, User, Loader2, MessageSquare, Shield, RefreshCw, ExternalLink, Sparkles } from "lucide-react";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { agentRegistryAbi, addresses } from "../lib/contracts";
import { wagmiConfig } from "../lib/wagmiConfig";
import { getTxExplorerUrl } from "../lib/explorer";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function ChatInterface() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: 'PROTOCOL_ONLINE: Welcome to AGORA. I am your orchestration layer.\n\nTry commands:\n> find opportunities\n> audit 0x1234...\n> set risk 70\n> check portfolio\n> status\n> history',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncHash, setSyncHash] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Contract state
  const { data: agentId } = useReadContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "ownerToAgentId",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContractAsync, isPending: isSyncing } = useWriteContract();

  const handleSync = async () => {
    if (!agentId || agentId === 0n) return;

    try {
      setSyncMessage("Broadcasting sync receipt...");
      const hash = await writeContractAsync({
        address: addresses.agentRegistry,
        abi: agentRegistryAbi,
        functionName: "incrementTxCount",
        args: [agentId],
      });
      setSyncHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      } else {
        await waitForTransactionReceipt(wagmiConfig, { hash });
      }

      setSyncMessage("Agent telemetry synced on-chain.");
    } catch (error) {
      console.error(error);
      setSyncMessage(error instanceof Error ? error.message : "Failed to sync telemetry.");
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const json = await res.json();
      const reply = json.reply ?? json.error ?? "ORCHESTRATION_ERROR: No response from node.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply, timestamp: Date.now() }]);
      
      // Auto-sync on certain commands if agent exists
      if (agentId && agentId > 0n && (text.toLowerCase().includes("find") || text.toLowerCase().includes("audit"))) {
        await handleSync();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "CRITICAL_FAILURE: Connection to X Layer RPC timed out.", timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function applyPrompt(prompt: string) {
    setInput(prompt);
  }

  return (
    <div className="flex h-[700px] flex-col rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl overflow-hidden">
      {/* Header Area */}
      <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#AAFF00] flex items-center justify-center shadow-[0_0_20px_rgba(170,255,0,0.3)]">
            <Cpu className="text-black" size={24} />
          </div>
          <div>
            <h3 className="text-white text-2xl tracking-tighter" style={bebas}>NUCLEUS_ORCHESTRATOR</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#AAFF00] animate-pulse" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest" style={mono}>
                {agentId && agentId > 0n ? `Agent #${agentId.toString()} Online` : "X Layer Synchronized"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {agentId && agentId > 0n && (
             <button 
               onClick={() => void handleSync()}
               disabled={isSyncing}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#AAFF00]/10 border border-[#AAFF00]/20 text-[#AAFF00] text-[10px] font-bold uppercase tracking-widest hover:bg-[#AAFF00]/20 transition-all disabled:opacity-50"
               style={mono}
             >
               {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
               SYNC_L2
             </button>
           )}
           <div className="hidden md:flex items-center gap-4 text-slate-500">
             <Shield size={18} />
             <MessageSquare size={18} />
           </div>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        <div className="flex flex-wrap gap-3">
          {[
            "find opportunities",
            "check portfolio",
            "status",
            "history",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => applyPrompt(prompt)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition hover:border-[#AAFF00]/30 hover:text-[#AAFF00]"
              style={mono}
            >
              <Sparkles size={12} />
              {prompt}
            </button>
          ))}
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-end gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${
                msg.role === "user" ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" : "bg-white/5 border-white/10 text-[#AAFF00]"
              }`}>
                {msg.role === "user" ? <User size={14} /> : <Cpu size={14} />}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-[24px] px-6 py-4 text-sm leading-relaxed whitespace-pre-wrap transition-all ${
                  msg.role === "user"
                    ? "bg-cyan-500/10 text-cyan-50 border border-cyan-500/20 rounded-br-none"
                    : "bg-white/[0.04] text-slate-300 border border-white/10 rounded-bl-none font-medium"
                }`}
                style={msg.role === "assistant" ? mono : {}}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex items-end gap-3">
               <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#AAFF00]">
                  <Loader2 size={14} className="animate-spin" />
               </div>
               <div className="rounded-[24px] rounded-bl-none px-6 py-4 bg-white/[0.04] border border-white/10">
                  <span className="text-slate-500 text-xs uppercase tracking-widest animate-pulse" style={mono}>
                    Synthesizing...
                  </span>
               </div>
             </div>
          </div>
        )}
        {syncMessage ? (
          <div className="rounded-2xl border border-[#AAFF00]/20 bg-[#AAFF00]/5 px-5 py-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#AAFF00]" style={mono}>
              <RefreshCw size={12} />
              {syncMessage}
            </div>
            {syncHash ? (
              <a
                href={getTxExplorerUrl(syncHash)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-300 underline"
                style={mono}
              >
                View Sync Tx <ExternalLink size={12} />
              </a>
            ) : null}
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-8 bg-black/20 border-t border-white/10">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command or query for agentic routing..."
            disabled={loading}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-[#AAFF00]/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#AAFF00]/5 disabled:opacity-50"
            style={mono}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${
              input.trim() 
                ? "bg-[#AAFF00] text-black shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:scale-105" 
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <div className="mt-4 flex gap-4 text-[9px] text-slate-500 uppercase tracking-widest justify-center" style={mono}>
           <span>Press Enter to Broadcast</span>
           <span className="text-slate-800">|</span>
           <span>Gas Limit: 50,000 gwei</span>
        </div>
      </div>
    </div>
  );
}

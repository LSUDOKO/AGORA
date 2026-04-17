"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Cpu, User, Loader2, MessageSquare, Shield, RefreshCw } from "lucide-react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { agentRegistryAbi, addresses } from "../lib/contracts";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function ChatInterface() {
  const { address } = useAccount();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: 'PROTOCOL_ONLINE: Welcome to AGORA. I am your orchestration layer.\n\nTry commands:\n> find high_yield_skills\n> audit 0x_security_node\n> set risk_profile balanced\n> check network_activity',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Contract state
  const { data: agentId } = useReadContract({
    address: addresses.agentRegistry,
    abi: agentRegistryAbi,
    functionName: "ownerToAgentId",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, isPending: isSyncing } = useWriteContract();

  const handleSync = () => {
    if (!agentId || agentId === 0n) return;
    writeContract({
      address: addresses.agentRegistry,
      abi: agentRegistryAbi,
      functionName: "incrementTxCount",
      args: [agentId],
    });
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
        handleSync();
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
               onClick={handleSync}
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

"use client";

import ChatInterface from "../../components/ChatInterface";
import { MessageSquare, Shield, Cpu } from "lucide-react";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function ChatPage() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#AAFF00]/30 overflow-hidden flex flex-col">
      {/* Persistent Decorative Navbar Offset */}
      <div className="h-24 w-full" />

      <main className="relative z-10 flex-1 flex flex-col px-6 pb-6 max-w-[1600px] mx-auto w-full">
        {/* Header Area */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <MessageSquare className="w-4 h-4 text-[#AAFF00]" />
                 <span className="text-[10px] tracking-[0.4em] text-slate-500 uppercase" style={mono}>Neural_Interface_V1.0</span>
              </div>
              <h1 className="text-6xl md:text-7xl uppercase tracking-tighter leading-none" style={bebas}>
                 Agent <span className="text-[#AAFF00]">Comms</span>
              </h1>
           </div>

           <div className="flex gap-4">
              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                 <Shield className="w-4 h-4 text-[#AAFF00]" />
                 <span className="text-[10px] text-slate-400" style={mono}>ENCRYPTED</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                 <Cpu className="w-4 h-4 text-cyan-400" />
                 <span className="text-[10px] text-slate-400" style={mono}>X_LAYER_CORE</span>
              </div>
           </div>
        </header>

        {/* Chat Interface Container */}
        <div className="flex-1 rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl overflow-hidden shadow-2xl flex flex-col">
          <ChatInterface />
        </div>

        {/* Bottom Utility Bar */}
        <div className="mt-4 flex justify-between items-center px-6">
           <p className="text-[9px] text-slate-500" style={mono}>
              CONNECTED_TO: AGORA_PRIME_CORE // SESSION_ID: 8Xf2...Aks1
           </p>
           <div className="flex gap-6 uppercase text-[10px] text-[#AAFF00]" style={bebas}>
              <span>Status: Synchronized</span>
              <span className="text-slate-700">//</span>
              <span>Power: Optimal</span>
           </div>
        </div>
      </main>
    </div>
  );
}

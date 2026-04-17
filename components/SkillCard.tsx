"use client";

import { ShoppingCart, Star, Zap } from "lucide-react";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

interface SkillCardProps {
  icon: string;
  name: string;
  description: string;
  price: string;
  hires?: number;
  onHire?: () => void;
  loading?: boolean;
}

export default function SkillCard({ icon, name, description, price, hires, onHire, loading }: SkillCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-3xl transition-all hover:bg-white/[0.05] hover:border-[#AAFF00]/30 shadow-2xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <div className="flex flex-col items-end">
           <div className="px-4 py-1.5 rounded-full border border-[#AAFF00]/30 bg-[#AAFF00]/10 text-[#AAFF00] text-[10px] font-bold tracking-widest uppercase" style={mono}>
             {price}
           </div>
           <p className="mt-2 text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em]" style={mono}>Base_Protocol_Cost</p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <h3 className="text-3xl text-white uppercase tracking-tight" style={bebas}>{name}</h3>
        <p className="text-[11px] leading-relaxed text-slate-500 font-medium group-hover:text-slate-400 transition-colors" style={mono}>
          {description}
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 pt-6 border-t border-white/5">
        <div className="flex flex-col">
           <div className="flex items-center gap-1.5 text-[#AAFF00]">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-bold text-white tracking-widest" style={bebas}>{hires ?? 0}</span>
           </div>
           <p className="text-[8px] uppercase tracking-[0.2em] text-slate-700 font-bold" style={mono}>Verified_Hires</p>
        </div>
        
        <button
          onClick={onHire}
          disabled={loading}
          className="relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#000] transition-all hover:pr-8 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 group/btn"
          style={mono}
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? "LINKING_RPC..." : "Hire_Skill"}
            {!loading && <Zap size={10} className="group-hover/btn:translate-x-1 transition-transform" />}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#AAFF00] to-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>
      </div>
      
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#AAFF00]/5 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </article>
  );
}

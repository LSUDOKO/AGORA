"use client";

import { TrendingUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  helper: string;
}

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.06] hover:border-[#AAFF00]/30 hover:shadow-[0_0_40px_rgba(170,255,0,0.05)]">
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[9px] uppercase tracking-[0.4em] text-slate-500 group-hover:text-slate-400 transition-colors" style={mono}>
              {label.replace(" ", "_")}
            </p>
            <TrendingUp size={14} className="text-slate-700 group-hover:text-[#AAFF00] transition-colors" />
          </div>
          <h3 className="text-5xl text-white tracking-tight uppercase leading-none" style={bebas}>
            {value}
          </h3>
        </div>
        <p className="mt-6 text-[10px] text-slate-600 uppercase tracking-widest font-bold group-hover:text-slate-500 transition-colors" style={mono}>
          {helper}
        </p>
      </div>
      
      {/* Aesthetic mask */}
      <div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity p-2">
         <div className="w-12 h-[1px] bg-[#AAFF00]/30 rotate-45 translate-x-4 translate-y-4" />
      </div>
    </div>
  );
}

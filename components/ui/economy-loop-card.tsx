"use client";

import type { LucideIcon } from "lucide-react";

export interface LoopCardProps {
  step: string;
  label: string;
  sublabel: string;
  Icon: LucideIcon;
  desc: string;
  tech: string[];
  className?: string;
}

export function LoopCard({ step, label, sublabel, Icon, desc, tech, className = "" }: LoopCardProps) {
  return (
    <div
      className={`group relative flex flex-col gap-4 p-6 bg-white/5 border border-white/10 backdrop-blur-sm hover:border-[#AAFF00]/40 transition-all duration-300 rounded-2xl ${className}`}
    >
      {/* Step + icon row */}
      <div className="flex items-center justify-between">
        <span
          className="text-5xl leading-none text-[#AAFF00]/10 select-none"
          style={{ fontFamily: "'Bebas Neue', cursive" }}
        >
          {step}
        </span>
        <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-[#AAFF00]/40 group-hover:bg-[#AAFF00]/10 transition-all duration-300">
          <Icon size={18} className="text-[#AAFF00]" />
        </div>
      </div>

      {/* Labels */}
      <div>
        <h3
          className="text-2xl text-white tracking-wide leading-tight"
          style={{ fontFamily: "'Bebas Neue', cursive" }}
        >
          {label}
        </h3>
        <p
          className="text-[10px] text-[#AAFF00] tracking-[2px] uppercase mt-0.5"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {sublabel}
        </p>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-xs leading-5 flex-1" style={{ fontFamily: "Inter, sans-serif" }}>
        {desc}
      </p>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-1 pt-1">
        {tech.map((t) => (
          <span
            key={t}
            className="text-[9px] border border-white/5 bg-white/5 text-slate-500 px-2 py-0.5 rounded-md group-hover:border-[#AAFF00]/20 group-hover:text-slate-400 transition-all"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}


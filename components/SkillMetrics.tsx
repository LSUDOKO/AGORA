"use client";

import { useEffect, useState } from "react";
import { BarChart3, Activity, CheckCircle2 } from "lucide-react";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

interface SkillStat {
  name: string;
  usageCount: number;
  successRate: number;
}

export default function SkillMetrics() {
  const [skills, setSkills] = useState<SkillStat[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/agent/skills");
        if (!res.ok) return;
        const json = await res.json();
        if (Array.isArray(json.skills)) setSkills(json.skills);
      } catch {
        // silently ignore
      }
    };
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-3xl transition-all hover:bg-white/[0.05]">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#AAFF00] font-bold" style={mono}>Capability_Audit</p>
          <div className="flex items-center gap-3">
             <BarChart3 size={20} className="text-[#AAFF00]" />
             <h2 className="text-3xl text-white uppercase tracking-tight" style={bebas}>Skill_Metrics</h2>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        {skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-white/5 opacity-40">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest" style={mono}>Awaiting_Provider_Data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5" style={mono}>
              <div className="col-span-6">Capability</div>
              <div className="col-span-3 text-right">Invocations</div>
              <div className="col-span-3 text-right">Success_Rate</div>
            </div>
            
            <div className="space-y-2">
              {skills.map((s) => (
                <div key={s.name} className="group/item grid grid-cols-12 gap-4 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 items-center transition-all hover:bg-white/[0.04]">
                  <div className="col-span-6 flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF00] opacity-40 group-hover/item:opacity-100 transition-opacity" />
                     <p className="text-sm font-bold text-white uppercase tracking-tight" style={bebas}>{s.name}</p>
                  </div>
                  
                  <div className="col-span-3 text-right">
                     <p className="text-xs font-medium text-slate-400 tabular-nums" style={mono}>{s.usageCount}</p>
                  </div>
                  
                  <div className="col-span-3 text-right flex flex-col items-end gap-1">
                     <p className={`text-xs font-bold tabular-nums ${s.successRate >= 0.7 ? "text-[#AAFF00]" : "text-amber-400"}`} style={mono}>
                       {(s.successRate * 100).toFixed(0)}%
                     </p>
                     <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${s.successRate >= 0.7 ? "bg-[#AAFF00]" : "bg-amber-400"}`}
                          style={{ width: `${s.successRate * 100}%` }}
                        />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#AAFF00]/5 blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

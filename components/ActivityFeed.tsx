"use client";

import { Activity, Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  amount: string;
  timeAgo: string;
}

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Activity className="text-[#AAFF00]" size={20} />
          <h2 className="text-3xl text-white uppercase tracking-tight" style={bebas}>Network Activity</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#AAFF00]/30 bg-[#AAFF00]/5 text-[10px] text-[#AAFF00] font-bold uppercase tracking-widest" style={mono}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#AAFF00] animate-pulse" />
          Live_Feed
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="group relative flex items-start gap-5 p-5 rounded-3xl border border-white/5 bg-white/[0.02] transition-all hover:bg-white/[0.05] hover:border-white/10">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 text-2xl group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[200px]" style={mono}>{item.title}</h3>
                <span className={`text-xl font-bold uppercase tracking-tight ${item.amount === "Completed" ? "text-[#AAFF00]" : "text-white"}`} style={bebas}>
                  {item.amount}
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest leading-relaxed mb-3" style={mono}>{item.subtitle}</p>
              <div className="flex items-center gap-2 text-[9px] text-slate-700 font-bold uppercase tracking-[0.2em]" style={mono}>
                 <Clock size={10} />
                 {item.timeAgo}
              </div>
            </div>
            
            {/* Hover Decorator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
               <Activity size={40} className="text-[#AAFF00]" />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 opacity-40">
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Awaiting protocol signals...</p>
          </div>
        )}
      </div>
    </section>
  );
}

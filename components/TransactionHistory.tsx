"use client";

import { useEffect, useState } from "react";
import { History, Filter, Clock } from "lucide-react";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

interface TxEvent {
  event: string;
  timestamp: number;
  status: string;
}

const EVENT_TYPES = ["all", "swap", "audit", "hire"] as const;
const STATUSES = ["all", "completed", "failed"] as const;

type EventType = (typeof EVENT_TYPES)[number];
type StatusType = (typeof STATUSES)[number];

export default function TransactionHistory() {
  const [events, setEvents] = useState<TxEvent[]>([]);
  const [typeFilter, setTypeFilter] = useState<EventType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusType>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({ type: typeFilter, status: statusFilter, limit: "20" });
        const res = await fetch(`/api/agent/history?${params}`);
        if (!res.ok) return;
        const json = await res.json();
        if (Array.isArray(json.events)) setEvents(json.events);
      } catch {
        // silently ignore
      }
    };
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, [typeFilter, statusFilter]);

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-3xl transition-all hover:bg-white/[0.05]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#AAFF00] font-bold" style={mono}>Ledger_Overview</p>
          <div className="flex items-center gap-3">
             <History size={20} className="text-[#AAFF00]" />
             <h2 className="text-3xl text-white uppercase tracking-tight" style={bebas}>Protocol_History</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as EventType)}
              className="bg-transparent text-[10px] text-white font-bold uppercase tracking-widest px-4 py-2 focus:outline-none cursor-pointer hover:text-[#AAFF00] transition-colors appearance-none"
              style={mono}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t} className="bg-black text-white">
                  TYPE: {t}
                </option>
              ))}
            </select>
            <div className="w-[1px] h-4 bg-white/10" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusType)}
              className="bg-transparent text-[10px] text-white font-bold uppercase tracking-widest px-4 py-2 focus:outline-none cursor-pointer hover:text-[#AAFF00] transition-colors appearance-none"
              style={mono}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-black text-white">
                  STATUS: {s}
                </option>
              ))}
            </select>
            <div className="pr-3 text-slate-600">
               <Filter size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-white/5 opacity-40">
             <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4">
                <Clock size={20} />
             </div>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest" style={mono}>No_Ledger_Entries_Found</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5" style={mono}>
              <div className="col-span-3">Timestamp</div>
              <div className="col-span-6">Operation_Identifer</div>
              <div className="col-span-3 text-right">Status</div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-2 mt-2">
              {events.map((e, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 items-center transition-colors hover:bg-white/[0.04] group/item">
                  <div className="col-span-3 text-[11px] tabular-nums text-slate-400 font-medium" style={mono}>
                    {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div className="col-span-6 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-20 group-hover/item:opacity-60 transition-opacity" />
                     <code className="text-xs text-cyan-400 font-medium tracking-tight" style={mono}>{e.event}</code>
                  </div>
                  <div className="col-span-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${
                        e.status === "completed"
                          ? "bg-[#AAFF00]/10 text-[#AAFF00] border border-[#AAFF00]/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      }`}
                      style={mono}
                    >
                      <span className={`w-1 h-1 rounded-full ${e.status === "completed" ? "bg-[#AAFF00]" : "bg-rose-500"} animate-pulse`} />
                      {e.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[80px] rounded-full opacity-5 pointer-events-none" />
    </div>
  );
}

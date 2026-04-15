"use client";

import { useEffect, useState } from "react";

interface TxEvent {
  event: string;
  timestamp: number;
  status: string;
}

const EVENT_TYPES = ["all", "swap", "audit", "hire"] as const;
const STATUSES = ["all", "completed", "failed"] as const;

type EventType = (typeof EVENT_TYPES)[number];
type StatusType = (typeof STATUSES)[number];

function deriveStatus(event: string): string {
  if (event === "swap:completed") return "completed";
  if (event === "opportunity:rejected") return "failed";
  return "completed";
}

function matchesType(event: string, type: EventType): boolean {
  if (type === "all") return true;
  if (type === "swap") return event.startsWith("swap");
  if (type === "audit") return event.startsWith("opportunity");
  if (type === "hire") return event.startsWith("hire");
  return true;
}

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
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">History</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Transactions</h2>
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as EventType)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t} className="bg-slate-900">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusType)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-slate-900">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No events yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-4">Time</th>
                <th className="pb-2 pr-4">Event</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.map((e, i) => (
                <tr key={i}>
                  <td className="py-2 pr-4 tabular-nums text-slate-400">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-cyan-300">{e.event}</td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        e.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

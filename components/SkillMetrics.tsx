"use client";

import { useEffect, useState } from "react";

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
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Skill Performance</p>
      <h2 className="mt-1 text-lg font-semibold text-white">Metrics</h2>
      <div className="mt-4 overflow-x-auto">
        {skills.length === 0 ? (
          <p className="text-sm text-slate-500">No skill data yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-4">Skill</th>
                <th className="pb-2 pr-4 text-right">Uses</th>
                <th className="pb-2 text-right">Success</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {skills.map((s) => (
                <tr key={s.name}>
                  <td className="py-2 pr-4 font-medium text-white">{s.name}</td>
                  <td className="py-2 pr-4 text-right tabular-nums text-slate-300">
                    {s.usageCount}
                  </td>
                  <td
                    className={`py-2 text-right tabular-nums font-medium ${
                      s.successRate >= 0.7 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {(s.successRate * 100).toFixed(0)}%
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

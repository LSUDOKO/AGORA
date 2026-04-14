interface LeaderboardRow {
  agentId: number;
  value: number;
}

interface LeaderboardTableProps {
  title: string;
  unit: string;
  rows: LeaderboardRow[];
}

export default function LeaderboardTable({ title, unit, rows }: LeaderboardTableProps) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Leaderboard</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => {
          const width = `${Math.max((row.value / maxValue) * 100, 8)}%`;
          const isTopThree = index < 3;

          return (
            <div key={`${title}-${row.agentId}`} className="rounded-2xl border border-white/8 bg-slate-950/50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      isTopThree ? "bg-amber-400/20 text-amber-200" : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">Agent #{row.agentId}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{unit}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-cyan-200">{row.value.toLocaleString()}</p>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div className={`h-2 rounded-full ${isTopThree ? "bg-amber-300" : "bg-cyan-400"}`} style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

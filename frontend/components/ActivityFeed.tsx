interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  amount: string;
  timeAgo: string;
}

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live activity</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Agent Activity Feed</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-300">
          <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-slate-950/50 p-4">
            <div className="text-2xl">{item.icon}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-white">{item.title}</h3>
                <span className="text-sm font-semibold text-cyan-200">{item.amount}</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{item.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

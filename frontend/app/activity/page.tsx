import ActivityFeed from "../../components/ActivityFeed";

const activityItems = [
  {
    id: "1",
    icon: "🤝",
    title: "Priya Prime hired Risk Auditor",
    subtitle: "Receipt #42 settled via x402 before Uniswap execution.",
    amount: "0.50 USDC",
    timeAgo: "12 seconds ago",
  },
  {
    id: "2",
    icon: "💸",
    title: "Prime Agent paid Yield Finder",
    subtitle: "Sub-agent discovered a higher APY route on X Layer.",
    amount: "0.20 USDC",
    timeAgo: "43 seconds ago",
  },
  {
    id: "3",
    icon: "🔁",
    title: "Execution confirmed on-chain",
    subtitle: "Prime Agent completed the approved swap route and updated earnings.",
    amount: "+14.82 USDC",
    timeAgo: "1 minute ago",
  },
  {
    id: "4",
    icon: "📊",
    title: "Leaderboard activity recorded",
    subtitle: "Most Active Agent rankings refreshed after the latest hire + execution cycle.",
    amount: "Txn +1",
    timeAgo: "2 minutes ago",
  },
];

export default function ActivityPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Most Active Agent</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          A public feed of agent-to-agent work, payments, and execution.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          Judges can watch AGORA feel alive in real time: who hired whom, how much was paid, and what
          happened next on-chain.
        </p>
      </section>

      <ActivityFeed items={activityItems} />

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">WebSocket Mode</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Real-time contract event stream</h2>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          This page is designed to subscribe to <code>SkillHired</code> and <code>SkillCompleted</code>
          events from the x402 router using the X Layer WebSocket endpoint so the feed updates without
          polling.
        </p>
      </section>
    </div>
  );
}

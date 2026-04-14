import LiveLeaderboard from "../../components/LiveLeaderboard";

export default function LeaderboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Leaderboard</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Compete for the Most Active Agent prize with visible, legitimate volume.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          AGORA tracks both transaction velocity and x402 payment flow so judges can verify the economy
          loop is not just theoretical — it is producing measurable on-chain behavior.
        </p>
      </section>

      <LiveLeaderboard />

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm leading-7 text-slate-400">
        Refresh target: every 10 seconds from <code>LeaderboardTracker.getTopAgents(10)</code> on X Layer.
      </section>
    </div>
  );
}

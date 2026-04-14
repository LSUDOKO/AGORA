const steps = [
  { title: "Scan", description: "Prime Agent scans X Layer opportunities via on-chain intelligence." },
  { title: "Hire", description: "Prime hires a specialist from the Skills Marketplace." },
  { title: "Pay", description: "An x402 receipt settles the service in USDC/tUSDC on-chain." },
  { title: "Execute", description: "Approved strategy executes through integrated swap routes." },
  { title: "Earn", description: "Results flow back to Priya and the leaderboard updates live." },
];

export default function EconomyLoop() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Economy Loop</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">The Earn-Pay-Earn Cycle</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.title} className="relative rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.25em] text-cyan-300">0{index + 1}</span>
              {index < steps.length - 1 ? <span className="text-slate-600">→</span> : null}
            </div>
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

import HireSkillButton from "../../components/HireSkillButton";
import SkillCard from "../../components/SkillCard";

const skills = [
  {
    id: 1,
    skillId: "AG-001",
    icon: "📈",
    name: "Yield Finder",
    description: "Scans Onchain OS for live liquidity pools. Analyzes APY, reserves, and token risk.",
    price: "0.3 tUSDC",
    priceUSDC: 300_000n,
    hires: 124,
  },
  {
    id: 2,
    skillId: "AG-092",
    icon: "🛡️",
    name: "Risk Auditor",
    description: "Weighted 4-factor pool scoring: liquidity, holders, volatility, cluster risk. Pass >= 65.",
    price: "0.5 tUSDC",
    priceUSDC: 500_000n,
    hires: 96,
  },
  {
    id: 3,
    skillId: "AG-145",
    icon: "⛽",
    name: "Gas Optimizer",
    description: "Monitors gas price trend (rising/falling/stable). Recommends delay when gas is high.",
    price: "0.1 tUSDC",
    priceUSDC: 100_000n,
    hires: 80,
  },
  {
    id: 4,
    skillId: "AG-330",
    icon: "🔮",
    name: "Sentiment Oracle",
    description: "Aggregates Onchain OS signals into a [-100, 100] sentiment score with confidence level.",
    price: "0.2 tUSDC",
    priceUSDC: 200_000n,
    hires: 55,
  },
  {
    id: 5,
    skillId: "AG-552",
    icon: "💧",
    name: "Liquidity Monitor",
    description: "Tracks pool reserve changes. Alerts on >20% shift. Health score 0-100 per pool.",
    price: "0.2 tUSDC",
    priceUSDC: 200_000n,
    hires: 41,
  },
  {
    id: 6,
    skillId: "AG-801",
    icon: "💼",
    name: "Portfolio Tracker",
    description: "Multi-token balance snapshots with USD value and P&L tracking over time.",
    price: "0.1 tUSDC",
    priceUSDC: 100_000n,
    hires: 38,
  },
];

const strategies = [
  {
    id: "conservative-yield",
    name: "Conservative Yield",
    author: "AGORA Team",
    description: "Low-risk strategy targeting stable pools with high liquidity. Avoids volatile tokens.",
    risk: 80,
    protocols: ["Uniswap V3"],
    uses: 142,
  },
  {
    id: "balanced-growth",
    name: "Balanced Growth",
    author: "AGORA Team",
    description: "Moderate risk with diversified protocol exposure. Targets 10-20% APY opportunities.",
    risk: 65,
    protocols: ["Uniswap V3", "OKX DEX"],
    uses: 89,
  },
  {
    id: "aggressive-alpha",
    name: "Aggressive Alpha",
    author: "AGORA Team",
    description: "Higher risk tolerance for maximum yield. Scans emerging pools and new token pairs.",
    risk: 50,
    protocols: ["Uniswap V3", "OKX DEX"],
    uses: 34,
  },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-sm text-slate-400">NETWORK STATUS: OPTIMAL</p>
        </div>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">SKILLS MARKETPLACE</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Browse available protocol skills for immediate x402 execution on X Layer Testnet.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          Each skill is listed with transparent pricing, reusable capability, and a one-click x402 hire
          flow settled directly on X Layer.
        </p>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Available Skills</h2>
          <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-300">
            {skills.length} Skills Available
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <SkillCard
                icon={skill.icon}
                name={skill.name}
                description={skill.description}
                price={skill.price}
                hires={skill.hires}
                skillId={skill.skillId}
              />
              <HireSkillButton skillId={skill.id} priceUSDC={skill.priceUSDC} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Strategy Marketplace</h2>
            <p className="mt-1 text-slate-400">Pre-built agent strategies for immediate deployment</p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10">
              Import JSON
            </button>
            <button className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">
              Create Strategy
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-500/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                  {strategy.author}
                </span>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span className="text-sm text-slate-400">{strategy.uses} uses</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white">{strategy.name}</h3>
              <p className="mt-2 text-sm text-slate-400">{strategy.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {strategy.protocols.map((protocol) => (
                  <span
                    key={protocol}
                    className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-300"
                  >
                    {protocol}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-slate-500">Risk</span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-500"
                    style={{ width: `${(strategy.risk / 100) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-white">{strategy.risk}</span>
              </div>

              <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="flex-1 rounded-full border border-white/20 py-2 text-sm text-white hover:bg-white/10">
                  Export
                </button>
                <button className="flex-1 rounded-full bg-cyan-500 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400">
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
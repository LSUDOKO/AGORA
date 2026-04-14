import HireSkillButton from "../../components/HireSkillButton";
import SkillCard from "../../components/SkillCard";

const skills = [
  {
    id: 1,
    icon: "📈",
    name: "Yield Finder",
    description: "Scans Uniswap liquidity venues on X Layer for the strongest deployable yield paths.",
    price: "0.20 USDC",
    priceUSDC: 200_000n,
    hires: 124,
  },
  {
    id: 2,
    icon: "🛡️",
    name: "Risk Auditor",
    description: "Checks liquidity depth, pool balance, and execution safety before any Prime Agent trade.",
    price: "0.50 USDC",
    priceUSDC: 500_000n,
    hires: 96,
  },
  {
    id: 3,
    icon: "⛽",
    name: "Gas Optimizer",
    description: "Advises the cheapest submission windows and route timing for X Layer execution.",
    price: "0.10 USDC",
    priceUSDC: 100_000n,
    hires: 80,
  },
  {
    id: 4,
    icon: "🔍",
    name: "Onchain Analyst",
    description: "Turns wallet, pool, and protocol signals into actionable summaries for Prime Agents.",
    price: "0.30 USDC",
    priceUSDC: 300_000n,
    hires: 55,
  },
  {
    id: 5,
    icon: "⚡",
    name: "Arb Scanner",
    description: "Monitors cross-pool and cross-route inefficiencies that can be captured in seconds.",
    price: "0.40 USDC",
    priceUSDC: 400_000n,
    hires: 41,
  },
  {
    id: 6,
    icon: "🚨",
    name: "Liquidation Watch",
    description: "Flags emerging liquidation opportunities and risk cascades before the market reacts.",
    price: "0.25 USDC",
    priceUSDC: 250_000n,
    hires: 38,
  },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Skills Arena</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Browse, compare, and hire specialist agents like an on-chain App Store.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          Each skill is listed with transparent pricing, reusable capability, and a one-click x402 hire
          flow settled directly on X Layer.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {skills.map((skill) => (
          <div key={skill.id} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
            <SkillCard
              icon={skill.icon}
              name={skill.name}
              description={skill.description}
              price={skill.price}
              hires={skill.hires}
            />
            <HireSkillButton skillId={skill.id} priceUSDC={skill.priceUSDC} />
          </div>
        ))}
      </section>
    </div>
  );
}

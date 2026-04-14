import AgentOverview from "../../components/AgentOverview";
import DashboardStats from "../../components/DashboardStats";
import DeployAgentButton from "../../components/DeployAgentButton";
import EconomyLoop from "../../components/EconomyLoop";
import LatestReceipt from "../../components/LatestReceipt";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">AGORA Dashboard</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Priya&apos;s Prime Agent orchestrates a live on-chain economy.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Connect your wallet, deploy your Prime Agent, hire specialist skills through x402 receipts,
            and watch your autonomous earn-pay-earn loop compound on X Layer.
          </p>
        </div>
      </section>

      <DashboardStats />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AgentOverview />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Deploy</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Launch Your Prime Agent</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Register your on-chain agent identity, bind it to your wallet, and unlock access to the
            AGORA Skills Marketplace.
          </p>
          <div className="mt-6">
            <DeployAgentButton />
          </div>
        </div>
      </section>

      <LatestReceipt />

      <EconomyLoop />
    </div>
  );
}

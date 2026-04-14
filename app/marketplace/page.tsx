import MarketplaceGrid from "../../components/MarketplaceGrid";

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

      <MarketplaceGrid />
    </div>
  );
}

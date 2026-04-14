"use client";

interface SkillCardProps {
  icon: string;
  name: string;
  description: string;
  price: string;
  hires?: number;
  onHire?: () => void;
  loading?: boolean;
}

export default function SkillCard({ icon, name, description, price, hires, onHire, loading }: SkillCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-400/30 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-3xl">{icon}</div>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
          {price}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-white">{name}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{description}</p>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{hires ?? 0} hires</p>
        <button
          onClick={onHire}
          disabled={loading}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Processing..." : "Hire via x402"}
        </button>
      </div>
    </article>
  );
}

"use client";

interface SkillCardProps {
  icon: string;
  name: string;
  description: string;
  price: string;
  hires?: number;
  onHire?: () => void;
  loading?: boolean;
  skillId?: string;
}

export default function SkillCard({ icon, name, description, price, hires, onHire, loading, skillId }: SkillCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-400/30 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex flex-col items-end gap-1">
          {skillId && (
            <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-xs font-mono text-slate-400">
              ID: {skillId}
            </span>
          )}
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
            {price}
          </span>
        </div>
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

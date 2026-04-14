import { toXkoAddress } from "../lib/address";

interface AgentCardProps {
  name: string;
  address: string;
  status: string;
  tags: string[];
  agentId?: number;
}

export default function AgentCard({ name, address, status, tags, agentId }: AgentCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(0,0,0,0.2)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Prime Agent</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{name}</h2>
          <p className="mt-2 text-sm text-slate-400">{toXkoAddress(address)}</p>
          {agentId ? <p className="mt-1 text-xs text-slate-500">Agent ID #{agentId}</p> : null}
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          {status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}

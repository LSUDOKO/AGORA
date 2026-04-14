interface StatCardProps {
  label: string;
  value: string;
  helper: string;
}

export default function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <h3 className="mt-3 text-3xl font-semibold text-white">{value}</h3>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

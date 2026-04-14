interface ReceiptProps {
  service: string;
  protocol: string;
  task: string;
  amount: string;
  timestamp: string;
  status: string;
}

export default function X402Receipt({ service, protocol, task, amount, timestamp, status }: ReceiptProps) {
  return (
    <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Latest x402 Receipt</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Machine-to-Machine Payment Proof</h2>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          {status}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ReceiptField label="Service" value={service} />
        <ReceiptField label="Protocol" value={protocol} />
        <ReceiptField label="Task" value={task} />
        <ReceiptField label="Amount Paid" value={amount} />
        <ReceiptField label="Timestamp" value={timestamp} />
      </div>
    </section>
  );
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

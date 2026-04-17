import { FileText, ShieldCheck, Cpu, Fingerprint, Receipt } from "lucide-react";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

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
    <section className="group relative overflow-hidden rounded-[2.5rem] border border-[#AAFF00]/20 bg-white/[0.03] p-10 backdrop-blur-3xl transition-all hover:bg-white/[0.05]">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-10 text-[#AAFF00] group-hover:opacity-20 transition-opacity">
         <ShieldCheck size={120} />
      </div>

      <div className="relative z-10 mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#AAFF00]/20 bg-[#AAFF00]/5 text-[#AAFF00] text-[9px] font-bold tracking-widest uppercase" style={mono}>
            <Receipt size={12} />
            M2M_Payment_Proof_Verified
          </div>
          <h2 className="text-4xl text-white uppercase tracking-tight" style={bebas}>x402_Receipt_Payload</h2>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest" style={mono}>STATUS:</span>
           <span className="rounded-full border border-[#AAFF00]/40 bg-[#AAFF00]/10 px-4 py-1.5 text-[10px] font-bold text-[#AAFF00] uppercase tracking-widest" style={mono}>
             {status}
           </span>
        </div>
      </div>

      <div className="relative z-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <ReceiptField label="Service" value={service} icon={<Cpu size={14} />} />
        <ReceiptField label="Protocol" value={protocol} icon={<Fingerprint size={14} />} />
        <ReceiptField label="Task" value={task} icon={<FileText size={14} />} />
        <ReceiptField label="Settlement" value={amount} highlight />
        <ReceiptField label="Timestamp" value={timestamp} />
      </div>
      
      {/* Watermark */}
      <div className="absolute bottom-6 right-10 text-[8px] text-slate-800 font-bold uppercase tracking-[0.5em] select-none pointer-events-none" style={mono}>
        AGORA_SECURED_PAYMENT_CHANNEL_0x1952
      </div>
    </section>
  );
}

function ReceiptField({ label, value, icon, highlight }: { label: string; value: string; icon?: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={`group/field relative rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04] ${highlight ? 'border-[#AAFF00]/30' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon && <div className="text-[#AAFF00] opacity-60 group-hover/field:opacity-100 transition-opacity">{icon}</div>}
        <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold" style={mono}>{label}</p>
      </div>
      <p className={`text-xs font-bold truncate ${highlight ? "text-[#AAFF00]" : "text-white"}`} style={mono}>
        {value}
      </p>
    </div>
  );
}

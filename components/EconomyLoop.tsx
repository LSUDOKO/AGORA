import { Cpu, Zap, CreditCard, Play, TrendingUp } from "lucide-react";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const steps = [
  { 
    title: "Scan", 
    description: "Intelligence layer scans X Layer for real-time arbitrage and yield opportunities.",
    icon: <Cpu size={18} />
  },
  { 
    title: "Hire", 
    description: "Prime Agent autonomously hires specialist providers from the capability matrix.",
    icon: <Zap size={18} />
  },
  { 
    title: "Pay", 
    description: "Atomic settlement via x402 payment router using tUSDC/USDC gas-efficient routes.",
    icon: <CreditCard size={18} />
  },
  { 
    title: "Execute", 
    description: "Cross-protocol execution scripts trigger on-chain settlement hooks.",
    icon: <Play size={18} />
  },
  { 
    title: "Earn", 
    description: "Yield is harvested, value is captured, and the leaderboard recalibrates.",
    icon: <TrendingUp size={18} />
  },
];

export default function EconomyLoop() {
  return (
    <section className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-3xl transition-all hover:bg-white/[0.05]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#AAFF00] font-bold" style={mono}>Lifecycle_Automation</p>
          <h2 className="text-4xl text-white uppercase tracking-tight" style={bebas}>The Earn-Pay-Earn Cycle</h2>
        </div>
        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-right" style={mono}>
          Protocol_Phase_Alignment
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.title} className="relative group/step p-6 rounded-3xl border border-white/5 bg-white/[0.02] transition-all hover:bg-white/[0.04] hover:border-[#AAFF00]/30">
            <div className="mb-6 flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#AAFF00] group-hover/step:scale-110 transition-transform duration-500">
                {step.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-700 tracking-widest" style={mono}>0{index + 1}</span>
            </div>
            
            <h3 className="text-xl text-white uppercase tracking-tight mb-3" style={bebas}>{step.title}</h3>
            <p className="text-[11px] leading-relaxed text-slate-500 font-medium group-hover/step:text-slate-400 transition-colors" style={mono}>
              {step.description}
            </p>
            
            {/* Connector Line (Desktop Only) */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/4 -right-3 w-6 h-[1px] bg-white/10 z-10" />
            )}
            
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-[#AAFF00]/5 blur-2xl rounded-full opacity-0 group-hover/step:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
      
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}

import { Trophy, Medal, Target } from "lucide-react";

const bebas = { fontFamily: "'Bebas Neue', cursive" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

interface LeaderboardRow {
  agentId: number;
  value: number;
}

interface LeaderboardTableProps {
  title: string;
  unit: string;
  rows: LeaderboardRow[];
}

export default function LeaderboardTable({ title, unit, rows }: LeaderboardTableProps) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <section className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-3xl transition-all hover:bg-white/[0.05]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#AAFF00] font-bold" style={mono}>Node_Performance</p>
          <div className="flex items-center gap-3">
             <Trophy size={20} className="text-[#AAFF00]" />
             <h2 className="text-4xl text-white uppercase tracking-tight" style={bebas}>{title}</h2>
          </div>
        </div>
        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-right" style={mono}>
          Calculated_at_Protocol_Settlement
        </div>
      </div>

      <div className="space-y-6">
        {rows.map((row, index) => {
          const width = `${Math.max((row.value / maxValue) * 100, 8)}%`;
          const isTopThree = index < 3;

          return (
            <div key={`${title}-${row.agentId}`} className="group/item relative rounded-3xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04] hover:border-white/10 overflow-hidden">
               <div className="relative z-10 flex items-center justify-between gap-6 mb-4">
                  <div className="flex items-center gap-6">
                     <span
                       className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black ${
                         isTopThree 
                           ? "bg-[#AAFF00]/10 text-[#AAFF00] border border-[#AAFF00]/20" 
                           : "bg-white/5 text-slate-500 border border-white/10"
                       }`}
                       style={bebas}
                     >
                       {index + 1}
                     </span>
                     
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <p className="text-xl text-white uppercase tracking-tight" style={bebas}>Agent_ID_{row.agentId}</p>
                           {isTopThree && <Medal size={14} className="text-[#AAFF00]" />}
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold" style={mono}>{unit}</p>
                     </div>
                  </div>
                  
                  <div className="text-right">
                     <div className="text-2xl text-white font-black tracking-tight" style={bebas}>{row.value.toLocaleString()}</div>
                     <p className="text-[8px] text-slate-700 font-bold uppercase tracking-widest" style={mono}>RAW_TELEMETRY</p>
                  </div>
               </div>
               
               {/* Progress Bar Container */}
               <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                      isTopThree ? "bg-gradient-to-r from-[#AAFF00] to-cyan-400" : "bg-slate-700"
                    }`} 
                    style={{ width }} 
                  >
                     <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/20" />
                  </div>
               </div>
               
               {/* Decorative Background Elements */}
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover/item:opacity-10 transition-opacity">
                  <Target size={60} />
               </div>
            </div>
          );
        })}
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#AAFF00]/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}

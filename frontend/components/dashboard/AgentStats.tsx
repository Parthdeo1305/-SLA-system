import { Users, TrendingUp, TrendingDown, Award } from 'lucide-react';

interface AgentStatsProps {
  agents: {
    _id: string;
    name: string;
    total: number;
    delivered: number;
    delayed: number;
  }[];
}

export default function AgentStats({ agents }: AgentStatsProps) {
  if (agents.length === 0) return null;

  const topAgent = [...agents].sort((a, b) => b.delivered - a.delivered)[0];
  const mostDelayed = [...agents].sort((a, b) => b.delayed - a.delayed)[0];

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col h-full shadow-xl">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2">
        <Users size={18} className="text-[var(--color-brand-text)]" />
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Agent Performance</h3>
      </div>

      <div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Performer */}
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--badge-delivered-text)] mb-1">
              <Award size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Top Performer</span>
            </div>
            <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{topAgent.name}</p>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">{topAgent.delivered}</span>
            <span className="text-xs text-emerald-500 mb-1">Deliveries</span>
          </div>
        </div>

        {/* Attention Needed */}
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--color-danger-text)] mb-1">
              <TrendingDown size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Critical Focus</span>
            </div>
            <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{mostDelayed.name}</p>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">{mostDelayed.delayed}</span>
            <span className="text-xs text-red-500 mb-1">Delays</span>
          </div>
        </div>

        {/* Detailed List */}
        <div className="md:col-span-2 pt-2">
           <table className="w-full text-left text-xs">
             <thead>
               <tr className="text-[var(--color-text-muted)] font-semibold border-b border-[var(--color-border)]">
                 <th className="pb-2">Agent Name</th>
                 <th className="pb-2 text-right">Total</th>
                 <th className="pb-2 text-right text-[var(--color-danger-text)]">Delayed</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[var(--color-border)]">
               {agents.slice(0, 5).map((a) => (
                 <tr key={a._id} className="group">
                   <td className="py-2.5 text-[var(--color-text-primary)] font-medium truncate max-w-[120px]">{a.name}</td>
                   <td className="py-2.5 text-right text-[var(--color-text-muted)]">{a.total}</td>
                   <td className="py-2.5 text-right font-bold text-[var(--color-danger-text)]/80">{a.delayed}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

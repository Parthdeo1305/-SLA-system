import { PieChart, List, Triangle } from 'lucide-react';

interface DelayAnalyticsProps {
  reasons: { _id: string; count: number }[];
  locations: { _id: string; shipments: number; delays: number }[];
}

export default function DelayAnalytics({ reasons, locations }: DelayAnalyticsProps) {
  const maxReasonCount = Math.max(...reasons.map(r => r.count), 1);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col h-full shadow-xl">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2">
        <PieChart size={18} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Delay Root Causes</h3>
      </div>

      <div className="p-5 flex-1 space-y-6">
        {/* Reasons List */}
        <div className="space-y-4">
          {reasons.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] italic">No delay data recorded.</p>
          ) : (
            reasons.map((r) => (
              <div key={r._id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white">{r._id}</span>
                  <span className="text-[var(--color-text-muted)]">{r.count} shipments</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(r.count / maxReasonCount) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-4">
            <Triangle size={14} className="text-amber-400 rotate-180" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Delayed Hubs</h4>
          </div>
          <div className="space-y-3">
            {locations.map((loc) => (
              <div key={loc._id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-xs">
                <span className="font-medium text-white">{loc._id}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--color-text-muted)]">{loc.shipments} total</span>
                  <span className="text-red-400 font-bold">{loc.delays} delayed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

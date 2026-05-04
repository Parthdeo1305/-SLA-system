import Link from 'next/link';
import { AlertCircle, ChevronRight, User, MapPin } from 'lucide-react';
import SLAIndicator from './SLAIndicator';

interface CriticalPanelProps {
  shipments: any[];
}

export default function CriticalPanel({ shipments }: CriticalPanelProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col h-full shadow-xl">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-red-950/10">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Critical Shipments</h3>
        </div>
        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase">Immediate Action</span>
      </div>

      <div className="flex-1 divide-y divide-[var(--color-border)]">
        {shipments.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-muted)] text-sm italic">
            No critical shipments at the moment.
          </div>
        ) : (
          shipments.map((s) => (
            <Link 
              key={s._id} 
              href={`/orders/${s._id}`}
              className="block p-4 hover:bg-white/5 transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-mono font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {s.orderId}
                </span>
                <SLAIndicator deadline={s.promisedDeliveryTime} />
              </div>
              
              <div className="grid grid-cols-2 gap-y-2">
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                  <User size={12} className="text-indigo-400/70" />
                  <span className="truncate">{s.deliveryAgent?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                  <MapPin size={12} className="text-indigo-400/70" />
                  <span className="truncate">{s.deliveryAddress?.city || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-300/80 uppercase tracking-tight">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {s.status}
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-end text-[10px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
                VIEW DETAILS <ChevronRight size={10} className="ml-1" />
              </div>
            </Link>
          ))
        )}
      </div>
      
      <Link 
        href="/orders?delayed=true" 
        className="p-3 text-center text-xs font-semibold text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-all border-t border-[var(--color-border)]"
      >
        View All Delayed
      </Link>
    </div>
  );
}

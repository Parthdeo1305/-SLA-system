import { useState } from 'react';
import { PieChart, Triangle, X } from 'lucide-react';
import ordersApi, { Order } from '@/services/api/orders';
import OrdersTable from './OrdersTable';

interface DelayAnalyticsProps {
  reasons: { _id: string; count: number }[];
  locations: { _id: string; shipments: number; delays: number }[];
}

export default function DelayAnalytics({ reasons, locations }: DelayAnalyticsProps) {
  const maxReasonCount = Math.max(...reasons.map(r => r.count), 1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalOrders, setModalOrders] = useState<Order[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const openReasonModal = async (reasonId: string) => {
    const displayReason = reasonId || 'Unspecified';
    setModalTitle(`Orders Delayed by: ${displayReason}`);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await ordersApi.list({ delayReason: displayReason, limit: 100 });
      setModalOrders(res.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  const openHubModal = async (cityId: string) => {
    setModalTitle(`Delayed Orders in Hub: ${cityId}`);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await ordersApi.list({ city: cityId, delayed: true, limit: 100 });
      setModalOrders(res.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col h-full shadow-xl">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2">
          <PieChart size={18} className="text-[var(--color-brand-text)]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Delay Root Causes</h3>
        </div>

        <div className="p-5 flex-1 space-y-6">
          {/* Reasons List */}
          <div className="space-y-4">
            {reasons.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] italic">No delay data recorded.</p>
            ) : (
              reasons.map((r) => (
                <div 
                  key={r._id} 
                  className="space-y-1.5 cursor-pointer group p-1 -mx-1 rounded hover:bg-[var(--color-surface-hover)] transition-colors"
                  onClick={() => openReasonModal(r._id)}
                >
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-text)] transition-colors">{r._id || 'Unspecified'}</span>
                    <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors">{r.count} shipments</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500 group-hover:bg-indigo-400" 
                      style={{ width: `${(r.count / maxReasonCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-4">
              <Triangle size={14} className="text-[var(--badge-transit-text)] rotate-180" />
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Top Delayed Hubs</h4>
            </div>
            <div className="space-y-3">
              {locations.map((loc) => (
                <div 
                  key={loc._id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs cursor-pointer hover:bg-[var(--color-surface-hover)] hover:border-indigo-500/50 transition-all group"
                  onClick={() => openHubModal(loc._id)}
                >
                  <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-text)] transition-colors">{loc._id}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]/70 transition-colors">{loc.shipments} total</span>
                    <span className="text-[var(--color-danger-text)] font-bold group-hover:text-red-300 transition-colors">{loc.delays} delayed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface-2)]">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{modalTitle}</h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-[var(--color-surface-hover)] rounded-xl transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[var(--color-surface)]">
              <OrdersTable 
                orders={modalOrders} 
                loading={modalLoading} 
                onRefresh={() => {}} 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

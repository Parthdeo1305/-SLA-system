'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/services/api/orders';
import {
  Truck,
  Package,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  RefreshCw,
  ChevronRight,
  Navigation,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { AuthUser } from '@/services/api/auth';

interface Props {
  user: AuthUser;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Created: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Picked: 'bg-amber-500/10 text-[var(--badge-transit-text)] border-amber-500/20',
    'In Transit': 'bg-[var(--color-brand-bg)] text-[var(--color-brand-text)] border-indigo-500/20',
    Delivered: 'bg-emerald-500/10 text-[var(--badge-delivered-text)] border-emerald-500/20',
    Failed: 'bg-red-500/10 text-[var(--color-danger-text)] border-red-500/20',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status] ?? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border-[var(--color-border)]'}`}
    >
      <span className="w-1 h-1 rounded-full bg-current" />
      {status}
    </span>
  );
}

function SLABadge({ order }: { order: Order }) {
  if (!order.isDelayed) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-[var(--color-danger-text)] text-[9px] font-bold uppercase">
      <AlertTriangle size={9} />
      SLA Breached
    </span>
  );
}

export default function DeliveryAgentDashboard({ user }: Props) {
  const [search, setSearch] = useState('');

  const {
    orders,
    loading,
    pagination,
    refetch,
  } = useOrders({ search: search || undefined });

  // Derive quick stats from fetched orders
  const activeOrders = orders.filter((o) => !['Delivered', 'Failed'].includes(o.status));
  const deliveredToday = orders.filter((o) => {
    if (o.status !== 'Delivered') return false;
    const updated = new Date(o.updatedAt);
    const now = new Date();
    return updated.toDateString() === now.toDateString();
  });
  const delayedOrders = orders.filter((o) => o.isDelayed);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1200px] mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[var(--color-brand-text)] uppercase tracking-[0.2em] mb-1">
            Delivery Agent Portal
          </p>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">
            {greeting()}, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Here are all your assigned deliveries.
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ── Quick Stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider mb-2">
            <Navigation size={12} className="text-[var(--color-brand-text)]" />
            Active
          </div>
          <p className="text-3xl font-black text-[var(--color-text-primary)]">{loading ? '—' : activeOrders.length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">in progress</p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider mb-2">
            <CheckCircle2 size={12} className="text-[var(--badge-delivered-text)]" />
            Delivered Today
          </div>
          <p className="text-3xl font-black text-[var(--badge-delivered-text)]">{loading ? '—' : deliveredToday.length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">completed</p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider mb-2">
            <AlertTriangle size={12} className="text-[var(--color-danger-text)]" />
            SLA Breached
          </div>
          <p className="text-3xl font-black text-[var(--color-danger-text)]">{loading ? '—' : delayedOrders.length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">need attention</p>
        </div>
      </div>

      {/* ── Orders List ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Package size={14} className="text-[var(--color-brand-text)]" />
            My Assigned Orders
            {!loading && (
              <span className="text-[10px] font-normal text-[var(--color-text-muted)] normal-case tracking-normal ml-1">
                ({pagination.total})
              </span>
            )}
          </h2>
          {/* Search */}
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-lg py-1.5 px-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-64"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
            <Truck size={32} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-40" />
            <p className="text-[var(--color-text-muted)] text-sm">No assigned orders found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Order info */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/15 border border-indigo-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Package size={16} className="text-[var(--color-brand-text)]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-mono font-bold text-[var(--color-brand-text)]">{order.orderId}</p>
                        <StatusBadge status={order.status} />
                        <SLABadge order={order} />
                      </div>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">{order.customer.name}</p>
                      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1">
                          <Phone size={10} />
                          {order.customer.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {order.deliveryAddress.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Due time + action */}
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock size={10} className={order.isDelayed ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-text-muted)]'} />
                      <span className={order.isDelayed ? 'text-[var(--color-danger-text)] font-semibold' : 'text-[var(--color-text-muted)]'}>
                        {order.isDelayed
                          ? `${order.delayDuration} overdue`
                          : order.timeUntilDue
                          ? `Due in ${order.timeUntilDue}`
                          : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--color-brand-text)] opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0">
                      Update status
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useOrders } from '@/hooks/useOrders';
import { isDeliveryAgent, canCreateOrder, canViewFleet } from '@/lib/rbac';

import StatsCard from '@/components/dashboard/StatsCard';
import OrdersTable from '@/components/dashboard/OrdersTable';
import FilterBar from '@/components/dashboard/FilterBar';
import CriticalPanel from '@/components/dashboard/CriticalPanel';
import DelayAnalytics from '@/components/dashboard/DelayAnalytics';
import AgentStats from '@/components/dashboard/AgentStats';
import QuickActionPanel from '@/components/dashboard/QuickActionPanel';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import DeliveryAgentDashboard from '@/components/dashboard/DeliveryAgentDashboard';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  Truck,
  AlertTriangle,
  PlusCircle,
  Users,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [delayedOnly, setDelayedOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [showLiveFeed, setShowLiveFeed] = useState(true);

  // All hooks must be called unconditionally (Rules of Hooks).
  // When the user is a delivery_agent, these are unused — they render their own component.
  const isAgent = user ? isDeliveryAgent(user) : false;

  // 1. Fetch High-Level Analytics (Decision Data)
  const {
    stats,
    analytics,
    loading: statsLoading,
    refresh: refreshStats
  } = useDashboardStats();

  // 2. Fetch Detailed Orders (The Table)
  const {
    orders,
    loading: ordersLoading,
    error,
    pagination,
    refetch: refetchOrders
  } = useOrders({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    delayed: delayedOnly || undefined,
    search: search || undefined,
  });

  const handleRefresh = () => {
    refreshStats();
    refetchOrders();
  };

  // ── Redirect delivery_agent to their focused view ─────────────────────────
  if (user && isAgent) {
    return <DeliveryAgentDashboard user={user} />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-12 max-w-[1600px] mx-auto">

      {/* ── LAYER 1: URGENT ACTIONS (TOP) ─────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col xl:flex-row gap-6 items-stretch">
          {/* Main Delayed Ticker */}
          <div 
            onClick={() => { setStatusFilter('all'); setDelayedOnly(true); }}
            className={`cursor-pointer transition-all duration-200 border rounded-2xl p-8 flex flex-col justify-center min-w-[280px] shadow-2xl ${delayedOnly ? 'bg-red-950/40 border-red-500 ring-2 ring-red-500 ring-offset-4 ring-offset-[var(--color-bg)]' : 'bg-red-950/20 border-red-900/30 shadow-red-950/20 hover:scale-[1.02]'}`}
          >
            <p className="text-red-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">SLA Breached</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-7xl font-black text-white leading-none">
                {statsLoading ? '...' : stats?.delayed ?? 0}
              </h2>
              <span className="text-red-400/50 text-sm font-medium">Orders</span>
            </div>
            <p className="text-red-400/70 text-xs mt-6 font-medium italic">Click to view delayed orders</p>
          </div>

          {/* Top 3 Critical Shipments */}
          <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Critical Escalations
              </h3>
              <Link href="/orders?delayed=true" className="text-[10px] text-indigo-400 font-bold hover:underline tracking-widest">VIEW ALL</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              {statsLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-full bg-white/5 rounded-xl animate-pulse" />)
              ) : (analytics?.criticalShipments ?? []).slice(0, 3).length === 0 ? (
                <div className="col-span-3 flex items-center justify-center text-[var(--color-text-muted)] text-sm italic bg-white/2 rounded-xl">No critical shipments detected.</div>
              ) : (
                (analytics?.criticalShipments ?? []).slice(0, 3).map((s: any) => (
                  <Link key={s._id} href={`/orders/${s._id}`} className="block p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-indigo-400 mb-1">{s.orderId}</p>
                      <p className="text-sm font-bold text-white truncate">{s.deliveryAddress?.city || 'Unknown'}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">BREACHED</span>
                      <ChevronRight size={12} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions — role-gated */}
          <div className="flex flex-col gap-4 justify-center">
            {canCreateOrder(user) && (
              <Button 
                onClick={() => router.push('/orders/new')}
                className="w-full justify-start gap-4 px-8 h-14 text-sm font-bold shadow-lg shadow-indigo-500/20"
              >
                <PlusCircle size={20} /> Create New Order
              </Button>
            )}
            {canViewFleet(user) && (
              <Button 
                variant="secondary" 
                onClick={() => router.push('/dashboard/agents')}
                className="w-full justify-start gap-4 px-8 h-14 text-sm font-bold"
              >
                <Users size={20} /> Fleet Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── LAYER 2: OPERATIONS SUMMARY (MIDDLE) ─────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Orders"
          value={stats?.total ?? 0}
          icon={Package}
          color="indigo"
          loading={statsLoading}
          onClick={() => { setStatusFilter('all'); setDelayedOnly(false); }}
          isActive={statusFilter === 'all' && !delayedOnly}
        />
        <StatsCard
          title="Delivered"
          value={stats?.delivered ?? 0}
          icon={CheckCircle2}
          color="emerald"
          loading={statsLoading}
          onClick={() => { setStatusFilter('Delivered'); setDelayedOnly(false); }}
          isActive={statusFilter === 'Delivered' && !delayedOnly}
        />
        <StatsCard
          title="In Transit"
          value={stats?.inTransit ?? 0}
          icon={Truck}
          color="amber"
          loading={statsLoading}
          onClick={() => { setStatusFilter('In Transit'); setDelayedOnly(false); }}
          isActive={statusFilter === 'In Transit' && !delayedOnly}
        />
      </section>

      {/* ── LAYER 3: LIVE DATA FEED & FILTERS ────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LayoutDashboard size={20} className="text-indigo-400" />
            Live Operations Feed
            <button
              onClick={() => setShowLiveFeed(!showLiveFeed)}
              className="ml-4 text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-400/10 hover:bg-indigo-400/20 px-2 py-1 rounded transition-colors"
            >
              {showLiveFeed ? 'Hide' : 'Show'}
            </button>
          </h2>
          {showLiveFeed && (
            <FilterBar
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              delayedOnly={delayedOnly}
              onDelayedToggle={() => setDelayedOnly((d) => !d)}
              search={search}
              onSearchChange={setSearch}
              totalResults={pagination.total}
            />
          )}
        </div>
        {showLiveFeed && (
          <Card className="p-0 overflow-hidden shadow-2xl border-[var(--color-border)]/50 bg-[var(--color-surface)]">
            <OrdersTable orders={orders} onRefresh={handleRefresh} loading={ordersLoading} />
          </Card>
        )}
      </section>

      {/* ── LAYER 4: INSIGHTS & ACTIVITY (COLLAPSIBLE) ───────────────────── */}
      <section className="space-y-6 pt-8 border-t border-[var(--color-border)]">
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="flex items-center gap-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] hover:text-indigo-400 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-all">
            <ChevronRight size={16} className={`transition-transform duration-300 ${showInsights ? 'rotate-90 text-indigo-400' : ''}`} />
          </div>
          {showInsights ? 'Hide Advanced Analytics & Activity' : 'Show Advanced Analytics & Activity'}
        </button>

        {showInsights && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DelayAnalytics
                  reasons={analytics?.delayBreakdown ?? []}
                  locations={analytics?.locationInsights ?? []}
                />
                <AgentStats agents={analytics?.agentPerformance ?? []} />
              </div>
            </div>
            <div>
              <NotificationsPanel alerts={analytics?.recentAlerts ?? []} />
            </div>
          </div>
        )}
      </section>

    </div>
  );
}

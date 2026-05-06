'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import OrdersTable from '@/components/dashboard/OrdersTable';
import FilterBar from '@/components/dashboard/FilterBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { RefreshCw, Package } from 'lucide-react';

function OrdersContent() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState('all');
  const [delayedOnly, setDelayedOnly] = useState(searchParams.get('delayed') === 'true');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { orders, loading, error, pagination, refetch } = useOrders({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    delayed: delayedOnly || undefined,
    search: search || undefined,
    page,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">All Shipment Orders</h1>
            <p className="text-[var(--color-text-secondary)] mt-1 text-sm">
              Manage and track your entire logistics pipeline
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refetch}
          className="gap-2"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </Button>
      </div>

      {/* Orders Table Card */}
      <Card>
        <div className="p-5 border-b border-[var(--color-border)]">
          <FilterBar
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            delayedOnly={delayedOnly}
            onDelayedToggle={() => setDelayedOnly((d) => !d)}
            search={search}
            onSearchChange={setSearch}
            totalResults={pagination.total}
          />
        </div>

        {error ? (
          <div className="p-12 text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <Button variant="secondary" size="sm" onClick={refetch}>
              Try again
            </Button>
          </div>
        ) : loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <OrdersTable orders={orders} onRefresh={refetch} loading={loading} />
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-2)]/50">
            <p className="text-xs text-[var(--color-text-muted)]">
              Showing <span className="text-[var(--color-text-primary)]">{orders.length}</span> of <span className="text-[var(--color-text-primary)]">{pagination.total}</span> orders
            </p>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm" 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AllOrdersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[var(--color-text-muted)]">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}

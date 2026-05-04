'use client';

import { useState, useEffect, useCallback } from 'react';
import ordersApi, {
  Order,
  OrderStats,
  ListOrdersParams,
} from '@/services/api/orders';

/**
 * useOrders — fetches and manages order list + dashboard stats.
 * Auto-refreshes every 30 seconds to keep SLA status current.
 */
export function useOrders(params: ListOrdersParams = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchOrders = useCallback(async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        ordersApi.list(params),
        ordersApi.getStats(),
      ]);
      setOrders(listRes.orders);
      setPagination({
        page: listRes.page,
        totalPages: listRes.totalPages,
        total: listRes.total,
      });
      setStats(statsRes.stats);
      setError(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to load orders.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30 seconds — SLA times change with the clock
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return { orders, stats, loading, error, pagination, refetch: fetchOrders };
}

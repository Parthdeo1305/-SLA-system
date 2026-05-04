import { useState, useEffect, useCallback } from 'react';
import ordersApi, { OrderStats } from '@/services/api/orders';
import { analyticsApi, DashboardAnalytics } from '@/services/api/analytics';

export function useDashboardStats() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      console.log('[DashboardStats] Fetching data...');
      const [statsData, analyticsData] = await Promise.all([
        ordersApi.getStats(),
        analyticsApi.getDashboard(),
      ]);
      console.log('[DashboardStats] Data received:', { stats: statsData, analytics: analyticsData });
      setStats(statsData.stats);
      setAnalytics(analyticsData);
      setError(null);
    } catch (err: any) {
      console.error('[DashboardStats] Error fetching dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { stats, analytics, loading, error, refresh: fetchData };
}

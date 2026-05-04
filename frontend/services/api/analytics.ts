import apiClient from './client';

export interface DashboardAnalytics {
  criticalShipments: any[];
  delayBreakdown: { _id: string; count: number }[];
  agentPerformance: {
    _id: string;
    name: string;
    total: number;
    delivered: number;
    delayed: number;
  }[];
  locationInsights: {
    _id: string;
    shipments: number;
    delays: number;
  }[];
  recentAlerts: {
    orderId: string;
    status: string;
    timestamp: string;
    agent?: string;
    note?: string;
  }[];
}

export const analyticsApi = {
  getDashboard: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: DashboardAnalytics }>('/orders/analytics');
    return data.data;
  },
};

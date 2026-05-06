import apiClient from './client';

export type OrderStatus = 'Created' | 'Picked' | 'In Transit' | 'Delivered' | 'Failed';

export interface Address {
  addressLine: string;
  city: string;
  pincode: string;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface TransitLog {
  status: OrderStatus;
  updatedAt: string;
  updatedBy: string;
  location?: string;
  note?: string;
}

export type DelayReason = 'Traffic' | 'Weather' | 'Vehicle Issue' | 'Warehouse Delay' | 'Address Issue' | 'Other';

export interface Order {
  id: string;
  orderId: string;
  customer: Customer;
  pickupAddress: Address;
  deliveryAddress: Address;
  status: OrderStatus;
  promisedDeliveryTime: string;
  notes?: string;
  createdBy?: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
  isDelayed: boolean;
  delayDuration: string | null;
  timeUntilDue: string | null;
  deliveryAgent?: { agentId: string; name: string; phone: string };
  assignedAt?: string;
  transitLogs?: TransitLog[];
  delayReason?: DelayReason | null;
  delayNote?: string;
}

export interface OrderStats {
  total: number;
  delivered: number;
  inTransit: number;
  picked: number;
  created: number;
  failed: number;
  delayed: number;
}

export interface ListOrdersParams {
  status?: string;
  delayed?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  delayReason?: string;
  city?: string;
}

export interface ListOrdersResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  orders: Order[];
}

export interface CreateOrderPayload {
  customer: Customer;
  pickupAddress: Address;
  deliveryAddress: Address;
  promisedDeliveryTime: string;
  notes?: string;
}

export interface UpdateOrderPayload {
  status: OrderStatus;
  deliveryAgent?: { agentId: string; name: string; phone: string };
  location?: string;
  note?: string;
  delayReason?: DelayReason | null;
  delayNote?: string;
}

const ordersApi = {
  getStats: async (): Promise<{ stats: OrderStats }> => {
    const { data } = await apiClient.get('/orders/stats');
    return data;
  },

  list: async (params: ListOrdersParams = {}): Promise<ListOrdersResponse> => {
    const { data } = await apiClient.get<ListOrdersResponse>('/orders', { params });
    return data;
  },

  get: async (id: string): Promise<{ order: Order }> => {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data;
  },

  create: async (payload: CreateOrderPayload): Promise<{ order: Order }> => {
    const { data } = await apiClient.post('/orders', payload);
    return data;
  },

  update: async (id: string, payload: UpdateOrderPayload): Promise<{ order: Order }> => {
    const { data } = await apiClient.patch(`/orders/${id}`, payload);
    return data;
  },
};

export default ordersApi;

import apiClient from './client';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'operations_manager' | 'warehouse_operator' | 'delivery_agent';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  success: boolean;
  count: number;
  users: User[];
}

export const usersApi = {
  list: async (params?: { role?: string; isActive?: boolean; search?: string }) => {
    const { data } = await apiClient.get<UserListResponse>('/users', { params });
    return data;
  },

  deactivate: async (id: string) => {
    const { data } = await apiClient.patch(`/users/${id}/deactivate`);
    return data;
  },

  activate: async (id: string) => {
    const { data } = await apiClient.patch(`/users/${id}/activate`);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  },
};

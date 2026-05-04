import apiClient from './client';

export interface Agent {
  _id: string;
  agentId: string;
  name: string;
  phone: string;
  status: 'available' | 'busy';
  currentOrderId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const agentsApi = {
  list: async (params?: { status?: string; isActive?: boolean }) => {
    const { data } = await apiClient.get<{ success: boolean; agents: Agent[] }>('/agents', { params });
    return data.agents;
  },

  create: async (payload: { agentId: string; name: string; phone: string }) => {
    const { data } = await apiClient.post<{ success: boolean; agent: Agent }>('/agents', payload);
    return data.agent;
  },

  deactivate: async (id: string) => {
    const { data } = await apiClient.patch<{ success: boolean; agent: Agent }>(`/agents/${id}/deactivate`);
    return data.agent;
  },

  activate: async (id: string) => {
    const { data } = await apiClient.patch<{ success: boolean; agent: Agent }>(`/agents/${id}/activate`);
    return data.agent;
  },
};

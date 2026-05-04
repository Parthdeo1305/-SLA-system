import apiClient from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operations_manager' | 'warehouse_operator' | 'delivery_agent';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  me: async (): Promise<{ user: AuthUser }> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};

export default authApi;

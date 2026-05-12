import api from '@/lib/api';
import { LoginRequest, AuthResponse } from '@/lib/types/auth';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  verifyToken: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/auth/verify');
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },
};

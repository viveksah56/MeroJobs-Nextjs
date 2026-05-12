import api from '@/lib/api';
import { LoginRequest, AuthResponse } from '@/lib/types/auth';
import { tokenManager } from '@/lib/token';

export const authService = {
  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Store tokens after login
    if (response.data?.data?.token) {
      tokenManager.setTokens(
        response.data.data.token,
        response.data.data.refreshToken,
      );
    }

    return response.data;
  },

  /**
   * Logout and clear tokens
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Always clear tokens even if logout fails
      tokenManager.clearTokens();
    }
  },

  /**
   * Verify if current token is valid
   */
  verifyToken: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/auth/verify');
    return response.data;
  },

  /**
   * Refresh the access token using refresh token
   */
  refreshToken: async (refreshToken?: string): Promise<AuthResponse> => {
    const token = refreshToken || tokenManager.getRefreshToken();

    if (!token) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken: token,
    });

    // Store new tokens
    if (response.data?.data?.token) {
      tokenManager.setTokens(
        response.data.data.token,
        response.data.data.refreshToken,
      );
    }

    return response.data;
  },

  /**
   * Get current access token
   */
  getAccessToken: (): string | null => {
    return tokenManager.getAccessToken();
  },

  /**
   * Check if user is authenticated and token is valid
   */
  isAuthenticated: (): boolean => {
    const token = tokenManager.getAccessToken();
    return token ? tokenManager.isTokenValid(token) : false;
  },

  /**
   * Check if token needs refresh (expiring soon)
   */
  shouldRefreshToken: (): boolean => {
    const token = tokenManager.getAccessToken();
    return token ? tokenManager.isTokenExpiringSoon(token) : false;
  },
};

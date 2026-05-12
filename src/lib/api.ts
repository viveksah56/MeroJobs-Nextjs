import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from './token';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Track if we're currently refreshing token to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: any = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      const newToken = tokenManager.getAccessToken();
      prom.resolve(newToken || '');
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

/**
 * Request interceptor: Add token to headers
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor: Handle 401 and retry with refresh token
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if this is a 401 Unauthorized error
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite retry loop
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const refreshToken = tokenManager.getRefreshToken();

        if (!refreshToken) {
          // No refresh token available, redirect to login
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const response = await axios.post<{
          data: { token: string; refreshToken?: string };
        }>(`${API_URL}/auth/refresh`, { refreshToken }, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        const { token, refreshToken: newRefreshToken } = response.data.data;

        // Store new tokens
        tokenManager.setTokens(token, newRefreshToken);

        // Update original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Process queued requests
        processQueue();

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, clear tokens and redirect to login
        tokenManager.clearTokens();
        processQueue(refreshError);

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // For other errors or if retry failed
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Final fallback: redirect to login
      tokenManager.clearTokens();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default api;

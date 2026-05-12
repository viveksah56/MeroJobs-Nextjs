'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { authService } from '@/service/auth.service';
import { tokenManager } from '@/lib/token';
import { User, LoginRequest } from '@/lib/types/auth';

const AUTH_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'user_data';
const REFRESH_CHECK_INTERVAL = 30000; // Check token every 30 seconds

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const refreshScheduleRef = useRef<(() => void) | null>(null);
  const refreshCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize auth state from cookies
   */
  useEffect(() => {
    const token = Cookies.get(AUTH_STORAGE_KEY);
    const storedUser = Cookies.get(USER_STORAGE_KEY);

    if (token && storedUser) {
      // Validate token is not expired
      if (tokenManager.isTokenValid(token)) {
        setUser(JSON.parse(storedUser));
        scheduleTokenRefresh(token);
      } else {
        // Token expired, clear and try refresh
        tokenManager.clearTokens();
      }
    }

    setIsHydrated(true);
  }, []);

  /**
   * Schedule automatic token refresh
   */
  const scheduleTokenRefresh = useCallback((token: string) => {
    // Cancel previous schedule if exists
    if (refreshScheduleRef.current) {
      refreshScheduleRef.current();
    }

    // Schedule refresh before token expires
    refreshScheduleRef.current = tokenManager.scheduleTokenRefresh(
      token,
      async () => {
        try {
          const response = await authService.refreshToken();
          if (response?.data?.token) {
            // Token refreshed successfully
            scheduleTokenRefresh(response.data.token);
          }
        } catch (error) {
          console.error('[v0] Token refresh failed:', error);
          // Refresh failed, user will be redirected by axios interceptor
        }
      },
    );
  }, []);

  /**
   * Set up periodic token validation
   */
  useEffect(() => {
    if (!isHydrated) return;

    refreshCheckIntervalRef.current = setInterval(async () => {
      const token = tokenManager.getAccessToken();

      if (!token) {
        if (user) {
          // Token lost, logout
          handleLogout();
        }
        return;
      }

      // Check if token is expired
      if (tokenManager.isTokenExpired(token)) {
        // Try to refresh
        try {
          const response = await authService.refreshToken();
          if (response?.data?.token) {
            scheduleTokenRefresh(response.data.token);
          }
        } catch (error) {
          console.error('[v0] Token validation refresh failed:', error);
          handleLogout();
        }
      } else if (tokenManager.isTokenExpiringSoon(token)) {
        // Token expiring soon, refresh it
        try {
          const response = await authService.refreshToken();
          if (response?.data?.token) {
            scheduleTokenRefresh(response.data.token);
          }
        } catch (error) {
          console.error('[v0] Proactive token refresh failed:', error);
        }
      }
    }, REFRESH_CHECK_INTERVAL);

    return () => {
      if (refreshCheckIntervalRef.current) {
        clearInterval(refreshCheckIntervalRef.current);
      }
    };
  }, [isHydrated, user, scheduleTokenRefresh]);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      const token = response.data.token;
      const userData = response.data.user;

      // Store user data
      Cookies.set(USER_STORAGE_KEY, JSON.stringify(userData), {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });

      setUser(userData);
      queryClient.setQueryData(['user'], userData);

      // Schedule automatic token refresh
      scheduleTokenRefresh(token);

      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('[v0] Login error:', error);
    },
  });

  const refreshMutation = useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (response) => {
      if (response?.data?.token) {
        scheduleTokenRefresh(response.data.token);
      }
    },
  });

  const handleLogout = useCallback(async () => {
    // Cancel token refresh schedule
    if (refreshScheduleRef.current) {
      refreshScheduleRef.current();
      refreshScheduleRef.current = null;
    }

    setUser(null);
    queryClient.clear();

    try {
      await authService.logout();
    } finally {
      router.push('/login');
    }
  }, [router, queryClient]);

  const handleLogin = useCallback(
    (email: string, password: string) =>
      loginMutation.mutateAsync({ email, password }),
    [loginMutation],
  );

  const handleRefreshToken = useCallback(
    () => refreshMutation.mutateAsync(),
    [refreshMutation],
  );

  return {
    user,
    isLoading: loginMutation.isPending,
    isRefreshing: refreshMutation.isPending,
    isAuthenticated: !!user && tokenManager.isTokenValid(tokenManager.getAccessToken() || ''),
    isHydrated,
    login: handleLogin,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    error: loginMutation.error,
    refreshError: refreshMutation.error,
  };
};

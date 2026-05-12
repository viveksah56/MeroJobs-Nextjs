'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/api-client';
import { getAuthToken, removeAuthToken, setAuthToken, getTokenPayload, TokenPayload } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery<AuthUser | null>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) return null;

      try {
        const response = await axiosInstance.get<{ user: AuthUser }>('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.user;
      } catch {
        removeAuthToken();
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await axiosInstance.post<LoginResponse>('/auth/login', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setAuthToken(data.access_token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      router.push('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = getAuthToken();
      await axiosInstance.post(
        '/auth/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      removeAuthToken();
      queryClient.setQueryData(['auth', 'user'], null);
      router.push('/login');
    },
  });

  return {
    user,
    isLoadingUser,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
};

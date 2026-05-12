'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { authService } from '@/service/auth.service';
import { User, LoginRequest } from '@/lib/types/auth';

const AUTH_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'user_data';

interface DecodedToken {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const token = Cookies.get(AUTH_STORAGE_KEY);
    const storedUser = Cookies.get(USER_STORAGE_KEY);

    if (token && storedUser) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decoded.exp > currentTime) {
          setUser(JSON.parse(storedUser));
        } else {
          Cookies.remove(AUTH_STORAGE_KEY);
          Cookies.remove(USER_STORAGE_KEY);
        }
      } catch {
        Cookies.remove(AUTH_STORAGE_KEY);
        Cookies.remove(USER_STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      const token = response.data.token;
      const userData = response.data.user;

      Cookies.set(AUTH_STORAGE_KEY, token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });
      Cookies.set(USER_STORAGE_KEY, JSON.stringify(userData), {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });

      setUser(userData);
      queryClient.setQueryData(['user'], userData);
      router.push('/dashboard');
    },
  });

  const logout = useCallback(() => {
    Cookies.remove(AUTH_STORAGE_KEY);
    Cookies.remove(USER_STORAGE_KEY);
    setUser(null);
    queryClient.clear();
    router.push('/login');
  }, [router, queryClient]);

  const handleLogin = useCallback(
    (email: string, password: string) =>
      loginMutation.mutateAsync({ email, password }),
    [loginMutation],
  );

  return {
    user,
    isLoading: loginMutation.isPending,
    isAuthenticated: !!user,
    isHydrated,
    login: handleLogin,
    logout,
    error: loginMutation.error,
  };
};

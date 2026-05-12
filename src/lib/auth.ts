import { jwtDecode } from 'jwt-decode';

export interface TokenPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export const setAuthToken = (token: string): void => {
  document.cookie = `auth_token=${token}; path=/; max-age=86400; Secure; SameSite=Strict`;
};

export const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find((c) => c.startsWith('auth_token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

export const removeAuthToken = (): void => {
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict';
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getTokenPayload = (token: string): TokenPayload | null => {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token && !isTokenExpired(token);
};

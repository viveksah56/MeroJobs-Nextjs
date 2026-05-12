import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_BUFFER = 60; // Refresh 60 seconds before expiry

interface DecodedToken {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

export const tokenManager = {
  /**
   * Get the current access token from cookies
   */
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(AUTH_TOKEN_KEY) || null;
  },

  /**
   * Get the refresh token from cookies
   */
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(REFRESH_TOKEN_KEY) || null;
  },

  /**
   * Store tokens in secure cookies
   */
  setTokens: (accessToken: string, refreshToken?: string): void => {
    if (typeof window === 'undefined') return;

    const cookieOptions = {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict' as const,
    };

    Cookies.set(AUTH_TOKEN_KEY, accessToken, cookieOptions);

    if (refreshToken) {
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
        ...cookieOptions,
        expires: 30, // Refresh token lasts longer
      });
    }
  },

  /**
   * Clear both tokens from cookies
   */
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    Cookies.remove(AUTH_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  },

  /**
   * Decode token and get payload
   */
  decodeToken: (token: string): DecodedToken | null => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (token: string): boolean => {
    const decoded = tokenManager.decodeToken(token);
    if (!decoded) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp <= currentTime;
  },

  /**
   * Check if token is close to expiry (within buffer)
   */
  isTokenExpiringSoon: (token: string): boolean => {
    const decoded = tokenManager.decodeToken(token);
    if (!decoded) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp <= currentTime + TOKEN_EXPIRY_BUFFER;
  },

  /**
   * Get time remaining until token expiry (in seconds)
   */
  getTimeUntilExpiry: (token: string): number => {
    const decoded = tokenManager.decodeToken(token);
    if (!decoded) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = decoded.exp - currentTime;
    return Math.max(0, timeRemaining);
  },

  /**
   * Validate token structure and expiry
   */
  isTokenValid: (token: string): boolean => {
    if (!token) return false;
    const decoded = tokenManager.decodeToken(token);
    if (!decoded) return false;
    return !tokenManager.isTokenExpired(token);
  },

  /**
   * Schedule automatic token refresh
   */
  scheduleTokenRefresh: (
    token: string,
    onRefreshNeeded: () => Promise<void>,
  ): (() => void) | null => {
    const timeUntilExpiry = tokenManager.getTimeUntilExpiry(token);
    const refreshTime = (timeUntilExpiry - TOKEN_EXPIRY_BUFFER) * 1000;

    if (refreshTime <= 0) {
      // Token already expiring soon, refresh immediately
      onRefreshNeeded().catch((error) => {
        console.error('[v0] Token refresh failed:', error);
      });
      return null;
    }

    const timeoutId = setTimeout(() => {
      onRefreshNeeded().catch((error) => {
        console.error('[v0] Token refresh failed:', error);
      });
    }, refreshTime);

    // Return cleanup function to cancel timeout
    return () => clearTimeout(timeoutId);
  },
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    token: string;
    refreshToken: string;
  };
  message?: string;
}

export interface AuthError {
  success: boolean;
  message: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
}

export type UserRole = 'admin' | 'manager' | 'supervisor' | 'operator' | 'viewer';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface Session {
  id: string;
  userId: string;
  device: string;
  ip: string;
  createdAt: string;
  lastActive: string;
  current: boolean;
}

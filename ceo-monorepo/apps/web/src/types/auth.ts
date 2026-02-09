// NextAuth.js v5 類型擴展
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      taxId: string;
      role: string;
      status: string;
      emailVerified: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    taxId: string;
    role: string;
    status: string;
    emailVerified: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    taxId: string;
    role: string;
    status: string;
    emailVerified: boolean;
  }
}

// 認證相關類型
export interface RegisterRequest {
  name: string;
  taxId: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  taxId: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  message: string;
  user: UserData;
}

export interface UserData {
  id: string;
  name: string;
  taxId: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date | null;
  member?: {
    id: string;
    userId: string;
    points: number;
    totalSpent: number;
    lastPurchaseAt?: Date | null;
  } | null;
}

export interface ApiError {
  error: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
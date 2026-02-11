import { z } from 'zod'
import { loginSchema, registerSchema, resetPasswordSchema, updateProfileSchema } from './schemas'
import type { LoginInput, RegisterInput, ResetPasswordInput, UpdateProfileInput } from './schemas'

export interface AuthUser {
  id: string
  name: string | null
  email: string
  role: string
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginResponse {
  user: AuthUser
  message: string
}

export interface RegisterResponse {
  user: AuthUser
  message: string
}

export interface ApiError {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export class AuthService {
  private baseUrl: string
  private storage: StorageAdapter

  constructor(baseUrl: string, storage: StorageAdapter) {
    this.baseUrl = baseUrl
    this.storage = storage
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new AuthError(error.message || '登入失敗', error.code, error.errors)
    }

    const data = await response.json()
    await this.storage.setTokens(data.user.accessToken, data.user.refreshToken, data.user.expiresAt)
    return data
  }

  async register(input: RegisterInput): Promise<RegisterResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new AuthError(error.message || '註冊失敗', error.code, error.errors)
    }

    const data = await response.json()
    await this.storage.setTokens(data.user.accessToken, data.user.refreshToken, data.user.expiresAt)
    return data
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
      })
    } catch (error) {
      console.error('登出時發生錯誤:', error)
    } finally {
      await this.storage.clearTokens()
    }
  }

  async refreshToken(): Promise<AuthUser> {
    const refreshToken = await this.storage.getRefreshToken()
    if (!refreshToken) {
      throw new AuthError('沒有可用的刷新令牌')
    }

    const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      await this.storage.clearTokens()
      throw new AuthError('令牌刷新失敗')
    }

    const data = await response.json()
    await this.storage.setTokens(data.accessToken, data.refreshToken, data.expiresAt)
    return data.user
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const accessToken = await this.storage.getAccessToken()
    if (!accessToken) {
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/me`, {
        headers: await this.getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          await this.storage.clearTokens()
          return null
        }
        throw new AuthError('取得用戶資料失敗')
      }

      return await response.json()
    } catch (error) {
      console.error('取得用戶資料時發生錯誤:', error)
      return null
    }
  }

  async updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
    const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new AuthError(error.message || '更新資料失敗', error.code, error.errors)
    }

    return await response.json()
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new AuthError(error.message || '重設密碼失敗', error.code, error.errors)
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await this.storage.getAccessToken()
    return {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }
  }
}

export interface StorageAdapter {
  getAccessToken(): Promise<string | null>
  getRefreshToken(): Promise<string | null>
  getExpiresAt(): Promise<number | null>
  setTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void>
  clearTokens(): Promise<void>
}

export const schemas = {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
}

export type {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
}
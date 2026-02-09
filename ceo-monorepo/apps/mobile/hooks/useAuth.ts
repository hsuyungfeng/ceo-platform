import { useState, useEffect, useCallback } from 'react'
import { router } from 'expo-router'
import { createReactNativeAuthService, type AuthUser, type AuthError, type LoginInput, type RegisterInput, type UpdateProfileInput, type ResetPasswordInput } from '@ceo/auth'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

// Create auth service instance
const authService = createReactNativeAuthService(API_BASE_URL)

interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (input: UpdateProfileInput) => Promise<void>
  resetPassword: (input: ResetPasswordInput) => Promise<void>
  clearError: () => void
  refreshUser: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      console.error('載入用戶資料時發生錯誤:', err)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(async (input: LoginInput) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await authService.login(input)
      setUser(response.user)
      router.replace('/(tabs)')
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message || '登入失敗')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await authService.register(input)
      setUser(response.user)
      router.replace('/(tabs)')
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message || '註冊失敗')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
      router.replace('/(auth)/login')
    } catch (err) {
      console.error('登出時發生錯誤:', err)
      setError('登出時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedUser = await authService.updateProfile(input)
      setUser(updatedUser)
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message || '更新資料失敗')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (input: ResetPasswordInput) => {
    try {
      setIsLoading(true)
      setError(null)
      await authService.resetPassword(input)
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message || '重設密碼失敗')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refreshUser = useCallback(async () => {
    await loadUser()
  }, [loadUser])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    clearError,
    refreshUser,
  }
}

// Hook for checking authentication status
export function useAuthGuard(redirectTo: string = '/(auth)/login') {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(redirectTo)
    }
  }, [user, isLoading, redirectTo])

  return { user, isLoading }
}

// Hook for checking admin status
export function useAdminGuard() {
  const { user, isLoading } = useAuthGuard()

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.replace('/(tabs)')
    }
  }, [user, isLoading])

  return { user, isLoading }
}
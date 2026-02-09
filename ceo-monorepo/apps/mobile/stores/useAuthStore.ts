import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import appleAuth from '@invertase/react-native-apple-authentication'
import { createReactNativeAuthService, type AuthUser, type AuthError, type LoginInput, type RegisterInput, type UpdateProfileInput, type ResetPasswordInput, type LoginResponse, type RegisterResponse } from '@ceo/auth'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
const authService = createReactNativeAuthService(API_BASE_URL)

export interface AuthStore {
  // State
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Actions
  signInWithApple: () => Promise<{ requiresRegistration?: boolean; tempOAuthId?: string; email?: string; name?: string }>
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (input: UpdateProfileInput) => Promise<void>
  resetPassword: (input: ResetPasswordInput) => Promise<void>
  clearError: () => void
  refreshUser: () => Promise<void>
  loadUser: () => Promise<void>
  setUser: (user: AuthUser | null) => void
  setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Load user from storage on app start
      loadUser: async () => {
        try {
          set({ isLoading: true })
          const currentUser = await authService.getCurrentUser()
          set({ 
            user: currentUser,
            isAuthenticated: !!currentUser,
            isLoading: false 
          })
        } catch (err) {
          console.error('載入用戶資料時發生錯誤:', err)
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false 
          })
        }
      },

      // Apple Sign-In
      signInWithApple: async () => {
        try {
          set({ isLoading: true, error: null })
          
          // Check if Apple Sign-In is available
          if (!appleAuth.isSupported) {
            throw new Error('此裝置不支援 Apple 登入')
          }

          // Perform Apple Sign-In
          const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
          })

          const { identityToken, authorizationCode, user } = appleAuthRequestResponse

          if (!identityToken) {
            throw new Error('Apple 登入失敗：未收到身份令牌')
          }

          // Send token to backend for validation
          const response = await fetch(`${API_BASE_URL}/api/auth/oauth/apple`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              identityToken,
              authorizationCode,
              user,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Apple 登入失敗')
          }

          if (data.requiresRegistration) {
            // Return registration data for component to handle navigation
            set({ isLoading: false })
            return {
              requiresRegistration: true,
              tempOAuthId: data.tempOAuthId,
              email: data.email,
              name: data.name,
            }
          }

          // Store token and user data
          await AsyncStorage.setItem('auth_token', data.token)
          set({
            isAuthenticated: true,
            user: data.user,
            token: data.token,
            isLoading: false,
          })

          // Return success
          return {}
          
        } catch (error: any) {
          console.error('Apple Sign-In error:', error)
          set({
            error: error.message || 'Apple 登入失敗，請稍後再試',
            isLoading: false,
          })
          throw error
        }
      },

      // Regular login
      login: async (input: LoginInput) => {
        try {
          set({ isLoading: true, error: null })
          const response = await authService.login(input)
          set({
            isAuthenticated: true,
            user: response.user,
            token: response.user.accessToken,
            isLoading: false,
          })
        } catch (err) {
          const authError = err as AuthError
          set({
            error: authError.message || '登入失敗',
            isLoading: false,
          })
          throw err
        }
      },

      // Register
      register: async (input: RegisterInput) => {
        try {
          set({ isLoading: true, error: null })
          const response = await authService.register(input)
          set({
            isAuthenticated: true,
            user: response.user,
            token: response.user.accessToken,
            isLoading: false,
          })
        } catch (err) {
          const authError = err as AuthError
          set({
            error: authError.message || '註冊失敗',
            isLoading: false,
          })
          throw err
        }
      },

      // Logout
      logout: async () => {
        try {
          set({ isLoading: true })
          await authService.logout()
          await AsyncStorage.removeItem('auth_token')
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          })
        } catch (err) {
          console.error('登出時發生錯誤:', err)
          set({
            error: '登出時發生錯誤',
            isLoading: false,
          })
        }
      },

      // Update profile
      updateProfile: async (input: UpdateProfileInput) => {
        try {
          set({ isLoading: true, error: null })
          const updatedUser = await authService.updateProfile(input)
          set({
            user: updatedUser,
            isLoading: false,
          })
        } catch (err) {
          const authError = err as AuthError
          set({
            error: authError.message || '更新資料失敗',
            isLoading: false,
          })
          throw err
        }
      },

      // Reset password
      resetPassword: async (input: ResetPasswordInput) => {
        try {
          set({ isLoading: true, error: null })
          await authService.resetPassword(input)
          set({ isLoading: false })
        } catch (err) {
          const authError = err as AuthError
          set({
            error: authError.message || '重設密碼失敗',
            isLoading: false,
          })
          throw err
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },

      // Refresh user
      refreshUser: async () => {
        await get().loadUser()
      },

      // Set user manually
      setUser: (user: AuthUser | null) => {
        set({ 
          user,
          isAuthenticated: !!user 
        })
      },

      // Set token manually
      setToken: (token: string | null) => {
        set({ token })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
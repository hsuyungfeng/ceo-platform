import { ApiResponse, PaginatedResponse, PaginationParams } from '@ceo/shared'

export interface AuthService {
  refreshToken(): Promise<any>
}

export interface StorageAdapter {
  getAccessToken(): Promise<string | null>
  getRefreshToken(): Promise<string | null>
  getExpiresAt(): Promise<number | null>
  clearTokens(): Promise<void>
}

export interface ApiClientOptions {
  baseUrl?: string
  authService?: AuthService
  storage?: StorageAdapter
  enableOfflineCache?: boolean
  cacheTTL?: number
  maxRetries?: number
  retryDelay?: number
}

export class ApiClient {
  protected baseUrl: string
  protected defaultHeaders: Record<string, string>
  protected authService?: AuthService
  protected storage?: StorageAdapter
  protected enableOfflineCache: boolean
  protected cacheTTL: number
  protected maxRetries: number
  protected retryDelay: number
  protected isRefreshingToken = false
  protected refreshQueue: Array<{
    resolve: (token: string) => void
    reject: (error: Error) => void
  }> = []

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || ''
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
    this.authService = options.authService
    this.storage = options.storage
    this.enableOfflineCache = options.enableOfflineCache ?? false
    this.cacheTTL = options.cacheTTL ?? 5 * 60 * 1000
    this.maxRetries = options.maxRetries ?? 3
    this.retryDelay = options.retryDelay ?? 1000
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
    }

    if (this.authService && this.storage) {
      try {
        const accessToken = await this.storage.getAccessToken()
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`
        }
      } catch (error) {
        console.error('取得授權標頭時發生錯誤:', error)
      }
    }

    return headers
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.authService) {
      throw new Error('AuthService 未設定，無法刷新令牌')
    }

    if (this.isRefreshingToken) {
      return new Promise<string>((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject })
      })
    }

    this.isRefreshingToken = true

    try {
      const user = await this.authService.refreshToken()
      const accessToken = user.accessToken
      
      this.refreshQueue.forEach(({ resolve }) => resolve(accessToken))
      this.refreshQueue = []
      
      return accessToken
    } catch (error) {
      this.refreshQueue.forEach(({ reject }) => reject(error as Error))
      this.refreshQueue = []
      throw error
    } finally {
      this.isRefreshingToken = false
    }
  }

  private async shouldRefreshToken(): Promise<boolean> {
    if (!this.storage) return false

    try {
      const expiresAt = await this.storage.getExpiresAt()
      if (!expiresAt) return false

      const now = Date.now()
      const bufferTime = 5 * 60 * 1000
      return expiresAt - now < bufferTime
    } catch (error) {
      console.error('檢查令牌過期時發生錯誤:', error)
      return false
    }
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const headers = await this.getAuthHeaders()
      
      if (this.authService && this.storage && await this.shouldRefreshToken()) {
        try {
          await this.refreshAccessToken()
        } catch (error) {
          console.error('刷新令牌失敗:', error)
        }
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      })

      const data = await response.json()

      if (response.status === 401 && this.authService && retryCount < this.maxRetries) {
        try {
          await this.refreshAccessToken()
          return this.requestWithRetry<T>(endpoint, options, retryCount + 1)
        } catch (error) {
          console.error('令牌刷新失敗，清除令牌:', error)
          if (this.storage) {
            await this.storage.clearTokens()
          }
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `請求失敗: ${response.status}`,
          message: data.message,
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error) {
      console.error('API request failed:', error)
      
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)))
        return this.requestWithRetry<T>(endpoint, options, retryCount + 1)
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : '網路請求失敗',
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, options)
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<T>(`${endpoint}${queryString}`, {
      ...options,
      method: 'GET',
    })
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }

  async getPaginated<T>(
    endpoint: string,
    params: PaginationParams = {},
    options: RequestInit = {}
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const { page = 1, limit = 20, search, sortBy, sortOrder } = params
    
    const queryParams: Record<string, any> = {
      page,
      limit,
    }
    
    if (search) queryParams.search = search
    if (sortBy) queryParams.sortBy = sortBy
    if (sortOrder) queryParams.sortOrder = sortOrder

    return this.get<PaginatedResponse<T>>(endpoint, queryParams, options)
  }

  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  clearAuthToken() {
    delete this.defaultHeaders['Authorization']
  }

  setAuthService(authService: AuthService) {
    this.authService = authService
  }

  setStorage(storage: StorageAdapter) {
    this.storage = storage
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl
  }
}

export const apiClient = new ApiClient()

export { ReactNativeApiClient } from './react-native'
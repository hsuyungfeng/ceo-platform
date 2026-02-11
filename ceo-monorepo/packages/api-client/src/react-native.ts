import { ApiClient, ApiClientOptions } from './client'
import type { ApiResponse } from '@ceo/shared'

interface MMKVInterface {
  getString(key: string): string | undefined
  setString(key: string, value: string): void
  delete(key: string): void
  getAllKeys(): string[]
}

interface NetInfoState {
  isConnected: boolean | null
  type: string
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export class ReactNativeApiClient extends ApiClient {
  private mmkv?: MMKVInterface
  private isOnline = true

  constructor(options: ApiClientOptions & { mmkv?: MMKVInterface } = {}) {
    super(options)
    this.mmkv = options.mmkv
    
    this.setupNetworkListener()
  }

  private setupNetworkListener() {
    // This will be implemented when NetInfo is available
    this.isOnline = true
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const key = endpoint + (params ? JSON.stringify(params) : '')
    return `@ceo/api:${Buffer.from(key).toString('base64')}`
  }

  private async getFromCache<T>(cacheKey: string): Promise<CacheEntry<T> | null> {
    try {
      if (!this.mmkv) return null
      
      const cached = this.mmkv.getString(cacheKey)
      if (!cached) return null

      const entry: CacheEntry<T> = JSON.parse(cached)
      const now = Date.now()

      if (now > entry.expiresAt) {
        this.mmkv.delete(cacheKey)
        return null
      }

      return entry
    } catch (error) {
      console.error('讀取快取時發生錯誤:', error)
      return null
    }
  }

  private async setCache<T>(cacheKey: string, data: T, ttl?: number): Promise<void> {
    try {
      if (!this.mmkv) return
      
      const now = Date.now()
      const expiresAt = now + (ttl ?? this.cacheTTL)

      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt,
      }

      this.mmkv.setString(cacheKey, JSON.stringify(entry))
    } catch (error) {
      console.error('寫入快取時發生錯誤:', error)
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(endpoint, params)
    
    if (this.enableOfflineCache) {
      const cached = await this.getFromCache<T>(cacheKey)
      if (cached && (!this.isOnline || options.cache === 'force-cache')) {
        return {
          success: true,
          data: cached.data,
          message: '從快取取得資料',
        }
      }
    }

    const response = await super.get<T>(endpoint, params, options)

    if (response.success && this.enableOfflineCache && this.isOnline) {
      await this.setCache(cacheKey, response.data)
    }

    return response
  }

  async getPaginated<T>(
    endpoint: string,
    params: Record<string, any> = {},
    options: RequestInit = {}
  ): Promise<ApiResponse<any>> {
    const cacheKey = this.getCacheKey(endpoint, params)
    
    if (this.enableOfflineCache) {
      const cached = await this.getFromCache<any>(cacheKey)
      if (cached && (!this.isOnline || options.cache === 'force-cache')) {
        return {
          success: true,
          data: cached.data,
          message: '從快取取得分頁資料',
        }
      }
    }

    const response = await super.getPaginated<T>(endpoint, params, options)

    if (response.success && this.enableOfflineCache && this.isOnline) {
      await this.setCache(cacheKey, response.data)
    }

    return response
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await super.post<T>(endpoint, data, options)

    if (response.success && this.enableOfflineCache) {
      this.invalidateRelatedCache(endpoint)
    }

    return response
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await super.put<T>(endpoint, data, options)

    if (response.success && this.enableOfflineCache) {
      this.invalidateRelatedCache(endpoint)
    }

    return response
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await super.patch<T>(endpoint, data, options)

    if (response.success && this.enableOfflineCache) {
      this.invalidateRelatedCache(endpoint)
    }

    return response
  }

  async delete<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await super.delete<T>(endpoint, options)

    if (response.success && this.enableOfflineCache) {
      this.invalidateRelatedCache(endpoint)
    }

    return response
  }

  private invalidateRelatedCache(endpoint: string): void {
    try {
      if (!this.mmkv) return
      
      const keys = this.mmkv.getAllKeys()
      
      keys.forEach((key: string) => {
        if (key.startsWith('@ceo/api:')) {
          const decodedKey = Buffer.from(key.replace('@ceo/api:', ''), 'base64').toString()
          if (decodedKey.includes(endpoint.split('?')[0])) {
            this.mmkv!.delete(key)
          }
        }
      })
    } catch (error) {
      console.error('清除相關快取時發生錯誤:', error)
    }
  }

  clearCache(): void {
    try {
      if (!this.mmkv) return
      
      const keys = this.mmkv.getAllKeys()
      
      keys.forEach((key: string) => {
        if (key.startsWith('@ceo/api:')) {
          this.mmkv!.delete(key)
        }
      })
    } catch (error) {
      console.error('清除快取時發生錯誤:', error)
    }
  }

  getCacheStats(): { total: number; size: number } {
    try {
      if (!this.mmkv) return { total: 0, size: 0 }
      
      const keys = this.mmkv.getAllKeys().filter((key: string) => key.startsWith('@ceo/api:'))
      let totalSize = 0

      keys.forEach((key: string) => {
        const value = this.mmkv!.getString(key)
        if (value) {
          totalSize += value.length
        }
      })

      return {
        total: keys.length,
        size: totalSize,
      }
    } catch (error) {
      console.error('取得快取統計時發生錯誤:', error)
      return { total: 0, size: 0 }
    }
  }
}

export function createReactNativeApiClient(
  baseUrl: string,
  authService?: any,
  storage?: any,
  options: Omit<ApiClientOptions, 'baseUrl' | 'authService' | 'storage'> = {}
): ReactNativeApiClient {
  return new ReactNativeApiClient({
    baseUrl,
    authService,
    storage,
    enableOfflineCache: true,
    cacheTTL: 10 * 60 * 1000,
    maxRetries: 3,
    retryDelay: 1000,
    ...options,
  })
}
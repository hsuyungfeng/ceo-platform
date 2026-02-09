import AsyncStorage from '@react-native-async-storage/async-storage'
import type { StorageAdapter } from '../mobile'

const ACCESS_TOKEN_KEY = '@ceo/auth:accessToken'
const REFRESH_TOKEN_KEY = '@ceo/auth:refreshToken'
const EXPIRES_AT_KEY = '@ceo/auth:expiresAt'

export class ReactNativeStorageAdapter implements StorageAdapter {
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY)
    } catch (error) {
      console.error('取得存取令牌時發生錯誤:', error)
      return null
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('取得刷新令牌時發生錯誤:', error)
      return null
    }
  }

  async getExpiresAt(): Promise<number | null> {
    try {
      const expiresAt = await AsyncStorage.getItem(EXPIRES_AT_KEY)
      return expiresAt ? parseInt(expiresAt, 10) : null
    } catch (error) {
      console.error('取得令牌過期時間時發生錯誤:', error)
      return null
    }
  }

  async setTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
        AsyncStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString()),
      ])
    } catch (error) {
      console.error('儲存令牌時發生錯誤:', error)
      throw error
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(EXPIRES_AT_KEY),
      ])
    } catch (error) {
      console.error('清除令牌時發生錯誤:', error)
      throw error
    }
  }
}

export function createReactNativeAuthService(baseUrl: string): import('../mobile').AuthService {
  const storage = new ReactNativeStorageAdapter()
  const { AuthService } = require('../mobile')
  return new AuthService(baseUrl, storage)
}
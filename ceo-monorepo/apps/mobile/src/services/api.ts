import { MMKV } from 'react-native-mmkv'
import { createReactNativeAuthService } from '@ceo/auth'
import { createReactNativeApiClient } from '@ceo/api-client'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

class ApiService {
  private static instance: ApiService
  private mmkv: MMKV
  private authService: any
  private apiClient: any

  private constructor() {
    this.mmkv = new MMKV()
    this.authService = createReactNativeAuthService(API_BASE_URL)
    this.apiClient = createReactNativeApiClient(
      API_BASE_URL,
      this.authService,
      this.authService.storage,
      {
        enableOfflineCache: true,
        cacheTTL: 10 * 60 * 1000,
      }
    )
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  getClient() {
    return this.apiClient
  }

  getAuthService() {
    return this.authService
  }

  async getHomeData() {
    return this.apiClient.get('/api/home')
  }

  async getFeaturedProducts() {
    return this.apiClient.get('/api/products/featured')
  }

  async getLatestProducts() {
    return this.apiClient.get('/api/products/latest')
  }

  async getCategories() {
    return this.apiClient.get('/api/categories')
  }

  async getProducts(params?: {
    page?: number
    limit?: number
    search?: string
    categoryId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return this.apiClient.getPaginated('/api/products', params)
  }

  async getProduct(id: string) {
    return this.apiClient.get(`/api/products/${id}`)
  }

  async getCart() {
    return this.apiClient.get('/api/cart')
  }

  async addToCart(productId: string, quantity: number = 1) {
    return this.apiClient.post('/api/cart/items', { productId, quantity })
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.apiClient.put(`/api/cart/items/${itemId}`, { quantity })
  }

  async removeCartItem(itemId: string) {
    return this.apiClient.delete(`/api/cart/items/${itemId}`)
  }

  async getOrders(params?: {
    page?: number
    limit?: number
    status?: string
  }) {
    return this.apiClient.getPaginated('/api/orders', params)
  }

  async getOrder(id: string) {
    return this.apiClient.get(`/api/orders/${id}`)
  }

  async createOrder(data: {
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: any
    paymentMethod: string
  }) {
    return this.apiClient.post('/api/orders', data)
  }

  async getUserProfile() {
    return this.apiClient.get('/api/user/profile')
  }

  async updateUserProfile(data: any) {
    return this.apiClient.put('/api/user/profile', data)
  }

  async getNotifications(params?: {
    page?: number
    limit?: number
    read?: boolean
  }) {
    return this.apiClient.getPaginated('/api/notifications', params)
  }

  async markNotificationAsRead(id: string) {
    return this.apiClient.put(`/api/notifications/${id}/read`)
  }

  async markAllNotificationsAsRead() {
    return this.apiClient.put('/api/notifications/read-all')
  }

  async searchProducts(query: string, params?: {
    page?: number
    limit?: number
    categoryId?: string
  }) {
    return this.apiClient.getPaginated('/api/products/search', {
      q: query,
      ...params,
    })
  }

  async getGroupBuyProducts() {
    return this.apiClient.get('/api/products/group-buy')
  }

  async getGroupBuyProduct(id: string) {
    return this.apiClient.get(`/api/products/group-buy/${id}`)
  }

  async joinGroupBuy(productId: string, quantity: number) {
    return this.apiClient.post(`/api/products/group-buy/${productId}/join`, { quantity })
  }

  clearCache() {
    this.apiClient.clearCache()
  }

  getCacheStats() {
    return this.apiClient.getCacheStats()
  }
}

export const apiService = ApiService.getInstance()
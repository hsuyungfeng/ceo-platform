/**
 * API v1 首頁端點單元測試
 */

import { describe, test, expect } from '@jest/globals'
import { NextRequest } from 'next/server'
import { createMockNextRequest, parseApiResponse } from '@/lib/test-helpers'

// 導入首頁 API
import { GET } from '@/app/api/v1/home/route'

describe('API v1 首頁端點', () => {
  test('GET /api/v1/home - 應返回成功響應', async () => {
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/home')
    const response = await GET(request)
    const result = await parseApiResponse(response)
    
    expect(result.status).toBe(200)
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  test('GET /api/v1/home - 應包含熱門商品', async () => {
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/home')
    const response = await GET(request)
    const result = await parseApiResponse(response)
    
    expect(result.data).toHaveProperty('featuredProducts')
    expect(Array.isArray(result.data.featuredProducts)).toBe(true)
  })

  test('GET /api/v1/home - 應包含分類', async () => {
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/home')
    const response = await GET(request)
    const result = await parseApiResponse(response)
    
    expect(result.data).toHaveProperty('categories')
    expect(Array.isArray(result.data.categories)).toBe(true)
  })

  test('GET /api/v1/home - 應包含最新商品', async () => {
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/home')
    const response = await GET(request)
    const result = await parseApiResponse(response)
    
    expect(result.data).toHaveProperty('latestProducts')
    expect(Array.isArray(result.data.latestProducts)).toBe(true)
  })

  test('GET /api/v1/home - 應包含統計數據', async () => {
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/home')
    const response = await GET(request)
    const result = await parseApiResponse(response)
    
    expect(result.data).toHaveProperty('stats')
    expect(result.data.stats).toHaveProperty('totalProducts')
    expect(result.data.stats).toHaveProperty('totalCategories')
    expect(result.data.stats).toHaveProperty('activeGroupBuys')
  })

  test('GET /api/v1/home - 應包含版本標頭', async () => {
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/home')
    const response = await GET(request)
    
    expect(response.headers.get('X-API-Version')).toBe('v1')
  })

  test('GET /api/v1/home - 應包含快取控制標頭', async () => {
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/home')
    const response = await GET(request)
    
    const cacheControl = response.headers.get('Cache-Control')
    expect(cacheControl).toBeDefined()
    expect(cacheControl).toContain('public')
    expect(cacheControl).toContain('max-age')
  })
})

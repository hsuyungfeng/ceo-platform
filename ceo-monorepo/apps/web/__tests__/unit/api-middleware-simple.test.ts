/**
 * API 中介層系統單元測試 - 簡化版本
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'
import { createMockNextRequest, parseApiResponse } from '@/lib/test-helpers'

// 測試套件
describe('API 中介層系統 - 簡化測試', () => {
  let getAuthData: jest.Mock
  let middleware: any
  
  beforeEach(() => {
    jest.clearAllMocks()
    // 清除模組緩存
    jest.resetModules()
    
    // 設置模擬
    jest.mock('@/lib/auth-helper', () => ({
      getAuthData: jest.fn().mockResolvedValue(null),
    }))
    
    // 獲取模擬函數
    const authHelper = require('@/lib/auth-helper')
    getAuthData = authHelper.getAuthData as jest.Mock
    
    // 導入中間件（在模擬設置後）
    middleware = require('@/lib/api-middleware')
    
    // 設置默認模擬返回值
    getAuthData.mockResolvedValue(null)
  })

  // 測試用的處理函數類型
  type ApiHandler<T = any> = (
    request: NextRequest,
    context: { authData?: any }
  ) => Promise<NextResponse>

  // 創建測試處理函數
  const createMockHandler = (): ApiHandler<string> => async (request, context) => {
    return NextResponse.json({ success: true, data: '測試成功' }, { status: 200 })
  }

  // 測試 1: 成功響應創建
  test('createSuccessResponse - 應創建標準化的成功響應', async () => {
    const testData = { id: '123', name: '測試' }
    const response = middleware.createSuccessResponse(testData)
    
    const result = await parseApiResponse(response)
    
    expect(result.status).toBe(200)
    expect(result.success).toBe(true)
    expect(result.data).toEqual(testData)
    expect(result.error).toBeNull()
  })

  // 測試 2: 錯誤響應創建
  test('createErrorResponse - 應創建標準化的錯誤響應', async () => {
    const response = middleware.createErrorResponse(
      middleware.ErrorCode.VALIDATION_ERROR,
      '驗證錯誤',
      '詳細錯誤信息',
      400
    )
    
    const result = await parseApiResponse(response)
    
    expect(result.status).toBe(400)
    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.error).toEqual({
      code: middleware.ErrorCode.VALIDATION_ERROR,
      message: '驗證錯誤',
      details: '詳細錯誤信息'
    })
  })

  // 測試 3: 可選認證中介層 - 有認證
  test('withOptionalAuth - 應處理有認證的請求', async () => {
    // 設置模擬返回值
    getAuthData.mockResolvedValue({
      userId: 'user-123',
      user: { id: 'user-123', role: 'MEMBER' }
    })
    
    const wrappedHandler = middleware.withOptionalAuth(createMockHandler())
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/test')
    
    const response = await wrappedHandler(request)
    const result = await parseApiResponse(response)
    
    expect(result.status).toBe(200)
    expect(result.success).toBe(true)
  })

  // 測試 4: 可選認證中介層 - 無認證
  test('withOptionalAuth - 應處理無認證的請求', async () => {
    getAuthData.mockResolvedValue(null)
    
    const wrappedHandler = middleware.withOptionalAuth(createMockHandler())
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/test')
    
    const response = await wrappedHandler(request)
    const result = await parseApiResponse(response)
    
    expect(result.status).toBe(200)
    expect(result.success).toBe(true)
  })

  // 測試 5: 必需認證中介層 - 有認證
  test('withAuth - 應處理有認證的請求', async () => {
    // 設置模擬返回值
    getAuthData.mockResolvedValue({
      userId: 'user-123',
      user: { id: 'user-123', role: 'MEMBER' }
    })
    
    const wrappedHandler = middleware.withAuth()(createMockHandler())
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/test')
    
    const response = await wrappedHandler(request)
    const result = await parseApiResponse(response)
    
    expect(result.status).toBe(200)
    expect(result.success).toBe(true)
  })

  // 測試 6: 必需認證中介層 - 無認證
  test('withAuth - 應拒絕無認證的請求', async () => {
    getAuthData.mockResolvedValue(null)
    
    const wrappedHandler = middleware.withAuth()(createMockHandler())
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/test')
    
    const response = await wrappedHandler(request)
    const result = await parseApiResponse(response)
    
    expect(result.status).toBe(401)
    expect(result.success).toBe(false)
    expect(result.error?.code).toBe(middleware.ErrorCode.UNAUTHORIZED)
  })
})
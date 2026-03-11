/**
 * 測試輔助函數 - 用於測試新中介層系統的 API
 */

import { NextRequest } from 'next/server'

/**
 * 創建模擬的 NextRequest 對象
 */
export function createMockNextRequest(
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: any,
  headers: Record<string, string> = {}
): NextRequest {
  const init: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body) {
    init.body = JSON.stringify(body)
  }

  // 在測試環境中，使用簡單的模擬請求對象
  if (process.env.NODE_ENV === 'test') {
    return {
      url,
      method,
      headers: new Headers(headers),
      json: async () => body || {},
      text: async () => JSON.stringify(body || {}),
      clone: function() { return this },
    } as any
  }
  
  return new NextRequest(url, init)
}

/**
 * 創建帶有認證的模擬請求
 */
export function createAuthenticatedRequest(
  userId: string,
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: any,
  role: string = 'MEMBER'
): NextRequest {
  return createMockNextRequest(method, url, body, {
    'Authorization': `Bearer test-token-${userId}`,
    'X-User-Id': userId,
    'X-User-Role': role,
  })
}

/**
 * 創建管理員請求
 */
export function createAdminRequest(
  userId: string = 'admin-test-id',
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: any
): NextRequest {
  return createAuthenticatedRequest(userId, method, url, body, 'ADMIN')
}

/**
 * 創建供應商請求
 */
export function createSupplierRequest(
  userId: string = 'supplier-test-id',
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: any
): NextRequest {
  return createAuthenticatedRequest(userId, method, url, body, 'SUPPLIER')
}

/**
 * 解析 API 響應
 */
export async function parseApiResponse(response: any) {
  // 處理測試環境中的模擬響應對象
  if (response.json && typeof response.json === 'function') {
    const data = await response.json()
    return {
      success: data.success,
      data: data.data,
      error: data.error,
      pagination: data.pagination,
      status: response.status,
      statusText: response.statusText,
    }
  }
  
  // 處理直接返回的數據對象（測試環境中的模擬響應）
  return {
    success: response.success,
    data: response.data,
    error: response.error,
    pagination: response.pagination,
    status: response.status || 200,
    statusText: response.statusText || 'OK',
  }
}

/**
 * 測試輔助：驗證成功的 API 響應
 */
export function expectSuccessResponse(result: any, expectedData?: any) {
  expect(result.success).toBe(true)
  expect(result.error).toBeNull()
  
  if (expectedData) {
    expect(result.data).toEqual(expect.objectContaining(expectedData))
  }
}

/**
 * 測試輔助：驗證錯誤的 API 響應
 */
export function expectErrorResponse(
  result: any, 
  expectedErrorCode?: string, 
  expectedStatusCode?: number
) {
  expect(result.success).toBe(false)
  expect(result.data).toBeNull()
  expect(result.error).toBeDefined()
  
  if (expectedErrorCode) {
    expect(result.error.code).toBe(expectedErrorCode)
  }
  
  if (expectedStatusCode) {
    expect(result.status).toBe(expectedStatusCode)
  }
}

/**
 * 創建測試上下文（用於模擬中介層上下文）
 */
export function createTestContext(params: Record<string, string> = {}) {
  return {
    params: Promise.resolve(params),
    authData: null as any,
  }
}

/**
 * 設置測試認證數據
 */
export function setTestAuthData(
  context: any,
  userId: string,
  role: string = 'MEMBER',
  additionalData: any = {}
) {
  context.authData = {
    userId,
    role,
    ...additionalData,
  }
}

/**
 * 創建測試用戶對象
 */
export function createTestUser(overrides: any = {}) {
  return {
    id: 'test-user-id-' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    name: 'Test User',
    role: 'MEMBER',
    company: 'Test Company',
    phone: '0912345678',
    ...overrides,
  }
}

/**
 * 創建模擬認證數據
 */
export function mockAuthData(user: any = null) {
  if (!user) {
    user = createTestUser()
  }
  return {
    userId: user.id,
    email: user.email,
    role: user.role || 'MEMBER',
    name: user.name,
  }
}

/**
 * 創建測試請求（帶有可選的 body）
 */
export function createTestRequest(config: {
  url?: string;
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}) {
  const { url = 'http://localhost:3000/api/test', method = 'GET', body, headers = {} } = config;
  
  return {
    url,
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
    json: async () => body || {},
    text: async () => JSON.stringify(body || {}),
    clone: function() { return this },
  } as any;
}

/**
 * 創建模擬認證數據
 */
export function mockAuthData(user: any = null) {
  if (!user) {
    user = createTestUser()
  }
  return {
    userId: user.id,
    email: user.email,
    role: user.role || 'MEMBER',
    name: user.name,
  }
}
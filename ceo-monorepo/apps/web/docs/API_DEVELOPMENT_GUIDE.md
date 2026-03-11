# API 開發指南

## 概述
CEO 平台 API 開發標準指南，基於新的中介層系統。

## 快速開始

### 創建 API 端點
```typescript
import { NextRequest } from 'next/server'
import { 
  withOptionalAuth, 
  createSuccessResponse, 
  createErrorResponse,
  ErrorCode
} from '@/lib/api-middleware'
import { SYSTEM_ERRORS } from '@/lib/constants'

export const GET = withOptionalAuth(async (request: NextRequest, { authData }) => {
  try {
    const data = { message: 'Hello World' }
    return createSuccessResponse(data)
  } catch (error) {
    console.error('API 錯誤:', error)
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      SYSTEM_ERRORS.INTERNAL_ERROR,
      error instanceof Error ? error.message : '未知錯誤'
    )
  }
})
```

## 中介層系統

| 中介層 | 描述 | 使用場景 |
|--------|------|----------|
| `withOptionalAuth` | 可選認證 | 公開 API |
| `withAuth` | 必需認證 | 需要登入的 API |
| `withAdminAuth` | 管理員認證 | 僅管理員可訪問 |
| `withSupplierAuth` | 供應商認證 | 僅供應商可訪問 |
| `withWholesalerAuth` | 批發商認證 | 僅批發商可訪問 |

## 錯誤處理

### 錯誤響應格式
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "驗證錯誤",
    "details": "詳細錯誤信息"
  },
  "pagination": null
}
```

### 預定義錯誤代碼
```typescript
ErrorCode.VALIDATION_ERROR      // 驗證錯誤 (400)
ErrorCode.UNAUTHORIZED          // 未授權 (401)
ErrorCode.FORBIDDEN             // 禁止訪問 (403)
ErrorCode.NOT_FOUND             // 資源不存在 (404)
ErrorCode.CONFLICT              // 資源衝突 (409)
ErrorCode.INTERNAL_ERROR        // 內部錯誤 (500)
ErrorCode.SERVICE_UNAVAILABLE   // 服務不可用 (503)
ErrorCode.RATE_LIMIT_EXCEEDED   // 速率限制超出 (429)
```

## 認證與授權

### 認證頭部
```
Authorization: Bearer <token>
X-User-Id: <user-id>
X-User-Role: <user-role>
```

### 訪問認證數據
```typescript
export const GET = withAuth(async (request, { authData }) => {
  const userId = authData?.userId
  const userRole = authData?.role
  // 業務邏輯...
})
```

## 請求驗證

### 使用 Zod 驗證
```typescript
import { z } from 'zod'
import { PAGINATION } from '@/lib/constants'

const CreateProductSchema = z.object({
  name: z.string().min(1, '商品名稱必填'),
  price: z.number().positive('價格必須為正數')
})

export const POST = withAuth(async (request, { authData }) => {
  try {
    const body = await request.json()
    const validatedData = CreateProductSchema.parse(body)
    // 業務邏輯...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        '驗證錯誤',
        error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      )
    }
    throw error
  }
})
```

## 響應格式

### 成功響應格式
```json
{
  "success": true,
  "data": { /* 響應數據 */ },
  "error": null,
  "pagination": { /* 分頁信息 */ }
}
```

### 創建成功響應
```typescript
// 基本成功響應
return createSuccessResponse({ id: '123', name: '測試' })

// 帶分頁的成功響應
return createSuccessResponse(
  items,
  { page: 1, limit: 10, total: 100, totalPages: 10 }
)

// 帶自定義狀態碼和頭部
return createSuccessResponse(
  createdItem,
  undefined,
  201,
  { 'Location': `/api/items/${createdItem.id}` }
)
```

## 分頁處理

### 分頁參數
```typescript
import { PAGINATION } from '@/lib/constants'

PAGINATION.DEFAULT_PAGE     // 1
PAGINATION.DEFAULT_LIMIT    // 20
PAGINATION.MAX_LIMIT        // 100
```

### 分頁實現
```typescript
export const GET = withOptionalAuth(async (request) => {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = (page - 1) * limit
  
  const [items, total] = await Promise.all([
    prisma.product.findMany({ skip: offset, take: limit }),
    prisma.product.count()
  ])
  
  const totalPages = Math.ceil(total / limit)
  const pagination = {
    page, limit, total, totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
  
  return createSuccessResponse(items, pagination)
})
```

## 測試指南

### 測試輔助工具
```typescript
import { 
  createMockNextRequest, 
  parseApiResponse,
  expectSuccessResponse,
  expectErrorResponse
} from '@/lib/test-helpers'

// 創建模擬請求
const request = createMockNextRequest('GET', '/api/test')

// 解析響應
const response = await handler(request)
const result = await parseApiResponse(response)

// 驗證響應
expectSuccessResponse(result, expectedData)
expectErrorResponse(result, expectedErrorCode, expectedStatusCode)
```

## 最佳實踐

1. **錯誤處理**: 總是使用 `try-catch`，記錄錯誤但不暴露敏感信息
2. **認證與授權**: 使用中介層檢查，驗證用戶權限
3. **性能優化**: 使用並行查詢，實現分頁，使用索引
4. **安全性**: 驗證所有輸入，使用參數化查詢，限制請求頻率
5. **代碼組織**: 保持處理函數簡潔，提取業務邏輯到服務層

## 常見模式

### CRUD 操作
```typescript
// 創建資源
export const POST = withAuth(async (request, { authData }) => {
  // 驗證請求數據，創建資源，返回創建的資源
})

// 讀取資源列表
export const GET = withOptionalAuth(async (request) => {
  // 解析查詢參數，查詢資源列表，返回分頁結果
})

// 讀取單個資源
export const GET = withOptionalAuth(async (request, { params }) => {
  // 從 params 獲取資源 ID，查詢資源，返回資源或 404
})

// 更新資源
export const PATCH = withAuth(async (request, { authData, params }) => {
  // 驗證用戶權限，驗證請求數據，更新資源，返回更新的資源
})

// 刪除資源
export const DELETE = withAuth(async (request, { authData, params }) => {
  // 驗證用戶權限，刪除資源，返回成功響應
})
```

## 相關文件

- `src/lib/api-middleware.ts` - 中介層系統實現
- `src/lib/constants.ts` - 常量和配置
- `src/lib/test-helpers.ts` - 測試輔助工具
- `__tests__/unit/api-middleware.test.ts` - 中介層測試範例

---

**最後更新**: 2026-03-09
**版本**: 1.0.0
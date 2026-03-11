# API v1 參考文件

## 概述

CEO 平台 v1 API 提供標準化的 RESTful 接口，使用統一的中間件系統進行認證、授權和錯誤處理。

**版本**: v1  
**基礎 URL**: `/api/v1`  
**內容類型**: `application/json`  
**認證**: Bearer Token 或 Session Cookie

---

## 通用規範

### 請求頭部

| 頭部 | 描述 | 必需 |
|------|------|------|
| `Authorization` | Bearer Token: `Bearer <token>` | 可選 |
| `Content-Type` | 必須為 `application/json` | 是（POST/PUT） |
| `Accept` | 建議為 `application/json` | 否 |
| `X-API-Version` | API 版本，固定為 `v1` | 否 |

### 響應格式

所有 API 響應都遵循標準格式：

```json
{
  "success": true,
  "data": {...},
  "error": null,
  "pagination": {...}
}
```

或錯誤響應：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤描述",
    "details": {...}
  }
}
```

### 錯誤代碼

| 代碼 | HTTP 狀態 | 描述 |
|------|-----------|------|
| `UNAUTHORIZED` | 401 | 未認證或認證失敗 |
| `FORBIDDEN` | 403 | 權限不足 |
| `NOT_FOUND` | 404 | 資源不存在 |
| `VALIDATION_ERROR` | 400 | 輸入驗證失敗 |
| `CONFLICT` | 409 | 資源衝突 |
| `INTERNAL_ERROR` | 500 | 伺服器內部錯誤 |
| `SERVICE_UNAVAILABLE` | 503 | 服務暫時不可用 |

### 分頁

支援分頁的 API 會返回 `pagination` 字段：

```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

查詢參數：
- `page`: 頁碼（預設: 1）
- `limit`: 每頁數量（預設: 20，最大: 100）

---

## API 端點

### 健康檢查

#### GET `/api/v1/health`

檢查系統健康狀態。

**認證**: 可選  
**查詢參數**: 無

**響應示例**:
```json
{
  "success": true,
  "data": {
    "timestamp": "2026-03-10T04:00:00.000Z",
    "version": "v1",
    "status": "healthy",
    "uptime": 3600,
    "checks": {
      "database": {
        "status": "healthy",
        "responseTime": 15
      },
      "memory": {
        "status": "healthy",
        "used": 45.2
      }
    }
  }
}
```

**狀態碼**:
- `200`: 健康
- `207`: 部分健康（多狀態）
- `503`: 不健康

---

### 首頁數據

#### GET `/api/v1/home`

獲取首頁需要的所有數據。

**認證**: 可選  
**查詢參數**: 無

**響應示例**:
```json
{
  "success": true,
  "data": {
    "featuredProducts": [...],
    "categories": [...],
    "latestProducts": [...],
    "stats": {
      "totalProducts": 150,
      "activeSuppliers": 25,
      "totalOrders": 1200
    }
  }
}
```

---

### 用戶資料

#### GET `/api/v1/user/profile`

獲取當前用戶的個人資料。

**認證**: 必需  
**查詢參數**: 無

**響應示例**:
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "張三",
    "role": "MEMBER",
    "phone": "0912345678",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-03-10T00:00:00.000Z"
  }
}
```

**錯誤碼**:
- `401`: 未認證

---

### 供應商管理

#### GET `/api/v1/suppliers`

獲取供應商列表。

**認證**: 可選  
**查詢參數**:
- `status`: 狀態 (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `ALL`)，預設: `ACTIVE`
- `page`: 頁碼，預設: 1
- `limit`: 每頁數量，預設: 20
- `search`: 搜尋關鍵字

**響應示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "supplier-123",
      "taxId": "12345678",
      "companyName": "測試公司",
      "contactPerson": "李四",
      "phone": "0223456789",
      "email": "supplier@example.com",
      "status": "ACTIVE",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST `/api/v1/suppliers`

註冊新供應商。

**認證**: 必需  
**請求體**:
```json
{
  "taxId": "12345678",
  "companyName": "測試公司",
  "contactPerson": "李四",
  "phone": "0223456789",
  "email": "supplier@example.com",
  "address": "台北市信義區",
  "industry": "電子商務",
  "description": "公司描述"
}
```

**響應示例**:
```json
{
  "success": true,
  "data": {
    "id": "supplier-123",
    "applicationId": "app-123",
    "status": "PENDING",
    "message": "供應商申請已提交，審核中"
  }
}
```

---

### 供應商申請

#### GET `/api/v1/supplier-applications`

獲取供應商申請列表（僅管理員）。

**認證**: 必需（管理員）  
**查詢參數**:
- `status`: 狀態 (`PENDING`, `APPROVED`, `REJECTED`, `ALL`)，預設: `PENDING`
- `page`: 頁碼，預設: 1
- `limit`: 每頁數量，預設: 20

#### POST `/api/v1/supplier-applications/{id}/approve`

批准供應商申請（僅管理員）。

**認證**: 必需（管理員）  
**路徑參數**: `id` - 申請 ID

#### POST `/api/v1/supplier-applications/{id}/reject`

拒絕供應商申請（僅管理員）。

**認證**: 必需（管理員）  
**路徑參數**: `id` - 申請 ID  
**請求體**:
```json
{
  "reason": "拒絕原因"
}
```

---

### 訂單管理

#### GET `/api/v1/orders`

獲取訂單列表。

**認證**: 必需  
**查詢參數**:
- `status`: 訂單狀態
- `page`: 頁碼，預設: 1
- `limit`: 每頁數量，預設: 20
- `startDate`: 開始日期 (ISO)
- `endDate`: 結束日期 (ISO)

**響應示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "order-123",
      "orderNo": "ORD-20260310-001",
      "userId": "user-123",
      "status": "COMPLETED",
      "totalAmount": 1500,
      "paymentMethod": "CREDIT_CARD",
      "createdAt": "2026-03-10T00:00:00.000Z",
      "items": [
        {
          "productId": "product-123",
          "productName": "測試商品",
          "quantity": 2,
          "unitPrice": 500,
          "totalPrice": 1000
        }
      ]
    }
  ],
  "pagination": {...}
}
```

#### POST `/api/v1/orders`

創建新訂單。

**認證**: 必需  
**請求體**:
```json
{
  "items": [
    {
      "productId": "product-123",
      "quantity": 2
    }
  ],
  "shippingAddress": "收貨地址",
  "paymentMethod": "CREDIT_CARD",
  "note": "訂單備註"
}
```

---

### Sentry 健康檢查

#### GET `/api/v1/health/sentry-example`

Sentry 集成示例端點。

**認證**: 可選  
**查詢參數**: 無

**功能**:
- 測試 Sentry 錯誤捕獲
- 測試 Sentry 性能跟踪
- 返回 Sentry 配置狀態

---

## 認證與授權

### 認證方式

1. **Bearer Token** (推薦用於移動端)
   ```
   Authorization: Bearer <jwt-token>
   ```

2. **Session Cookie** (用於網頁端)
   - 自動處理 by NextAuth.js

### 角色權限

| 角色 | 描述 | 權限 |
|------|------|------|
| `MEMBER` | 普通會員 | 基本功能 |
| `SUPPLIER` | 供應商 | 商品管理、訂單查看 |
| `WHOLESALER` | 批發商 | 批量採購、價格優惠 |
| `ADMIN` | 管理員 | 系統管理、用戶管理 |
| `SUPER_ADMIN` | 超級管理員 | 所有權限 |

### 中間件快捷方式

- `withAuth()`: 必需認證
- `withOptionalAuth()`: 可選認證
- `withAdminAuth()`: 管理員認證
- `withSupplierAuth()`: 供應商認證
- `withWholesalerAuth()`: 批發商認證

---

## 錯誤處理示例

### 驗證錯誤
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "輸入驗證失敗",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "請輸入有效的電子郵件"
        }
      ]
    }
  }
}
```

### 認證錯誤
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "需要登入才能訪問此資源"
  }
}
```

### 權限錯誤
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "角色權限不足"
  }
}
```

---

## 最佳實踐

### 客戶端使用

```javascript
// 使用 fetch 調用 API
async function callApi(endpoint, options = {}) {
  const response = await fetch(`/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'API 錯誤');
  }
  
  return result;
}

// 使用示例
try {
  const result = await callApi('/user/profile');
  console.log('用戶資料:', result.data);
} catch (error) {
  console.error('API 錯誤:', error.message);
}
```

### 錯誤處理

```javascript
// 統一錯誤處理
function handleApiError(error) {
  if (error.response?.status === 401) {
    // 重新導向到登入頁
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // 顯示權限不足訊息
    alert('權限不足，無法執行此操作');
  } else {
    // 顯示一般錯誤訊息
    alert(`操作失敗: ${error.message}`);
  }
}
```

### 分頁處理

```javascript
// 分頁數據加載
async function loadPaginatedData(endpoint, page = 1, limit = 20) {
  const result = await callApi(`${endpoint}?page=${page}&limit=${limit}`);
  
  return {
    data: result.data,
    pagination: result.pagination,
    hasMore: result.pagination?.hasNext || false,
  };
}
```

---

## 版本控制

- 所有 v1 API 保持向後兼容
- 重大變更將通過新版本 (v2) 發布
- 棄用的 API 將有至少 6 個月的過渡期

---

## 監控與日誌

### Sentry 集成

所有 API 錯誤自動捕獲到 Sentry，包括：
- 未處理的異常
- 驗證錯誤
- 資料庫錯誤
- 性能瓶頸

### 自定義監控

```typescript
// 使用 Sentry helper
import { captureApiError, startPerformanceTrace } from '@/lib/sentry-helper';

// 捕獲 API 錯誤
try {
  // API 調用
} catch (error) {
  captureApiError(error, {
    endpoint: '/api/v1/orders',
    method: 'GET',
    userId: 'user-123',
  });
}

// 性能跟踪
const trace = startPerformanceTrace('load-orders', '訂單加載');
// ... 操作
trace.finish();
```

---

## 附錄

### 環境變數

| 變數 | 描述 | 預設值 |
|------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | API 基礎 URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | 無 |
| `NODE_ENV` | 環境 | `development` |

### 開發工具

1. **API 測試腳本**: `test-v1-apis.js`
2. **Sentry 測試頁面**: `/sentry-test`
3. **健康檢查**: `/api/v1/health`

### 支援

如有問題，請參考：
1. 本文檔
2. API 源代碼註解
3. Sentry 錯誤日誌
4. 系統日誌文件
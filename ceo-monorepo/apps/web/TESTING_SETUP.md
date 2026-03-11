# 測試環境設置指南

## 概述

本文檔說明如何設置和使用 CEO 平台的測試環境，特別是使用 Docker PostgreSQL 進行整合測試。

## 快速開始

### 1. 啟動測試資料庫

```bash
# 啟動測試 PostgreSQL 容器
npm run test:db:start

# 檢查容器狀態
npm run test:db:status

# 查看容器日誌
npm run test:db:logs
```

### 2. 初始化測試資料庫

```bash
# 應用 Prisma 遷移到測試資料庫
npm run test:db:push

# 插入測試種子資料（可選）
npm run test:db:seed
```

### 3. 執行整合測試

```bash
# 執行所有整合測試
npm run test:integration

# 監視模式執行
npm run test:integration:watch

# 執行並產生測試覆蓋率報告
npm run test:integration:coverage
```

### 4. 停止測試環境

```bash
# 停止並清理測試容器
npm run test:db:stop
```

## 測試環境架構

### 測試資料庫配置

- **容器名稱**: `ceo-postgres-test`
- **端口**: `5433` (避免與開發環境的 `5432` 衝突)
- **資料庫名稱**: `ceo_platform_test`
- **使用者名稱**: `ceo_test`
- **密碼**: `TestPassword123!`
- **連接字串**: `postgresql://ceo_test:TestPassword123!@localhost:5433/ceo_platform_test`

### 環境變數

測試環境使用獨立的環境變數檔案：

- **`.env.test.local`**: 測試環境變數配置
- **`DATABASE_URL_TEST`**: 測試資料庫連接字串
- **`NODE_ENV=test`**: 標識測試環境

### 測試類型

| 測試類型 | 配置檔案 | 描述 | 資料庫 |
|---------|---------|------|-------|
| **單元測試** | `jest.config.js` | 測試獨立單元，使用模擬 | 無需真實資料庫 |
| **整合測試** | `jest.config.integration.js` | 測試 API 端點和資料庫互動 | 真實測試 PostgreSQL |
| **E2E 測試** | `jest.config.js` | 端到端流程測試 | 真實測試 PostgreSQL |

## 整合測試開發指南

### 建立新的整合測試

1. **檔案命名**: 使用 `.integration.test.ts` 後綴
2. **檔案位置**: 放置在 `__tests__/integration/` 目錄
3. **導入 Prisma**: 使用 `@/lib/prisma-test` 模組

### 整合測試範例

```typescript
import { describe, test, expect, beforeEach } from '@jest/globals'
import { prismaTest } from '@/lib/prisma-test'

describe('供應商 API 整合測試', () => {
  
  beforeEach(async () => {
    // 每個測試前會自動重置資料庫
  })
  
  test('GET /api/suppliers - 應返回供應商列表', async () => {
    // 建立測試資料
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `test-${Date.now()}`,
        companyName: `測試公司 ${Date.now()}`,
        // ... 其他欄位
      },
    })
    
    // 驗證資料
    expect(supplier).toBeDefined()
    expect(supplier.companyName).toContain('測試公司')
  })
})
```

### 測試輔助函數

整合測試環境提供以下全局輔助函數：

```typescript
// 建立測試用戶
const user = await global.createTestUser({
  email: 'custom.user@example.com',
  role: 'ADMIN'
})

// 建立測試產品
const product = await global.createTestProduct({
  name: '客製化測試產品',
  price: 150.00
})

// 建立測試供應商
const supplier = await global.createTestSupplier({
  companyName: '客製化測試供應商'
})
```

### 測試資料生命週期

1. **`beforeAll`**: 在所有測試之前執行一次，建立基礎測試資料
2. **`beforeEach`**: 每個測試之前執行，重置資料庫到乾淨狀態
3. **測試執行**: 在乾淨的資料庫上執行測試邏輯
4. **`afterEach`**: 每個測試之後執行，可選的清理工作
5. **`afterAll`**: 所有測試之後執行，關閉資料庫連接

## 測試配置詳解

### Jest 整合測試配置 (`jest.config.integration.js`)

- **`testEnvironment: 'jest-environment-node'`**: 使用 Node.js 環境而非 jsdom
- **`maxWorkers: 1`**: 順序執行測試，避免資料庫衝突
- **`testTimeout: 30000`**: 30 秒超時（整合測試可能需要更長時間）
- **`runner: 'jest-serial-runner'`**: 序列化執行測試

### Prisma 測試配置 (`src/lib/prisma-test.ts`)

- **環境感知**: 自動使用 `DATABASE_URL_TEST` 環境變數
- **連接池管理**: 優化的連接池配置
- **資料庫重置**: 提供 `resetTestDatabase()` 函數
- **遷移應用**: 提供 `applyTestMigrations()` 函數

## 常見問題排查

### 問題 1: 無法連接測試資料庫

```bash
# 檢查容器是否運行
docker ps | grep ceo-postgres-test

# 檢查容器日誌
docker logs ceo-postgres-test

# 檢查端口是否被佔用
sudo lsof -i :5433
```

**解決方案**:
1. 確保 Docker 正在運行
2. 端口 `5433` 未被其他程式佔用
3. 嘗試重啟容器: `npm run test:db:restart`

### 問題 2: 遷移失敗

```bash
# 檢查 Prisma schema 是否有效
npx prisma validate

# 重置測試資料庫
npm run test:db:reset

# 強制應用遷移
npm run test:db:push
```

### 問題 3: 測試執行緩慢

**優化建議**:
1. 減少 `beforeEach` 中的資料庫操作
2. 使用更少的測試資料
3. 考慮並行執行不相關的測試（修改 `maxWorkers` 配置）

### 問題 4: 測試間資料污染

**解決方案**:
1. 確保每個測試使用唯一的識別符（如 `Date.now()`）
2. 驗證 `beforeEach` 中的資料庫重置正常運作
3. 使用事務來隔離測試操作

## 最佳實踐

### 1. 測試獨立性

每個測試應該獨立，不依賴其他測試的執行順序或狀態。

```typescript
// 好的做法：使用唯一識別符
const uniqueId = Date.now()
const supplier = await prismaTest.supplier.create({
  data: {
    taxId: `test-${uniqueId}`,
    companyName: `測試公司 ${uniqueId}`,
    // ...
  }
})

// 壞的做法：使用固定值
const supplier = await prismaTest.supplier.create({
  data: {
    taxId: 'fixed-tax-id', // 可能與其他測試衝突
    // ...
  }
})
```

### 2. 測試資料清理

使用 `beforeEach` 確保每個測試從乾淨的狀態開始：

```typescript
beforeEach(async () => {
  // 資料庫會在全局 beforeEach 中自動重置
  // 無需額外清理，除非有特殊需求
})
```

### 3. 測試斷言明確

提供明確的錯誤訊息，方便問題排查：

```typescript
// 好的做法：明確的錯誤訊息
expect(supplier.status).toBe('ACTIVE')

// 更好的做法：自定義錯誤訊息
expect(supplier.status).toBe('ACTIVE')
```

### 4. 測試效能

- 避免在測試中建立大量資料
- 使用索引優化查詢
- 考慮使用快取重複的建立操作

## 進階主題

### 測試 API 端點

整合測試可以直接測試 API 端點：

```typescript
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/suppliers/route'

test('GET /api/suppliers 端點測試', async () => {
  const request = new NextRequest('http://localhost:3000/api/suppliers')
  const response = await GET(request)
  
  expect(response.status).toBe(200)
  const data = await response.json()
  expect(Array.isArray(data)).toBe(true)
})
```

### 測試認證和授權

使用測試輔助函數建立已認證的請求：

```typescript
test('需要認證的 API 端點', async () => {
  // 建立測試用戶
  const user = await global.createTestUser()
  
  // 模擬認證 token
  const authToken = createTestAuthToken(user.id)
  
  // 建立認證請求
  const request = new NextRequest('http://localhost:3000/api/protected', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  })
  
  const response = await protectedHandler(request)
  expect(response.status).toBe(200)
})
```

### 測試錯誤處理

確保錯誤情況被正確處理：

```typescript
test('無效輸入應返回錯誤', async () => {
  const invalidData = {
    // 無效的資料
  }
  
  const request = new NextRequest('http://localhost:3000/api/suppliers', {
    method: 'POST',
    body: JSON.stringify(invalidData)
  })
  
  const response = await POST(request)
  expect(response.status).toBe(400)
  
  const error = await response.json()
  expect(error.message).toContain('驗證失敗')
})
```

## 資源

- [Prisma 測試指南](https://www.prisma.io/docs/guides/testing)
- [Jest 整合測試](https://jestjs.io/docs/testing-frameworks)
- [Docker Compose 文件](https://docs.docker.com/compose/)

---

**最後更新**: 2026-03-05  
**版本**: 1.0.0
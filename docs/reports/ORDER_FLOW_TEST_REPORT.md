# CEO團購電商平台 - 訂單流程測試報告

## 測試時間
2026年2月9日

## 測試環境
- Web App: http://localhost:3000
- 測試使用者: taxId=12345678, password=admin123
- 測試商品: prod003 (感冒熱飲)

## 測試目標
1. 檢查訂單相關端點
2. 測試訂單功能 (建立、列表、詳情、取消)
3. 檢查 Bearer Token 支援
4. 測試完整訂單流程
5. 識別 Mobile App 整合問題

## 訂單相關端點分析

### 1. 使用者訂單端點

#### `/api/orders` (GET)
- **功能**: 取得使用者訂單列表
- **HTTP方法**: GET
- **驗證方式**: Session Cookie ✅
- **Bearer Token**: ❌ 不支援
- **必要參數**: 
  - `page` (預設: 1) - 頁碼
  - `limit` (預設: 20, 範圍: 1-100) - 每頁數量
- **選項參數**:
  - `status` - 訂單狀態 (PENDING, CONFIRMED, SHIPPED, COMPLETED, CANCELLED)
- **問題**: 
  - 當 `status` 參數未提供時，會傳回 `null` 給 Zod 驗證
  - Zod 的 `.optional()` 期望 `undefined`，但收到 `null` 導致驗證失敗
  - 錯誤訊息: `"Invalid option: expected one of \"PENDING\"|\"CONFIRMED\"|\"SHIPPED\"|\"COMPLETED\"|\"CANCELLED\""`

#### `/api/orders` (POST)
- **功能**: 建立新訂單
- **HTTP方法**: POST
- **驗證方式**: Session Cookie ✅
- **Bearer Token**: ❌ 不支援
- **請求體**:
  ```json
  {
    "note": "備註文字 (選填，最多500字)"
  }
  ```
- **問題**:
  - 返回 HTTP 500 錯誤: `{"error":"伺服器錯誤，請稍後再試"}`
  - 需要檢查資料庫連線、交易處理或業務邏輯錯誤

#### `/api/orders/[id]` (GET)
- **功能**: 取得訂單詳情
- **HTTP方法**: GET
- **驗證方式**: Session Cookie ✅
- **Bearer Token**: ❌ 不支援
- **回應**: 包含訂單詳細資訊、商品明細和使用者資料

#### `/api/orders/[id]` (PATCH)
- **功能**: 取消訂單
- **HTTP方法**: PATCH
- **驗證方式**: Session Cookie ✅
- **Bearer Token**: ❌ 不支援
- **限制**: 只能取消狀態為 PENDING 的訂單

### 2. 管理員訂單端點

#### `/api/admin/orders` (GET)
- **功能**: 管理員取得所有訂單列表
- **驗證方式**: Session Cookie ✅
- **權限**: 需要 ADMIN 角色

#### `/api/admin/orders/[id]` (GET, PATCH)
- **功能**: 管理員取得/更新訂單
- **驗證方式**: Session Cookie ✅
- **權限**: 需要 ADMIN 角色

## Bearer Token 支援測試結果

### 支援 Bearer Token 的端點
1. `/api/user/profile` (GET) - ✅ **唯一支援 Bearer Token 的端點**
   - 使用 `getToken()` 驗證 Bearer Token
   - 支援 session cookie 後備機制

### 不支援 Bearer Token 的端點
1. `/api/orders` (所有方法) - ❌ 不支援
2. `/api/orders/[id]` (所有方法) - ❌ 不支援
3. `/api/cart` (所有方法) - ❌ 不支援
4. `/api/auth/me` (GET) - ❌ 不支援
5. `/api/auth/logout` (POST) - ❌ 不支援
6. 所有管理員端點 - ❌ 不支援

## 完整訂單流程測試結果

### 成功測試的步驟
1. ✅ 登入 (`/api/auth/login`) - 使用 session cookie
2. ✅ 加入商品到購物車 (`/api/cart` POST) - 使用 session cookie
3. ✅ 查看購物車 (`/api/cart` GET) - 使用 session cookie
4. ✅ 取得使用者資料 (`/api/user/profile` GET) - 使用 session cookie

### 失敗的步驟
1. ❌ 取得訂單列表 (`/api/orders` GET) - Zod 驗證錯誤 (status 參數問題)
2. ❌ 建立訂單 (`/api/orders` POST) - HTTP 500 伺服器錯誤
3. ❌ 使用 Bearer Token 存取任何訂單相關端點

### 未測試的步驟 (因上述失敗)
1. 取得訂單詳情 (`/api/orders/[id]` GET)
2. 取消訂單 (`/api/orders/[id]` PATCH)

## 發現的問題

### 1. Bearer Token 支援嚴重不足
- **問題**: 只有 `/api/user/profile` 端點支援 Bearer Token
- **影響**: Mobile App 無法使用大多數 API 功能
- **根本原因**: API 端點使用 `auth()` 函數驗證，該函數只檢查 session cookie

### 2. 訂單建立功能故障
- **問題**: `/api/orders` POST 返回 HTTP 500 錯誤
- **可能原因**:
  - 資料庫連線問題
  - 交易處理錯誤
  - 業務邏輯錯誤 (價格計算、庫存檢查等)
  - 缺少必要的資料或關聯

### 3. 參數驗證邏輯錯誤
- **問題**: `/api/orders` GET 的 `status` 參數驗證失敗
- **根本原因**: Zod schema 收到 `null` 值但期望 `undefined`
- **程式碼問題**:
  ```typescript
  // 當前問題
  status: searchParams.get('status') // 返回 null 如果參數不存在
  
  // Zod schema
  status: z.enum([...]).optional() // 期望 undefined，但收到 null
  ```

### 4. 認證機制不一致
- **問題**: 混合使用 session cookie 和 Bearer Token
- **影響**: 開發者需要處理兩種不同的認證方式
- **現狀**:
  - Web 前端: 使用 session cookie
  - Mobile App: 需要 Bearer Token 但大部分端點不支援

## Mobile App 整合問題總結

### 阻擋性問題 (Blockers)
1. **訂單功能完全無法使用**
   - 訂單建立返回 HTTP 500 錯誤
   - Mobile App 無法完成購買流程

2. **認證機制不支援 Mobile App**
   - 只有 1 個端點支援 Bearer Token
   - Mobile App 無法存取購物車、訂單等核心功能

### 功能性問題
1. **API 參數驗證錯誤**
   - 訂單列表端點有 Zod 驗證問題
   - 需要修復才能正常使用

2. **缺少 Mobile App 必要功能**
   - 沒有 token 取得/刷新端點
   - 沒有專門的 Mobile API 版本

## 修復建議

### 高優先級 (Mobile App 整合必需)
1. **修復訂單建立功能**
   - 調查 HTTP 500 錯誤原因
   - 修復資料庫交易或業務邏輯錯誤

2. **修復訂單列表參數驗證**
   - 修改 `/api/orders` GET 端點的 Zod schema
   - 將 `status: z.enum([...]).optional()` 改為 `status: z.enum([...]).optional().nullable()`

3. **為所有保護端點新增 Bearer Token 支援**
   - 修改 `auth()` 函數或建立中介軟體
   - 支援同時接受 session cookie 和 Bearer Token
   - 受影響端點: `/api/orders/*`, `/api/cart/*`, `/api/auth/me`

### 中優先級 (改善使用者體驗)
1. **新增 Mobile App 專用端點**
   - `/api/auth/token` - 取得 JWT token
   - `/api/auth/refresh` - 刷新 token
   - `/api/mobile/*` - Mobile 專用 API 版本

2. **統一認證機制**
   - 建立共用的認證中介軟體
   - 支援多種認證方式 (session, Bearer Token, API key)

### 低優先級 (長期改善)
1. **API 文件化**
   - 建立完整的 API 文件
   - 說明認證方式和參數格式

2. **錯誤處理改善**
   - 提供更詳細的錯誤訊息
   - 實作錯誤代碼系統

## 技術細節

### 當前認證實作
```typescript
// 訂單端點使用的方式
const session = await auth(); // 只檢查 session cookie

// 使用者資料端點使用的方式
const token = await getToken({ req: request }); // 檢查 Bearer Token
```

### 建議的修復方案
```typescript
// 統一的認證中介軟體
async function authenticate(request: NextRequest) {
  // 1. 嘗試 Bearer Token
  const token = await getToken({ req: request });
  if (token) return { user: token };
  
  // 2. 嘗試 session cookie
  const session = await auth();
  if (session?.user) return session;
  
  // 3. 未授權
  return null;
}
```

## 測試資料
- 測試使用者: taxId=12345678, password=admin123 (SUPER_ADMIN 角色)
- 測試商品: prod003 (感冒熱飲)
- 測試環境: http://localhost:3000

## 結論
CEO團購電商平台的訂單流程目前**不適合 Mobile App 整合**，主要問題有：

1. **核心功能故障**: 訂單建立返回 HTTP 500 錯誤
2. **認證機制缺失**: 大多數端點不支援 Bearer Token
3. **參數驗證錯誤**: 訂單列表端點有 Zod schema 問題

**建議行動順序**:
1. 立即修復訂單建立功能的 HTTP 500 錯誤
2. 修復訂單列表的參數驗證問題
3. 為所有保護端點新增 Bearer Token 支援
4. 測試完整訂單流程確保功能正常
5. 進行 Mobile App 整合測試
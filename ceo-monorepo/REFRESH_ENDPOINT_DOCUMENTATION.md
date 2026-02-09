# Token Refresh Endpoint Documentation

## 端點位置
`POST /api/auth/refresh`

## 用途
為 Mobile App API 提供 JWT token 刷新功能，允許使用者在 token 過期後（7天寬限期內）取得新的 token。

## 請求格式

### Headers
```
Authorization: Bearer <old-jwt-token>
Content-Type: application/json
```

### 請求範例
```bash
curl -X POST \
  -H "Authorization: Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiUnpzM1BLUWdJa3RxaDVLZmd0WktxOWFrVmFabDFWeWswdS1lby1ONmEwSFNwM2hybFhnZW1ZZXY3R3JxYV84dFFLcXgtVkdnaWg3Q3h3TU9SaTlUMkEifQ..." \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/auth/refresh
```

## 回應格式

### 成功回應 (200)
```json
{
  "message": "Token 刷新成功",
  "token": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiUnpzM1BLUWdJa3RxaDVLZmd0WktxOWFrVmFabDFWeWswdS1lby1ONmEwSFNwM2hybFhnZW1ZZXY3R3JxYV84dFFLcXgtVkdnaWg3Q3h3TU9SaTlUMkEifQ...",
  "expiresAt": "2026-03-11T10:30:00.000Z"
}
```

### 錯誤回應

#### 401 - 未授權
```json
{
  "error": "未提供有效的 Authorization header。請使用 Bearer Token 格式"
}
```

```json
{
  "error": "Token 無效或已過期"
}
```

#### 405 - 方法不允許
```json
{
  "error": "此端點僅支援 POST 方法。請使用 POST 請求並提供 Bearer Token"
}
```

#### 500 - 伺服器錯誤
```json
{
  "error": "伺服器錯誤，請稍後再試"
}
```

## Token 驗證規則

### 有效條件（滿足以下任一即可）：
1. **Token 未過期**：exp > 當前時間
2. **Token 在寬限期內**：exp < 當前時間，但 (當前時間 - exp) ≤ 7天

### 無效條件：
1. **Token 格式錯誤**：無法解碼
2. **Token 缺少必要欄位**：沒有 id、exp、iat
3. **Token 太舊**：發行時間超過 60天
4. **Token 過期超過寬限期**：過期時間超過 7天
5. **使用者不存在**：資料庫中找不到對應使用者
6. **使用者狀態非 ACTIVE**：使用者帳號被停用

## 新 Token 特性
- **有效期**：30天（從刷新時間開始計算）
- **內容**：包含與原 token 相同的使用者資訊
- **簽章**：使用相同的 NEXTAUTH_SECRET 簽署

## 測試方法

### 使用測試腳本
```bash
# 方法 1: 使用 Node.js 測試腳本
node test-refresh-endpoint.js <your-jwt-token>

# 方法 2: 使用 Shell 測試腳本
./test-refresh.sh <your-jwt-token>
```

### 手動測試
1. 先取得有效的 JWT token（透過 `/api/auth/login`）
2. 使用 curl 或 Postman 測試刷新端點
3. 驗證新 token 是否有效（透過 `/api/auth/me`）

## 實作細節

### 檔案位置
- 端點實作：`apps/web/src/app/api/auth/refresh/route.ts`
- 驗證輔助函數：`apps/web/src/lib/auth-helper.ts`（`validateTokenForRefresh` 函數）
- 測試腳本：`test-refresh-endpoint.js` 和 `test-refresh.sh`

### 依賴項目
- `next-auth/jwt`：用於 token 編碼/解碼
- `@/lib/auth-helper`：統一的驗證輔助函數
- `@/lib/prisma`：資料庫存取

## 與現有系統整合

### Mobile App 使用流程
1. App 啟動時檢查本地儲存的 token
2. 如果 token 過期，嘗試刷新
3. 如果刷新失敗，要求使用者重新登入
4. 使用新 token 進行後續 API 呼叫

### Web App 注意事項
- Web App 使用 Session Cookies，不需要此端點
- 此端點專門為 Mobile App 的 Bearer Token 設計

## 安全考量
1. **寬限期限制**：僅允許過期 7天內的 token 刷新
2. **最大使用期限**：token 發行後超過 60天不可刷新
3. **使用者狀態檢查**：只允許 ACTIVE 狀態的使用者刷新 token
4. **機密保護**：使用 NEXTAUTH_SECRET 簽署 token
5. **錯誤訊息**：避免洩漏過多系統資訊
# CEO團購電商平台 - Mobile App 認證流程測試報告

## 測試時間: Mon Feb  9 21:53:11 CST 2026
## 測試環境: http://localhost:3000

## 目錄
1. [測試方法](#測試方法)
2. [現有認證端點](#現有認證端點)
3. [測試結果](#測試結果)
4. [問題分析](#問題分析)
5. [Mobile App 整合建議](#mobile-app-整合建議)
6. [實作建議](#實作建議)

## 測試方法

使用 curl 測試所有認證相關的 API 端點，檢查:
- 端點是否存在
- 是否支援 Bearer Token 驗證
- 回應格式是否適合 Mobile App
- 是否缺少必要的功能 (如 token refresh)

## 現有認證端點

| 端點 | 方法 | 描述 | 支援 Bearer Token |
|------|------|------|-------------------|
|  | POST | 使用者登入 | ❌ (只返回 session cookie) |
|  | POST | 使用者註冊 | ❌ (不需要認證) |
|  | POST | 使用者登出 | ❌ (需要 session cookie) |
|  | GET | 取得當前使用者 | ❌ (需要 session cookie) |
|  | GET | 取得使用者資料 | ✅ (支援 Bearer Token) |
|  | - | Token 刷新 | ❌ (端點不存在) |
|  | - | 取得 JWT Token | ❌ (端點不存在) |

## 測試結果

### 1. 登入 API ()

**測試結果:**
- ✅ 端點存在且功能正常
- ✅ 接受 JSON 請求: {"taxId": "12345678", "password": "admin123", "rememberMe": false}
- ✅ 返回使用者資料 (排除密碼)
- ❌ **不返回 Bearer Token**，只設置 session cookie
- ❌ Mobile App 無法取得 JWT token 進行後續驗證

**回應範例:**
```json
{
  "message": "登入成功",
  "user": {
    "id": "admin001",
    "name": "系統管理員",
    "taxId": "12345678",
    "email": "admin@example.com",
    "phone": "0912345678",
    "role": "SUPER_ADMIN",
    "status": "ACTIVE",
    "emailVerified": false,
    "createdAt": "2026-02-08T02:46:45.912Z",
    "lastLoginAt": "2026-02-09T13:51:12.800Z",
    "member": null
  }
}
```

### 2. 註冊 API ()

**測試結果:**
- ✅ 端點存在且功能正常
- ✅ 輸入驗證完整 (統一編號、電子郵件、密碼)
- ✅ 建立使用者後自動建立會員資料
- ✅ 返回新建立的使用者資料
- ⚠️ 不需要認證 (符合預期)

### 3. 登出 API ()

**測試結果:**
- ✅ 端點存在且功能正常
- ❌ **需要 session cookie**，不支援 Bearer Token
- ⚠️ Mobile App 無法使用此端點登出

### 4. 當前使用者 API ()

**測試結果:**
- ✅ 端點存在
- ❌ **只支援 session cookie 驗證**
- ❌ 不支援 Bearer Token
- ⚠️ Mobile App 無法使用此端點

### 5. 使用者資料 API ()

**測試結果:**
- ✅ 端點存在且功能完整
- ✅ **支援雙重驗證模式**:
  - Session Cookie (Web 使用)
  - **Bearer Token (Mobile App 使用)**
- ✅ 使用 NextAuth 的  驗證 Bearer Token
- ✅ 返回完整使用者資料 (包含會員資料)

**Bearer Token 測試成功:**
```bash
取得 Session Token: eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2...

使用 Bearer Token 呼叫 /api/user/profile:
{
  "id": "admin001",
  "name": "系統管理員",
  "email": "admin@example.com",
  "role": "SUPER_ADMIN"
}
```

### 6. Token 刷新端點 ()

**測試結果:**
- ❌ **端點不存在**
- ❌ Mobile App 無法刷新過期的 token
- ⚠️ 缺少重要的 Mobile App 功能

### 7. 保護端點 Bearer Token 支援測試

測試其他需要認證的端點是否支援 Bearer Token:

| 端點 | 支援 Bearer Token | 說明 |
|------|-------------------|------|
|  | ✅ | 完整支援 |
|  | ❌ | 只支援 session cookie |
|  | ❌ | 只支援 session cookie |
|  | ❌ | 只支援 session cookie |
|  | ❌ | 只支援 session cookie |

## 問題分析

### 主要問題

1. **不一致的驗證支援**:
   -  支援 Bearer Token
   - 其他保護端點只支援 session cookie
   - Mobile App 無法存取大部分 API

2. **缺少 Mobile App 必要功能**:
   - 登入 API 不返回 JWT token
   - 缺少 token 刷新端點
   - 缺少專門的 token 取得端點

3. **架構問題**:
   - 使用 NextAuth 的加密 session token 作為 Bearer Token
   - 這可能不是標準的 JWT token
   - Token 驗證依賴 NextAuth 的  函數

### 技術細節

1. **NextAuth Session Token**:
   - 格式: 加密的 JWT (JWE)
   - 包含: 使用者 ID、統一編號、角色、狀態等
   - 驗證: 需要  解密
   - 有效期: 30天 (根據 auth.ts 設定)

2. ** 實作**:
   - 使用  函數
   - 呼叫  驗證 Bearer Token
   - 支援 session cookie 後備方案

## Mobile App 整合建議

### 短期方案 (最小修改)

1. **修改登入 API 返回 Session Token**:
   - 在登入回應中加入  欄位
   - Mobile App 儲存此 token
   - 用於呼叫  端點

2. **擴充現有驗證邏輯**:
   - 將  的 Bearer Token 驗證邏輯提取為 middleware
   - 應用於所有需要認證的端點

### 中期方案 (完整支援)

1. **新增 Mobile App 專用端點**:
   -  - 返回 JWT token
   -  - 刷新 token
   -  - 登出 (使 token 失效)

2. **實作標準 JWT Token**:
   - 使用 jsonwebtoken 套件產生標準 JWT
   - 包含標準聲明 (iss, exp, sub, etc.)
   - 設定合理的有效期 (e.g., 7天)

3. **更新所有保護端點**:
   - 支援 Bearer Token 驗證
   - 保持向後相容性 (同時支援 session cookie)

### 長期方案 (架構重構)

1. **統一驗證層**:
   - 建立獨立的 auth middleware
   - 支援多種驗證方式 (session, jwt, api key)
   - 根據客戶端類型自動選擇驗證方式

2. **API Gateway 模式**:
   - 將驗證邏輯集中在 gateway
   - 後端服務專注業務邏輯
   - 更容易支援多種客戶端

## 實作建議

### 立即修復 (高優先級)

1. **修改登入 API 返回 Token**:
```typescript
// 在 /api/auth/login/route.ts 中
// 登入成功後，加入 token 到回應
return NextResponse.json({
  message: '登入成功',
  user: userData,
  token: sessionToken // 從 NextAuth session 取得
});
```

2. **建立 Auth Middleware**:
```typescript
// middleware/auth.ts
export async function validateRequest(req: NextRequest) {
  // 1. 嘗試 Bearer Token
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = await validateBearerToken(token);
    if (user) return user;
  }
  
  // 2. 嘗試 Session Cookie
  const session = await auth();
  if (session?.user) return session.user;
  
  // 3. 未授權
  return null;
}
```

3. **新增 Token Refresh 端點**:
```typescript
// /api/auth/refresh/route.ts
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '需要 Bearer Token' }, { status: 401 });
  }
  
  const oldToken = authHeader.substring(7);
  // 驗證舊 token 並產生新 token
  // 返回新 token
}
```

### 測試建議

1. **建立 Mobile App 測試套件**:
   - 測試完整的認證流程
   - 測試 token 刷新
   - 測試所有保護端點

2. **API 文件更新**:
   - 標註哪些端點支援 Bearer Token
   - 提供 Mobile App 整合範例
   - 說明 token 有效期和刷新機制

## 結論

**當前狀態:**
- ✅ 基礎認證架構存在
- ✅  已支援 Bearer Token
- ❌ 大部分端點不支援 Bearer Token
- ❌ 缺少 Mobile App 必要功能

**建議優先順序:**
1. 修改登入 API 返回 token (高)
2. 建立 auth middleware 擴充 Bearer Token 支援 (高)
3. 新增 token refresh 端點 (中)
4. 更新 API 文件 (低)

**預計工作量:**
- 高優先級修復: 2-3 天
- 完整 Mobile App 支援: 1-2 週
- 架構重構: 2-4 週

---
*報告生成時間: Mon Feb  9 21:53:12 CST 2026*
*測試執行者: OpenCode AI Assistant*

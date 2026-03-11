# CEO團購電商平台 - Mobile App 認證流程測試報告

## 測試時間
2026年2月9日

## 測試環境
- Web App: http://localhost:3000
- 測試使用者: taxId=12345678, password=admin123

## 現有認證端點

### 1. `/api/auth/login` (POST)
- ✅ 功能正常
- ✅ 驗證使用者憑證
- ❌ **不返回 Bearer Token** (只設置 session cookie)
- ❌ Mobile App 無法取得 JWT token

### 2. `/api/auth/register` (POST)
- ✅ 功能正常
- ✅ 完整輸入驗證
- ✅ 自動建立會員資料
- ⚠️ 不需要認證 (符合預期)

### 3. `/api/auth/logout` (POST)
- ✅ 功能正常
- ❌ **需要 session cookie**
- ❌ 不支援 Bearer Token
- ⚠️ Mobile App 無法使用

### 4. `/api/auth/me` (GET)
- ✅ 端點存在
- ❌ **只支援 session cookie**
- ❌ 不支援 Bearer Token
- ⚠️ Mobile App 無法使用

### 5. `/api/user/profile` (GET)
- ✅ 功能完整
- ✅ **支援 Bearer Token 驗證**
- ✅ 支援 session cookie 後備
- ✅ 返回完整使用者資料
- ✅ Mobile App 可以使用

### 6. `/api/auth/refresh` (POST)
- ❌ **端點不存在**
- ❌ Mobile App 無法刷新 token

### 7. `/api/auth/token` (GET/POST)
- ❌ **端點不存在**
- ❌ Mobile App 無法取得 token

## 重要發現

### 1. Session Token 可作為 Bearer Token
- NextAuth 產生的加密 session token 可以作為 Bearer Token
- `/api/user/profile` 端點成功驗證此 token
- 其他端點不支援此 token

### 2. `/api/user/profile` 實作正確
- 使用 `validateBearerToken()` 函數
- 呼叫 `getToken()` 驗證 Bearer Token
- 支援雙重驗證模式 (session + token)

### 3. 不一致的驗證支援
| 端點 | 支援 Bearer Token | Mobile App 可用性 |
|------|-------------------|-------------------|
| `/api/user/profile` | ✅ | ✅ |
| `/api/auth/me` | ❌ | ❌ |
| `/api/admin/dashboard` | ❌ | ❌ |
| `/api/cart` | ❌ | ❌ |
| `/api/orders` | ❌ | ❌ |

## 問題分析

### 主要問題
1. **登入 API 不返回 Bearer Token**
   - Mobile App 無法取得 token 進行後續請求
   - 需要修改登入回應格式

2. **大部分端點不支援 Bearer Token**
   - 只有 `/api/user/profile` 支援
   - Mobile App 無法存取其他保護端點

3. **缺少 Mobile App 必要功能**
   - 無 token 刷新機制
   - 無專門的 token 取得端點
   - 無 Mobile App 專用登出

### 技術細節
- NextAuth 使用加密的 JWT (JWE) 作為 session token
- Token 驗證需要 `NEXTAUTH_SECRET`
- 有效期: 30天 (根據 auth.ts 設定)

## Mobile App 整合建議

### 短期方案 (高優先級)
1. **修改登入 API 返回 Token**
   ```typescript
   // 在登入回應中加入 token
   return NextResponse.json({
     message: '登入成功',
     user: userData,
     token: sessionToken // 從 NextAuth 取得
   });
   ```

2. **建立 Auth Middleware**
   ```typescript
   // 提取 /api/user/profile 的驗證邏輯
   // 應用於所有保護端點
   ```

3. **新增 Token Refresh 端點**
   ```typescript
   // /api/auth/refresh
   // 接受舊 token，返回新 token
   ```

### 中期方案
1. **新增 Mobile App 專用端點**
   - `/api/mobile/auth/login`
   - `/api/mobile/auth/refresh`
   - `/api/mobile/auth/logout`

2. **實作標準 JWT Token**
   - 使用 jsonwebtoken 套件
   - 標準聲明 (iss, exp, sub)
   - 7天有效期

### 長期方案
1. **統一驗證層**
   - 支援多種驗證方式
   - 根據客戶端類型自動選擇

2. **API Gateway 模式**
   - 集中驗證邏輯
   - 後端專注業務邏輯

## 實作優先順序

### 高優先級 (1-2天)
1. 修改登入 API 返回 token
2. 建立 auth middleware
3. 更新主要保護端點支援 Bearer Token

### 中優先級 (3-5天)
1. 新增 token refresh 端點
2. 新增 Mobile App 專用登出
3. 更新 API 文件

### 低優先級 (1-2週)
1. 實作標準 JWT
2. 建立 Mobile App 測試套件
3. 監控和日誌記錄

## 測試程式碼範例

### 取得 Session Token
```bash
# 登入取得 session token
LOGIN_RESPONSE=$(curl -s -i -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"taxId":"12345678","password":"admin123"}')

# 提取 token
SESSION_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -i 'authjs.session-token' | sed 's/.*authjs.session-token=//' | sed 's/;.*//')
```

### 使用 Bearer Token
```bash
# 呼叫 /api/user/profile
curl -s -X GET "http://localhost:3000/api/user/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN"
```

## 結論

**當前狀態:**
- ✅ 基礎認證架構存在
- ✅ `/api/user/profile` 已支援 Bearer Token
- ❌ 大部分端點不支援 Bearer Token
- ❌ 缺少 Mobile App 必要功能

**建議立即行動:**
1. 修改登入 API 返回 token
2. 擴充 Bearer Token 支援到所有保護端點
3. 新增 token refresh 功能

**預計影響:**
- Mobile App 可以立即使用 `/api/user/profile`
- 完整 Mobile App 支援需要 1-2 週開發
- 向後相容性保持不變 (Web 繼續使用 session cookie)
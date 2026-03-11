# CEO團購電商平台 - 購物車流程測試總結

## 測試結果摘要

### 1. 購物車端點現狀

**存在的端點:**
- `GET /api/cart` - 取得購物車內容 ✅
- `POST /api/cart` - 加入商品到購物車 ✅  
- `PATCH /api/cart/[id]` - 更新購物車項目數量 ✅
- `DELETE /api/cart/[id]` - 刪除購物車項目 ✅

**缺少的端點:**
- `DELETE /api/cart` - 清空整個購物車 ❌
- `POST /api/cart/batch` - 批量操作 ❌

### 2. 功能測試結果

| 功能 | 狀態 | 備註 |
|------|------|------|
| 加入商品 | ✅ 正常 | 支援價格階梯計算 |
| 查看購物車 | ✅ 正常 | 返回完整商品資訊 |
| 更新數量 | ✅ 正常 | 驗證商品狀態 |
| 刪除項目 | ✅ 正常 | 權限檢查正常 |
| Session 驗證 | ✅ 正常 | Web 端可用 |
| Bearer Token 驗證 | ❌ 不支援 | **Mobile App 無法使用** |
| 未授權保護 | ✅ 正常 | 返回 401 |

### 3. Bearer Token 支援對比

| 端點 | Session Cookie | Bearer Token | Mobile App 可用性 |
|------|----------------|--------------|-------------------|
| `/api/user/profile` | ✅ | ✅ | ✅ |
| `/api/cart` (所有方法) | ✅ | ❌ | ❌ |
| `/api/auth/login` | ✅ | ❌ | ❌ (無法取得token) |

### 4. 關鍵發現

**主要問題:**
1. **購物車端點不支援 Bearer Token** - Mobile App 完全無法使用購物車功能
2. **登入 API 不返回 Token** - Mobile App 無法取得 token 進行後續請求
3. **缺少 Token 刷新機制** - Mobile App 需要重新登入

**技術差異:**
- `/api/user/profile` 有 `validateBearerToken()` 函數
- `/api/cart` 端點只有 Session 驗證邏輯
- 需要將 Bearer Token 驗證邏輯複製到購物車端點

## 修改建議

### 立即修改 (高優先級)

#### 1. 建立統一的 Auth Helper
```typescript
// lib/auth-helper.ts
export async function validateBearerToken(request: NextRequest) {
  // 從 /api/user/profile/route.ts 複製 validateBearerToken 函數
}

export async function getAuthenticatedUser(request: NextRequest) {
  // 嘗試 Bearer Token 驗證
  const bearerData = await validateBearerToken(request);
  if (bearerData) return { userId: bearerData.userId, user: bearerData.user };
  
  // 嘗試 Session 驗證
  const session = await auth();
  if (session?.user) return { userId: session.user.id, user: null };
  
  return null;
}
```

#### 2. 修改購物車端點
```typescript
// /api/cart/route.ts
import { getAuthenticatedUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }
    
    const userId = authResult.userId;
    // 使用 userId 進行後續操作...
  }
}
```

#### 3. 修改登入 API 返回 Token
```typescript
// /api/auth/login 中返回 token
return NextResponse.json({
  message: '登入成功',
  user: userData,
  token: sessionToken // 從 NextAuth 取得
});
```

### 後續優化 (中優先級)

#### 4. 新增清空購物車功能
```typescript
// /api/cart (DELETE) - 清空購物車
```

#### 5. 新增 Token Refresh 端點
```typescript
// /api/auth/refresh - 刷新 token
```

## 影響評估

### Mobile App 整合時間表
1. **第1階段 (1-2天)**: 修改購物車端點支援 Bearer Token
2. **第2階段 (1天)**: 修改登入 API 返回 token
3. **第3階段 (1天)**: 測試與驗證
4. **總計**: 3-4 天可完成 Mobile App 購物車整合

### 風險與注意事項
1. **向後相容性**: Web 端繼續使用 Session Cookie，不受影響
2. **測試重點**: 需要測試 Session 和 Bearer Token 雙重驗證
3. **安全考量**: Bearer Token 有效期、刷新機制
4. **錯誤處理**: 統一的錯誤回應格式

## 結論

**當前狀態**: 購物車功能完整，但 Mobile App 無法使用

**緊急程度**: 高 (阻擋 Mobile App 上線)

**建議行動**: 立即修改購物車端點加入 Bearer Token 支援

**預期結果**: Mobile App 可在 3-4 天內使用完整購物車功能
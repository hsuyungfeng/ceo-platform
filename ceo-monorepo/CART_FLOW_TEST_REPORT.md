# CEO團購電商平台 - 購物車流程測試報告

## 測試時間
2026年2月9日

## 測試環境
- Web App: http://localhost:3000
- 測試使用者: taxId=12345678, password=admin123
- 測試商品: prod003 (感冒熱飲)

## 購物車端點分析

### 1. 主要購物車端點

#### `/api/cart` (GET)
- **功能**: 取得使用者購物車內容
- **HTTP方法**: GET
- **驗證方式**: Session Cookie ✅
- **Bearer Token**: ❌ 不支援
- **回應格式**:
  ```json
  {
    "items": [
      {
        "id": "cart-item-id",
        "productId": "prod003",
        "quantity": 2,
        "unitPrice": "120",
        "subtotal": 240,
        "savings": 0,
        "product": {
          "id": "prod003",
          "name": "感冒熱飲",
          "subtitle": "方便沖泡，快速見效",
          "image": null,
          "unit": "盒",
          "spec": "10包/盒",
          "priceTiers": [
            {"minQty": 1, "price": "120"},
            {"minQty": 10, "price": "110"},
            {"minQty": 30, "price": "100"},
            {"minQty": 100, "price": "90"}
          ],
          "firm": "台灣製藥股份有限公司"
        },
        "createdAt": "2026-02-09T14:03:04.202Z",
        "updatedAt": "2026-02-09T14:03:04.202Z"
      }
    ],
    "summary": {
      "totalItems": 2,
      "totalAmount": 240,
      "totalSavings": 0,
      "finalAmount": 240
    }
  }
  ```

#### `/api/cart` (POST)
- **功能**: 加入商品到購物車
- **HTTP方法**: POST
- **驗證方式**: Session Cookie ✅
- **Bearer Token**: ❌ 不支援
- **請求格式**:
  ```json
  {
    "productId": "prod003",
    "quantity": 2
  }
  ```
- **回應格式** (成功: 201):
  ```json
  {
    "message": "已加入購物車",
    "cartItem": {
      "id": "cmlf8s70r0002dj9ep5se8yw7",
      "productId": "prod003",
      "quantity": 2,
      "unitPrice": "120",
      "subtotal": 240,
      "product": {
        "id": "prod003",
        "name": "感冒熱飲",
        "image": null,
        "unit": "盒"
      }
    }
  }
  ```

#### `/api/cart/[id]` (PATCH)
- **功能**: 更新購物車項目數量
- **HTTP方法**: PATCH
- **驗證方式**: Session Cookie ✅
- **Bearer Token**: ❌ 不支援
- **請求格式**:
  ```json
  {
    "quantity": 5
  }
  ```
- **回應格式** (成功: 200):
  ```json
  {
    "message": "購物車已更新",
    "cartItem": {
      "id": "cart-item-id",
      "productId": "prod003",
      "quantity": 5,
      "unitPrice": "120",
      "subtotal": 600,
      "product": {
        "id": "prod003",
        "name": "感冒熱飲",
        "image": null,
        "unit": "盒"
      }
    }
  }
  ```

#### `/api/cart/[id]` (DELETE)
- **功能**: 刪除購物車項目
- **HTTP方法**: DELETE
- **驗證方式**: Session Cookie ✅
- **Bearer Token**: ❌ 不支援
- **回應格式** (成功: 200):
  ```json
  {
    "message": "已從購物車移除"
  }
  ```

### 2. 缺少的購物車功能

#### 清空購物車端點
- ❌ `/api/cart` (DELETE) - 清空整個購物車
- 目前只能逐項刪除

#### 批量操作端點
- ❌ `/api/cart/batch` - 批量加入/更新/刪除
- ❌ `/api/cart/clear` - 清空購物車

## 功能測試結果

### ✅ 正常運作的功能
1. **基本購物車操作**
   - 加入商品到購物車
   - 取得購物車內容
   - 更新商品數量
   - 刪除單一商品

2. **驗證與權限**
   - Session Cookie 驗證正常
   - 未授權訪問返回 401
   - 使用者只能存取自己的購物車

3. **業務邏輯**
   - 商品存在檢查
   - 團購時間驗證
   - 價格階梯計算
   - 庫存/狀態檢查

### ❌ 問題與限制

#### 1. Mobile App 整合問題
**主要問題**: 購物車端點不支援 Bearer Token
- `/api/cart` 所有端點: ❌ 不支援 Bearer Token
- `/api/user/profile` 端點: ✅ 支援 Bearer Token (對比參考)

**影響**:
- Mobile App 完全無法使用購物車功能
- 無法加入商品、查看購物車、結帳

#### 2. 功能完整性問題
- 缺少清空購物車功能
- 缺少批量操作功能
- 缺少購物車合併功能 (登入後合併訪客購物車)

#### 3. 錯誤處理問題
- 部分錯誤訊息為中文，建議統一為英文或提供多語言支援
- 缺少詳細的錯誤碼

## 技術分析

### 驗證機制對比

| 端點 | Session Cookie | Bearer Token | Mobile App 可用性 |
|------|----------------|--------------|-------------------|
| `/api/user/profile` | ✅ | ✅ | ✅ |
| `/api/cart` (所有方法) | ✅ | ❌ | ❌ |
| `/api/auth/login` | ✅ | ❌ | ❌ (無法取得token) |
| `/api/auth/logout` | ✅ | ❌ | ❌ |

### 程式碼分析

#### 購物車端點驗證邏輯
```typescript
// /api/cart/route.ts 中的驗證邏輯
const session = await auth();
if (!session?.user) {
  return NextResponse.json(
    { error: '未授權，請先登入' },
    { status: 401 }
  );
}
```

#### 使用者資料端點驗證邏輯
```typescript
// /api/user/profile 中的驗證邏輯 (推測)
// 支援雙重驗證: Session Cookie + Bearer Token
async function validateBearerToken() {
  // 從 Authorization header 取得 token
  // 使用 getToken() 驗證
  // 返回使用者資料
}
```

## Mobile App 整合問題詳述

### 1. 登入流程問題
- **問題**: `/api/auth/login` 不返回 Bearer Token
- **影響**: Mobile App 無法取得 token 進行後續請求
- **解決方案**: 修改登入 API 返回 token

### 2. 購物車功能問題
- **問題**: 所有購物車端點不支援 Bearer Token
- **影響**: Mobile App 無法使用購物車
- **解決方案**: 為購物車端點加入 Bearer Token 支援

### 3. Token 管理問題
- **問題**: 缺少 token refresh 機制
- **影響**: Mobile App 需要重新登入
- **解決方案**: 新增 `/api/auth/refresh` 端點

## 修改建議

### 高優先級 (Mobile App 基本功能)

#### 1. 修改購物車端點支援 Bearer Token
```typescript
// 在 /api/cart/route.ts 和 /api/cart/[id]/route.ts 中加入
import { validateBearerToken } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    // 嘗試從 Bearer Token 驗證
    const userFromToken = await validateBearerToken(request);
    
    // 如果 Bearer Token 無效，嘗試 Session
    const session = userFromToken ? null : await auth();
    
    const userId = userFromToken?.id || session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }
    
    // 使用 userId 進行後續操作
    // ...
  }
}
```

#### 2. 修改登入 API 返回 Token
```typescript
// 在 /api/auth/login 中
return NextResponse.json({
  message: '登入成功',
  user: userData,
  token: sessionToken // 從 NextAuth 取得
});
```

### 中優先級 (功能完整性)

#### 3. 新增清空購物車端點
```typescript
// /api/cart/clear (DELETE)
export async function DELETE(request: NextRequest) {
  // 驗證使用者
  // 刪除該使用者的所有購物車項目
  return NextResponse.json({ message: '購物車已清空' });
}
```

#### 4. 新增批量操作端點
```typescript
// /api/cart/batch (POST/PATCH/DELETE)
export async function POST(request: NextRequest) {
  // 批量加入商品
}

export async function PATCH(request: NextRequest) {
  // 批量更新數量
}

export async function DELETE(request: NextRequest) {
  // 批量刪除項目
}
```

### 低優先級 (優化)

#### 5. 新增購物車合併功能
- 訪客加入購物車 → 登入後合併到使用者購物車

#### 6. 改善錯誤處理
- 標準化錯誤碼
- 多語言錯誤訊息
- 詳細錯誤日誌

## 實作步驟建議

### 第一階段 (1-2天): Mobile App 基本功能
1. 建立統一的 auth helper function
2. 修改購物車端點支援 Bearer Token
3. 修改登入 API 返回 token
4. 測試 Mobile App 購物車流程

### 第二階段 (2-3天): 功能完整性
1. 新增清空購物車功能
2. 新增 token refresh 端點
3. 更新 API 文件
4. 建立 Mobile App 測試套件

### 第三階段 (3-5天): 優化與監控
1. 新增批量操作功能
2. 實作購物車合併
3. 加入監控和日誌記錄
4. 性能優化

## 測試驗證項目

### 需要驗證的功能
1. ✅ Session Cookie 購物車流程
2. ❌ Bearer Token 購物車流程
3. ✅ 商品驗證與價格計算
4. ✅ 權限控制
5. ❌ 批量操作
6. ❌ 清空購物車

### Mobile App 整合測試清單
1. [ ] 登入取得 Bearer Token
2. [ ] 使用 Bearer Token 取得購物車
3. [ ] 使用 Bearer Token 加入商品
4. [ ] 使用 Bearer Token 更新數量
5. [ ] 使用 Bearer Token 刪除商品
6. [ ] Token 刷新機制
7. [ ] 錯誤處理與重試

## 結論

**當前狀態評估:**
- ✅ 購物車基礎功能完整
- ✅ Session-based 驗證正常
- ❌ Mobile App 整合不可用
- ❌ 缺少關鍵 Mobile App 功能

**緊急程度:**
- **高**: Bearer Token 支援 (阻擋 Mobile App 上線)
- **中**: 功能完整性 (影響使用者體驗)
- **低**: 優化項目 (改善性需求)

**建議立即行動:**
1. 修改購物車端點支援 Bearer Token
2. 修改登入 API 返回 token
3. 建立統一的 auth helper

**預計影響:**
- Mobile App 可以立即使用購物車功能
- 向後相容性保持不變 (Web 繼續使用 session)
- 需要更新 Mobile App 端點呼叫方式

**風險評估:**
- 低風險: 修改驗證邏輯，不影響業務邏輯
- 中風險: 需要充分測試 Session/Bearer 雙重驗證
- 高風險: Mobile App 依賴性強，需要同步發布
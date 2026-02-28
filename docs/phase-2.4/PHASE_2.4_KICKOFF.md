# Phase 2.4 啟動文件 (Kickoff)

**日期**: 2026-02-28
**狀態**: 🟢 準備啟動
**負責人**: CEO Platform Transformation Team

---

## 執行摘要

Phase 2.3 (PostgreSQL 認證層) 已 ✅ 完全完成。現在開始 Phase 2.4 (API 路由遷移)。

### 成就回顧 (Phase 2.3)

✅ 決策: PostgreSQL + Prisma v7 (棄用 PocketBase)
✅ 實施: 10 個認證函數在 `/src/lib/prisma-auth.ts`
✅ 測試: 3/3 PostgreSQL 直連測試通過
✅ 集成: NextAuth 已集成，支持 Credentials + OAuth + Bearer Token
✅ 文檔: 完整的測試和故障排除指南

### Phase 2.4 目標

遷移 41 個 Next.js API 路由，使用波浪式方法：

```
Wave 1 (Week 1)     : 認證層驗證 → 5 個核心路由
Wave 2 (Week 1-2)   : 公開路由 → 8 個簡單查詢
Wave 3 (Week 2)     : 認證路由 → 7 個用戶操作
Wave 4 (Week 2-3)   : 用戶路由 → 7 個購物車/訂單
Wave 5 (Week 3)     : 管理路由 → 22 個複雜操作
```

---

## 即刻可執行的清單

### 今天 (Day 1)

```bash
# 1. 切換到新分支 (可選)
git checkout -b feature/phase-2.4-route-migration

# 2. 閱讀關鍵文檔
- Gem3Plan.md (Phase 2.4 部分)
- PHASE_2.4_ROUTE_MIGRATION.md (完整指南)

# 3. 理解當前狀態
- ✅ /src/lib/prisma-auth.ts (認證函數)
- ✅ /src/auth.ts (NextAuth 配置)
- ✅ /src/lib/auth-helper.ts (Bearer Token 驗證)

# 4. 驗證 PostgreSQL 連接
npx tsx scripts/test-postgres-raw.ts
```

### 明天 (Day 2-3) - Wave 1 開始

```bash
# 1. 建立測試用戶
npx tsx scripts/setup-test-users.ts

# 2. 建立基礎設施
npm install --save-dev @testing-library/react jest

# 3. 遷移第一個認證路由
# 例: GET /api/auth/me
# 參考: PHASE_2.4_ROUTE_MIGRATION.md 中的「帶認證的查詢」範本

# 4. 測試驗證
npm run test:auth
```

### Week 2 onwards - Waves 2-5

```bash
# 循環流程:
# 1. 選擇一個路由
# 2. 查看 PHASE_2.4_ROUTE_MIGRATION.md 中的對應範本
# 3. 遷移路由 (使用 Prisma 替換舊代碼)
# 4. 測試並驗證
# 5. 更新進度文件
# 6. 提交 git commit
```

---

## 文檔導覽

### 📍 核心文檔

| 文檔 | 目的 | 用時 |
|------|------|------|
| **Gem3Plan.md** | 完整的 6 相位計劃，Phase 2.4 詳細分解 | 5 分鐘 |
| **DailyProgress.md** | 日誌，記錄每日進度 | 維護中 |
| **PHASE_2.4_ROUTE_MIGRATION.md** | 詳細的遷移指南、模式、範本 | 20 分鐘 |
| **POSTGRES_AUTH_TESTING.md** | PostgreSQL 測試和故障排除 | 參考用 |

### 🛠️ 實現文件

| 檔案 | 用途 | 狀態 |
|------|------|------|
| `/src/lib/prisma-auth.ts` | 核心認證函數 | ✅ 完成 |
| `/src/auth.ts` | NextAuth 提供者 | ✅ 完成 |
| `/src/lib/auth-helper.ts` | Bearer Token + Session 驗證 | ✅ 完成 |
| `/prisma/schema.prisma` | Prisma schema (41 個模型) | ✅ 完成 |
| `/scripts/test-postgres-raw.ts` | PostgreSQL 直連測試 | ✅ 完成 |
| `/scripts/init-db.ts` | 資料庫初始化 | ✅ 完成 |

### 📋 範本和指南

| 範本 | 用於 | 程式碼量 |
|------|------|---------|
| 簡單查詢 | 公開路由 (GET /api/products) | ~20 行 |
| 帶認證查詢 | 認證路由 (GET /api/user/profile) | ~25 行 |
| 創建操作 | POST 請求 (POST /api/orders) | ~60 行 |
| 管理操作 | 管理員功能 (POST /api/admin/users/[id]/points) | ~70 行 |

---

## 關鍵決策和假設

### ✅ 已驗證

- **PostgreSQL 連接**: ✅ 直接測試通過
- **Prisma ORM**: ✅ Schema 完整，41 個模型定義
- **NextAuth 集成**: ✅ Credentials + OAuth + Bearer Token 支持
- **認證函數**: ✅ 10 個核心函數已實現和測試
- **密碼雜湊**: ✅ bcryptjs 正常工作

### ⚠️ 待驗證

- **完整 OAuth 流程**: 等待 Wave 3 測試
- **Bearer Token 性能**: 等待 Wave 1 完成
- **事務完整性**: 等待 Wave 5 (複雜管理操作)
- **批量數據遷移**: 待評估

---

## 常見陷阱和解決方案

### 陷阱 1: 忘記 validate 認證

❌ **錯誤**:
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  // 直接操作，未驗證用戶！
  const order = await prisma.order.create({
    data: { userId: body.userId, ... }
  });
}
```

✅ **正確**:
```typescript
export async function POST(request: Request) {
  const { user, error } = await validateSession(request);
  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // 使用 user.id，不用 request 中的值
  const order = await prisma.order.create({
    data: { userId: user.id, ... }
  });
}
```

### 陷阱 2: 遺漏多表事務

❌ **錯誤** (數據可能不一致):
```typescript
await prisma.order.create({ data: {...} });
await prisma.cartItem.deleteMany({ where: {...} }); // 如果第二行失敗呢？
```

✅ **正確** (原子操作):
```typescript
await prisma.$transaction(async (tx) => {
  await tx.order.create({ data: {...} });
  await tx.cartItem.deleteMany({ where: {...} });
});
```

### 陷阱 3: 角色檢查不足

❌ **錯誤** (任何認證用戶可訪問):
```typescript
const { user, error } = await validateSession(request);
if (error || !user) return Response.json({}, { status: 401 });
// 缺少角色檢查！
```

✅ **正確** (只有管理員):
```typescript
const { user, error } = await validateSession(request);
if (error || !user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## 進度追蹤

### Wave 1: 認證層驗證 (Week 1)

```
路由: POST /api/auth/login
├─ 步驟 1: 理解現有實現 [ ]
├─ 步驟 2: 驗證 Credentials 認證 [ ]
├─ 步驟 3: 測試 Bearer Token 返回 [ ]
└─ 狀態: [ ] 完成

路由: GET /api/auth/me
├─ 步驟 1: 移除舊代碼 [ ]
├─ 步驟 2: 使用 Prisma 實現 [ ]
├─ 步驟 3: 測試 Session + Bearer Token [ ]
└─ 狀態: [ ] 完成

路由: POST /api/auth/register
├─ 步驟 1: 驗證郵件 [ ]
├─ 步驟 2: 密碼雜湊 [ ]
├─ 步驟 3: 建立 User 記錄 [ ]
└─ 狀態: [ ] 完成

... (其他 2 個認證路由)
```

### 更新進度

遷移每個路由後：

```bash
# 1. 在 DailyProgress.md 中添加
# 2026-02-28 (日期)
# - ✅ [已完成] POST /api/orders (8 行代碼改動，新增 Prisma 事務)

# 2. 在 Gem3Plan.md 中勾選
# 在 Phase 2.4 中找到相應路由，將 [ ] 改為 [x]

# 3. 提交 git
git add .
git commit -m "Phase 2.4: 遷移 POST /api/orders 至 Prisma"
```

---

## 可選: 建立自動化測試

如果想加速驗證，可建立自動測試套件：

```bash
# 建立測試檔案
mkdir -p tests/api
touch tests/api/routes.test.ts

# 編寫測試 (參考 PHASE_2.4_ROUTE_MIGRATION.md)
# 使用 jest + @testing-library/react

# 執行測試
npm run test:routes
```

---

## 風險評估

| 風險 | 影響 | 緩解 |
|------|------|------|
| 認證驗證失敗 | 🔴 高 | Wave 1 仔細測試 |
| 事務不一致 | 🔴 高 | 使用 Prisma $transaction |
| 性能下降 | 🟡 中 | 完成後進行性能測試 |
| 數據損失 | 🔴 高 | 每次提交前備份 |
| OAuth 流程中斷 | 🟡 中 | Wave 3 後詳細測試 |

---

## 成功指標 (Phase 2.4 完成)

- ✅ 41/41 路由已遷移至 Prisma
- ✅ 所有公開路由正常工作
- ✅ 所有認證路由驗證正確
- ✅ 所有管理路由權限正確
- ✅ 沒有 SQL 注入漏洞
- ✅ 平均響應時間 < 200ms
- ✅ 完整的錯誤處理
- ✅ 所有測試通過

---

## 後續步驟 (Phase 3-4)

Phase 2.4 完成後，進入：

### Phase 3: UX 簡化 (並行)
- 移除搜尋功能
- 簡化定價模型
- 簡化管理儀表板

### Phase 4: 功能完善
- 月結帳單系統
- 點數兌換流程
- 員工管理
- 發票合規

---

## 聯絡和支持

- 📖 **完整指南**: PHASE_2.4_ROUTE_MIGRATION.md
- 🐛 **故障排除**: POSTGRES_AUTH_TESTING.md
- 📊 **進度追蹤**: Gem3Plan.md + DailyProgress.md
- 📝 **錯誤處理**: 參考 Prisma 官方文檔和常見陷阱部分

---

**準備好了嗎？讓我們開始吧！** 🚀

執行第一步：
```bash
# 驗證環境
npx tsx scripts/test-postgres-raw.ts

# 建立測試用戶
npx tsx scripts/setup-test-users.ts

# 開始遷移第一個路由
# (參考 PHASE_2.4_ROUTE_MIGRATION.md)
```

---

**最後更新**: 2026-02-28
**狀態**: 🟢 準備啟動
**預計完成**: 2026-03-20 (3 週)

# 快速開始 (Quick Start) - Phase 2.4

**時間**: 5 分鐘快速上手
**目標**: 理解 Phase 2.4 並開始第一個路由遷移

---

## 🎯 三句話懂項目

1. **現狀**: Phase 2.3 ✅ PostgreSQL 認證層已完成
2. **任務**: Phase 2.4 🔵 遷移 41 個 API 路由至 Prisma
3. **方法**: 波浪式遷移 (5 週，低風險優先)

---

## 📚 文檔速覽

| 需要了解 | 閱讀文檔 | 時間 |
|---------|---------|------|
| 項目全景圖 | **PROJECT_STATUS.md** | 5 分鐘 |
| Phase 2.4 詳情 | **PHASE_2.4_KICKOFF.md** | 10 分鐘 |
| 遷移技術細節 | **PHASE_2.4_ROUTE_MIGRATION.md** | 20 分鐘 |
| PostgreSQL 驗證 | **POSTGRES_AUTH_TESTING.md** | 參考用 |
| 完整計劃 | **Gem3Plan.md** | 30 分鐘 |
| 日誌記錄 | **DailyProgress.md** | 維護中 |

---

## 🚀 立即行動 (10 分鐘)

### Step 1: 驗證環境 (2 分鐘)

```bash
# 進入項目目錄
cd /Users/hsuyungfeng/Applesoft/Onecompany/ceo-platform/ceo-monorepo/apps/web

# 驗證 PostgreSQL 連接
npx tsx scripts/test-postgres-raw.ts

# 預期輸出:
# ✅ PostgreSQL connection successful
# ✅ Users table exists
# ✅ User created with password hashing
# 📊 ✅ Passed: 3, ❌ Failed: 0
# 🎉 All tests passed!
```

### Step 2: 理解認證層 (3 分鐘)

```bash
# 查看認證函數
cat src/lib/prisma-auth.ts

# 關鍵函數:
# - findUserByTaxId() → Credentials 登入
# - findUserByEmail() → OAuth 登入
# - createUser() → 新用戶
# - verifyPassword() → 密碼檢驗
```

### Step 3: 查看第一個路由 (3 分鐘)

```bash
# 查看已完成的認證配置
cat src/auth.ts

# 查看 Bearer Token 驗證
cat src/lib/auth-helper.ts

# 這些是 Phase 2.3 已完成的內容
```

### Step 4: 準備開始 (2 分鐘)

```bash
# 建立測試用戶 (即將執行)
# npx tsx scripts/setup-test-users.ts

# 查看遷移範本
# 參考: PHASE_2.4_ROUTE_MIGRATION.md
```

---

## 💡 遷移路由的三個步驟

### 範本 1️⃣ : 簡單查詢 (公開路由)

**例**: `GET /api/products`

```typescript
// 舊代碼 (使用 pocketbase 或其他)
// const records = await pb.collection('products').getFullList();

// 新代碼 (使用 Prisma)
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { priceTiers: true, category: true },
    });
    return Response.json(products);
  } catch (error) {
    return Response.json({ error: '資料庫錯誤' }, { status: 500 });
  }
}
```

### 範本 2️⃣ : 帶認證的查詢 (認證路由)

**例**: `GET /api/user/profile`

```typescript
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth-helper';

export async function GET(request: Request) {
  try {
    // ⭐ 驗證用戶
    const { user, error } = await validateSession(request);
    if (error || !user) {
      return Response.json({ error: '未授權' }, { status: 401 });
    }

    // ⭐ 查詢用戶數據
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
    });

    return Response.json(profile);
  } catch (error) {
    return Response.json({ error: '資料庫錯誤' }, { status: 500 });
  }
}
```

### 範本 3️⃣ : 管理操作 (需權限檢查)

**例**: `POST /api/admin/users/[id]/points`

```typescript
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth-helper';

export async function POST(request: Request, { params }: any) {
  try {
    // ⭐ 驗證管理員
    const { user, error } = await validateSession(request);
    if (error || !user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return Response.json({ error: '禁止訪問' }, { status: 403 });
    }

    const { amount, reason } = await request.json();

    // ⭐ 使用事務確保數據一致
    const result = await prisma.$transaction(async (tx) => {
      // 1. 更新用戶點數
      const updated = await tx.user.update({
        where: { id: params.id },
        data: { points: { increment: amount } },
      });

      // 2. 記錄交易
      await tx.pointTransaction.create({
        data: {
          userId: params.id,
          amount,
          balance: updated.points,
          type: 'MANUAL_ADJUST',
          reason,
        },
      });

      return updated;
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: '操作失敗' }, { status: 500 });
  }
}
```

---

## 🎓 常見問題

### Q: 如何遷移一個路由？

**A**: 3 步驟
1. 複製上面的範本（1️⃣ 2️⃣ 或 3️⃣ 對應的）
2. 替換查詢邏輯（用 Prisma 語法）
3. 測試驗證

詳見 PHASE_2.4_ROUTE_MIGRATION.md

### Q: 如何測試新遷移的路由？

**A**:
```bash
# 啟動開發服務器
npm run dev

# 使用 curl 或 Postman 測試
curl http://localhost:3000/api/products

# 或使用自動化測試 (待建立)
npm run test:routes
```

### Q: 如何跟進進度？

**A**: 更新這兩個文件
```bash
# 1. 在 Gem3Plan.md 中勾選完成的路由
# 找到 Phase 2.4，將 [ ] 改為 [x]

# 2. 在 DailyProgress.md 中添加日誌
# 2026-02-28
# - ✅ [已完成] GET /api/products (15 行改動)

# 3. 提交 git
git add .
git commit -m "Phase 2.4: 遷移 GET /api/products"
```

### Q: 認證驗證怎麼做？

**A**: 三種方式

```typescript
// 1️⃣ 公開路由 (無驗證)
export async function GET(request: Request) {
  // 直接操作，無需檢查
}

// 2️⃣ 認證路由 (需登入)
const { user, error } = await validateSession(request);
if (error || !user) return Response.json({}, { status: 401 });

// 3️⃣ 管理路由 (需管理員角色)
if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
  return Response.json({}, { status: 403 });
}
```

### Q: 複雜操作如何使用事務？

**A**:
```typescript
const result = await prisma.$transaction(async (tx) => {
  // 所有操作必須使用 tx，不能使用 prisma
  const step1 = await tx.table1.create({...});
  const step2 = await tx.table2.update({...});
  // 如果任何操作失敗，整個事務回滾
  return { step1, step2 };
});
```

詳見 PHASE_2.4_ROUTE_MIGRATION.md 的「事務處理」部分

---

## 📋 關鍵文件位置

```
/src/lib/prisma-auth.ts          ← 認證函數 (✅ 已完成)
/src/auth.ts                     ← NextAuth 配置 (✅ 已完成)
/src/lib/auth-helper.ts          ← 驗證輔助 (✅ 已完成)
/prisma/schema.prisma            ← Prisma Schema (✅ 已完成)

/src/app/api/                    ← 41 個待遷移的路由
├── /products/                   ← 8 個公開路由 (Wave 2)
├── /auth/                       ← 11 個認證路由 (Wave 1,3)
└── /admin/                      ← 22 個管理路由 (Wave 5)
```

---

## 🗓️ 時間表一覽

| 週期 | 任務 | 路由數 | 狀態 |
|------|------|--------|------|
| Week 1 | Wave 1: 認證層驗證 | 5 | 🟢 準備 |
| Week 1-2 | Wave 2: 公開路由 | 8 | 🟢 準備 |
| Week 2 | Wave 3: 認證路由 | 7 | ⏳ 待開始 |
| Week 2-3 | Wave 4: 用戶路由 | 7 | ⏳ 待開始 |
| Week 3 | Wave 5: 管理路由 | 22 | ⏳ 待開始 |

---

## ✅ 檢查清單 (開始前)

在開始遷移前，確認：

- [ ] PostgreSQL 已連接 (`test-postgres-raw.ts` 通過)
- [ ] Prisma 已初始化 (`npx prisma generate` 成功)
- [ ] 理解三個路由範本 (簡單/認證/管理)
- [ ] 閱讀常見陷阱部分
- [ ] 準備好編輯器 (VS Code, vim, etc.)

---

## 🆘 遇到問題？

### 問題 1: PostgreSQL 連接失敗
```bash
# 檢查 PostgreSQL 正在運行
brew services start postgresql@16

# 檢查 .env.local 中的 DATABASE_URL
cat .env.local | grep DATABASE_URL

# 詳見: POSTGRES_AUTH_TESTING.md
```

### 問題 2: Prisma 生成失敗
```bash
# 清除 Prisma 緩存
rm -rf node_modules/.prisma

# 重新生成
npx prisma generate

# 詳見: PHASE_2.4_ROUTE_MIGRATION.md 常見陷阱
```

### 問題 3: 認證驗證失敗
```bash
# 檢查 validateSession() 是否正確實現
cat src/lib/auth-helper.ts

# 檢查測試用戶是否存在
# npx tsx scripts/setup-test-users.ts

# 詳見: PHASE_2.4_ROUTE_MIGRATION.md 陷阱 1
```

---

## 📖 深入學習

| 主題 | 文檔 | 頁數 |
|------|------|------|
| Phase 2.4 詳細計劃 | PHASE_2.4_KICKOFF.md | 10 |
| 遷移實施指南 | PHASE_2.4_ROUTE_MIGRATION.md | 20+ |
| 認證層測試 | POSTGRES_AUTH_TESTING.md | 15 |
| 項目狀態總結 | PROJECT_STATUS.md | 15 |
| 完整 6 階段計劃 | Gem3Plan.md | 40+ |

---

## 🚀 現在就開始！

### 第一個 5 分鐘

```bash
cd /Users/hsuyungfeng/Applesoft/Onecompany/ceo-platform/ceo-monorepo/apps/web

# 驗證環境
npx tsx scripts/test-postgres-raw.ts

# 應該看到:
# ✅ PostgreSQL connection successful
# ✅ Users table exists
# ✅ User created with password hashing
# 🎉 All tests passed!
```

### 第二個 10 分鐘

閱讀 PHASE_2.4_ROUTE_MIGRATION.md：
- 範本 1️⃣ : 簡單查詢
- 範本 2️⃣ : 帶認證的查詢
- 範本 3️⃣ : 管理操作

### 第三個 15 分鐘

挑選一個簡單的路由 (例如 `GET /api/products`)，使用範本 1️⃣ 遷移：
1. 複製範本
2. 替換查詢邏輯
3. 測試驗證
4. 提交 git

---

**🎉 恭喜！你已經準備好開始 Phase 2.4 了！**

下一步: 閱讀 **PHASE_2.4_KICKOFF.md** 了解詳細的開始步驟。

或直接開始遷移第一個路由 (參考 **PHASE_2.4_ROUTE_MIGRATION.md** 的範本)。

---

**最後更新**: 2026-02-28
**下一次審查**: 2026-03-06
**狀態**: 🟢 準備啟動

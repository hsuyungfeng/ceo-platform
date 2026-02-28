# Phase 2.4: API 路由遷移指南

**日期**: 2026-02-28
**狀態**: 準備啟動 ⏳
**範圍**: 41 個 Next.js API 路由
**方法**: 波浪式遷移（低風險優先）

---

## 目錄

1. [概覽](#概覽)
2. [路由遷移框架](#路由遷移框架)
3. [測試基礎設施](#測試基礎設施)
4. [路由類型範本](#路由類型範本)
5. [常見模式](#常見模式)
6. [檢查清單](#檢查清單)

---

## 概覽

### 現狀 (Phase 2.3 完成 ✅)

✅ PostgreSQL 已連接
✅ Prisma schema 已定義 (41 個模型)
✅ 認證函數已實現 (`/src/lib/prisma-auth.ts`)
✅ NextAuth 已集成
✅ Database 測試通過 (3/3)

### 目標 (Phase 2.4)

- 遷移 41 個 API 路由，從舊系統轉向 PostgreSQL + Prisma
- 驗證每個路由的認證和數據完整性
- 建立可重複使用的遷移模式
- 記錄複雜特殊案例

### 路由分佈

```
總計: 41 個路由
├─ 公開路由 (8) 🟢  - 無認證
├─ 認證路由 (11) 🔵  - 需登入
├─ 管理路由 (22) 🟠  - 需 ADMIN/SUPER_ADMIN
```

### 遷移波次

| 波次 | 名稱 | 路由數 | 風險 | 週期 |
|------|------|--------|------|------|
| 1 | 認證層驗證 | 5 | 中 | Week 1 |
| 2 | 公開路由 | 8 | 低 | Week 1-2 |
| 3 | 認證路由 | 7 | 中 | Week 2 |
| 4 | 用戶路由 | 7 | 中 | Week 2-3 |
| 5 | 管理路由 | 22 | 高 | Week 3 |

---

## 路由遷移框架

### 標準遷移流程

```typescript
// 步驟 1: 檢查現有實現
// 步驟 2: 保留簽名（參數、返回值）
// 步驟 3: 替換實現邏輯為 Prisma
// 步驟 4: 更新錯誤處理
// 步驟 5: 測試驗證
// 步驟 6: 移除舊代碼
```

### 認證驗證模式

**公開路由**：不需要認證檢查
```typescript
export async function GET(request: Request) {
  try {
    // 直接查詢數據，無認證
    const data = await prisma.product.findMany({
      where: { isActive: true }
    });
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
```

**認證路由**：驗證用戶已登入
```typescript
export async function GET(request: Request) {
  try {
    // 驗證會話或 Bearer token
    const { user, error } = await validateSession(request);
    if (error || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 查詢用戶數據
    const data = await prisma.order.findMany({
      where: { userId: user.id }
    });
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
```

**管理路由**：驗證管理員權限
```typescript
export async function GET(request: Request) {
  try {
    const { user, error } = await validateSession(request);
    if (error || !user || user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 只有管理員能執行
    const data = await prisma.user.findMany();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
```

---

## 測試基礎設施

### 步驟 1: 建立測試用戶

```typescript
// scripts/setup-test-users.ts
import { createUser, findUserByTaxId } from '@/lib/prisma-auth';

async function setupTestUsers() {
  console.log('建立測試用戶...\n');

  // 普通成員
  const member = await createUser({
    email: 'member@test.local',
    taxId: '12345678',
    password: 'TestPass123!',
    name: '測試成員',
    role: 'MEMBER',
    status: 'ACTIVE',
    points: 1000,
    emailVerified: true,
  });
  console.log('✅ 普通成員:', member.id);

  // 管理員
  const admin = await createUser({
    email: 'admin@test.local',
    taxId: '87654321',
    password: 'AdminPass123!',
    name: '測試管理員',
    role: 'ADMIN',
    status: 'ACTIVE',
    points: 0,
    emailVerified: true,
  });
  console.log('✅ 管理員:', admin.id);

  // 超級管理員
  const superAdmin = await createUser({
    email: 'superadmin@test.local',
    taxId: '11111111',
    password: 'SuperPass123!',
    name: '超級管理員',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    points: 0,
    emailVerified: true,
  });
  console.log('✅ 超級管理員:', superAdmin.id);
}

setupTestUsers();
```

### 步驟 2: 建立路由測試腳本

```typescript
// scripts/test-routes.ts
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

const testUsers = {
  member: { email: 'member@test.local', taxId: '12345678', password: 'TestPass123!' },
  admin: { email: 'admin@test.local', taxId: '87654321', password: 'AdminPass123!' },
  superAdmin: { email: 'superadmin@test.local', taxId: '11111111', password: 'SuperPass123!' },
};

async function testRoute(name: string, method: string, path: string, userRole?: string) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 如果需要認證，先登入取得 token
    if (userRole) {
      const user = testUsers[userRole as keyof typeof testUsers];
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ taxId: user.taxId, password: user.password }),
      });
      const { token } = await loginRes.json();
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
    });

    const status = res.status === 200 ? '✅' : '❌';
    console.log(`${status} ${method} ${path} - ${res.status}`);

  } catch (error) {
    console.log(`❌ ${method} ${path} - Error: ${error}`);
  }
}

async function runTests() {
  console.log('🧪 開始路由測試...\n');

  // 公開路由
  console.log('📌 公開路由:');
  await testRoute('GET /api/health', 'GET', '/health');
  await testRoute('GET /api/products', 'GET', '/products');

  // 認證路由
  console.log('\n📌 認證路由:');
  await testRoute('GET /api/user/profile', 'GET', '/user/profile', 'member');

  // 管理路由
  console.log('\n📌 管理路由:');
  await testRoute('GET /api/admin/users', 'GET', '/admin/users', 'admin');
}

runTests();
```

---

## 路由類型範本

### 1️⃣ 簡單查詢 (公開)

**例子**: `GET /api/products`

```typescript
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { categoryId: category }),
      },
      take: limit,
      include: {
        priceTiers: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json(products);
  } catch (error) {
    console.error('產品查詢失敗:', error);
    return Response.json({ error: '資料庫錯誤' }, { status: 500 });
  }
}
```

### 2️⃣ 帶認證的查詢 (認證路由)

**例子**: `GET /api/user/profile`

```typescript
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth-helper';

export async function GET(request: Request) {
  try {
    const { user, error } = await validateSession(request);

    if (error || !user) {
      return Response.json({ error: '未授權' }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        pointTransactions: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!profile) {
      return Response.json({ error: '用戶不存在' }, { status: 404 });
    }

    return Response.json(profile);
  } catch (error) {
    console.error('檔案查詢失敗:', error);
    return Response.json({ error: '資料庫錯誤' }, { status: 500 });
  }
}
```

### 3️⃣ 創建操作 (需事務)

**例子**: `POST /api/orders`

```typescript
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth-helper';

export async function POST(request: Request) {
  try {
    const { user, error } = await validateSession(request);
    if (error || !user) {
      return Response.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { items, note } = body;

    // 驗證購物車項目
    if (!items || items.length === 0) {
      return Response.json({ error: '訂單為空' }, { status: 400 });
    }

    // 使用事務確保數據一致性
    const order = await prisma.$transaction(async (tx) => {
      // 1. 計算總金額
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { priceTiers: { orderBy: { minQty: 'asc' } } },
        });

        if (!product) {
          throw new Error(`產品 ${item.productId} 不存在`);
        }

        // 找到適合的價格級別
        const priceTier = product.priceTiers
          .reverse()
          .find(t => item.quantity >= t.minQty) || product.priceTiers[0];

        const subtotal = priceTier.price * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: priceTier.price,
          subtotal,
        });
      }

      // 2. 建立訂單
      const newOrder = await tx.order.create({
        data: {
          orderNo: `ORD-${Date.now()}`,
          userId: user.id,
          status: 'PENDING',
          totalAmount,
          note,
          items: {
            createMany: {
              data: orderItems,
            },
          },
        },
        include: { items: true },
      });

      // 3. 清空購物車
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      return newOrder;
    });

    return Response.json(order, { status: 201 });
  } catch (error) {
    console.error('訂單創建失敗:', error);
    return Response.json({ error: '訂單創建失敗' }, { status: 500 });
  }
}
```

### 4️⃣ 管理操作 (高權限)

**例子**: `POST /api/admin/users/[id]/points`

```typescript
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth-helper';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await validateSession(request);

    // 驗證是否為管理員
    if (error || !user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return Response.json({ error: '禁止訪問' }, { status: 403 });
    }

    const body = await request.json();
    const { amount, reason } = body;

    if (!amount || !reason) {
      return Response.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. 查詢用戶
      const targetUser = await tx.user.findUnique({
        where: { id: params.id },
      });

      if (!targetUser) {
        throw new Error('用戶不存在');
      }

      // 2. 更新點數
      const newBalance = targetUser.points + amount;
      const updatedUser = await tx.user.update({
        where: { id: params.id },
        data: { points: newBalance },
      });

      // 3. 記錄交易
      await tx.pointTransaction.create({
        data: {
          userId: params.id,
          amount,
          balance: newBalance,
          type: 'MANUAL_ADJUST',
          reason,
        },
      });

      // 4. 記錄日誌
      await tx.userLog.create({
        data: {
          userId: params.id,
          adminId: user.id,
          action: 'POINTS_ADJUST',
          newValue: amount.toString(),
          reason,
        },
      });

      return updatedUser;
    });

    return Response.json(result);
  } catch (error) {
    console.error('點數調整失敗:', error);
    return Response.json({ error: '操作失敗' }, { status: 500 });
  }
}
```

---

## 常見模式

### 錯誤處理

```typescript
// ✅ 推薦模式
try {
  // 業務邏輯
} catch (error) {
  const message = error instanceof Error ? error.message : '未知錯誤';
  console.error('操作失敗:', message);

  // 區分錯誤類型
  if (error?.code === 'P2025') {
    return Response.json({ error: '記錄不存在' }, { status: 404 });
  }
  if (error?.code === 'P2002') {
    return Response.json({ error: '重複的記錄' }, { status: 409 });
  }

  return Response.json({ error: '內部錯誤' }, { status: 500 });
}
```

### 分頁

```typescript
const { searchParams } = new URL(request.url);
const page = parseInt(searchParams.get('page') || '1');
const pageSize = parseInt(searchParams.get('pageSize') || '20');

const skip = (page - 1) * pageSize;

const [items, total] = await Promise.all([
  prisma.product.findMany({
    skip,
    take: pageSize,
  }),
  prisma.product.count(),
]);

return Response.json({
  items,
  pagination: {
    page,
    pageSize,
    total,
    pages: Math.ceil(total / pageSize),
  },
});
```

### 事務處理

```typescript
const result = await prisma.$transaction(async (tx) => {
  // 所有操作必須使用 tx 而非 prisma
  const item1 = await tx.table1.create({ data: {...} });
  const item2 = await tx.table2.update({ where: {...}, data: {...} });
  return { item1, item2 };
});
```

---

## 檢查清單

### 完成每個路由時

- [ ] 認證驗證正確 (公開/認證/管理)
- [ ] Prisma 查詢已驗證
- [ ] 錯誤處理完整
- [ ] 數據驗證正確
- [ ] 事務用於多表操作
- [ ] 舊代碼已移除
- [ ] 測試通過
- [ ] 性能可接受 (< 200ms)

### 完成每個波次時

- [ ] 所有路由測試通過
- [ ] 更新 Gem3Plan.md 的進度
- [ ] 更新 DailyProgress.md
- [ ] 建立 git commit

---

## 下一步

### Week 1 - 認證層驗證

```bash
# 1. 建立測試用戶
npx tsx scripts/setup-test-users.ts

# 2. 測試認證路由
npm run test:auth

# 3. 驗證 NextAuth 會話
npm run test:session

# 4. 驗證 Bearer Token
npm run test:bearer-token
```

### Week 1-2 - 公開路由遷移

逐一遷移 8 個公開路由，確保每個都：
- ✅ 返回正確數據
- ✅ 性能可接受
- ✅ 錯誤處理完整

### Week 2-3 - 認證和管理路由

按優先級遷移認證和管理路由，特別注意：
- 🔴 管理路由中的複雜事務
- 🔴 多表關係的完整性
- 🔴 權限驗證的正確性

---

**最後更新**: 2026-02-28
**狀態**: 準備啟動 ⏳

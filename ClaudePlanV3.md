# CEO 團購電商平台 V3 實施計劃

## Context

基於對 `claudePlanV2.md` 和 `progress.md` 的深入分析，以及對代碼庫的全面探索，我們發現平台雖然功能基礎完善（Phase 1 代碼合併已完成，189/193 測試通過），但存在**影響用戶體驗的關鍵問題**和**阻止上線的嚴重 Bug**。

### 當前狀態

**已完成：**
- ✅ 單一代碼庫 `ceo-platform/`（Phase 1 合併完成）
- ✅ 完整的階梯定價系統和團購進度顯示
- ✅ 18 個 shadcn/ui 組件 + Tailwind CSS 4
- ✅ 基本的購物車和結帳流程

**關鍵問題：**
1. **P0 阻塞性 Bug**（無法上線）：
   - 訂單詳情頁使用 100% Mock 資料（未連接 API）
   - 結帳表單使用 `defaultValue`（未收集表單數據）
   - 首頁使用硬編碼 Mock 資料（未串接 API）
   - API 回應格式不一致（orders 返回 `{data: []}`, cart 返回 `{items: []}`）

2. **UI/UX 體驗問題**（影響用戶滿意度）：
   - 使用 `alert()` 而非現代化 Toast 通知
   - 缺少錯誤邊界（頁面崩潰 = 白屏）
   - 主色調使用灰色（缺乏品牌識別度）
   - 缺少「還差 X 件達優惠」的提示

3. **代碼品質**：
   - 156 個 linting 錯誤（81 錯誤 + 75 警告）
   - 4 個測試失敗（Email 服務測試）

### 資源與約束

- **開發資源**：個人開發者，兼職（每週 15 小時）
- **目標日期**：2026 年 4 月中旬（約 6-7 週）
- **優先級**：UI/UX → 代碼品質 → 部署
- **範圍**：Web 應用優先（Mobile 後續迭代）

### 目標

採用**方案 A：快速修復 + 漸進改善**策略，在 6-7 週內：
1. 修復所有阻塞性 Bug（可上線）
2. 提升核心頁面的 UI/UX 體驗
3. 優化購物流程的互動反饋
4. 改善代碼品質並完成 Staging 部署

---

## 實施計劃

### 第 1-2 週：P0 緊急修復（30 小時）

**目標**：修復所有阻止上線的關鍵 Bug

**執行進度**：
- ✅ **第一批完成（16 小時）**：任務 1.1-1.4
  - 1.1 修復訂單詳情頁 Mock 資料 ✅
  - 1.2 修復結帳表單資料收集 ✅
  - 1.3 統一 API 回應格式 ✅
  - 1.4 添加錯誤邊界 ✅
- ✅ **第二批完成（14 小時）**：任務 1.5-1.7
  - 1.5 連接首頁至真實 API ✅
  - 1.6 替換 alert() 為 Toast ✅
  - 1.7 驗證與整合測試 ✅

**📊 P0 修復完成統計**
- ✅ 全部 7 個 P0 任務完成
- ✅ 30 小時工作完成
- ✅ 所有阻塞性 Bug 修復
- ✅ 構建成功 + 216/216 測試通過 (100%)

#### 1.1 修復訂單詳情頁 Mock 資料（4 小時）⚠️ P0

**問題**：`/app/orders/[id]/page.tsx` 使用完全 Mock 的資料，未連接 API

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/orders/[id]/page.tsx`

**步驟**：
1. 移除 Mock 資料（第 10-24 行）
2. 添加狀態管理：`useState<Order | null>(null)`
3. 在 `useEffect` 中從 `/api/orders/${id}` 獲取資料
4. 添加 loading 和 error 狀態處理
5. 處理訂單不存在的情況（404）

**程式碼範例**：
```typescript
'use client';
import { use, useEffect, useState } from 'react';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
        if (!response.ok) throw new Error('訂單不存在');
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入失敗');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!order) return <NotFoundState />;

  // ... 渲染訂單詳情
}
```

**驗證**：導航至 `/orders/[真實訂單ID]`，確認顯示真實資料

---

#### 1.2 修復結帳表單資料收集（5 小時）⚠️ P0

**問題**：`/app/checkout/page.tsx` 使用 `defaultValue`，提交時未收集表單資料

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/checkout/page.tsx`

**步驟**：
1. 添加表單狀態管理
2. 將所有 `<Input defaultValue={...} />` 改為受控組件 `<Input value={...} onChange={...} />`
3. 更新 `handlePlaceOrder` 發送完整表單資料
4. 添加表單驗證（必填欄位、Email 格式、電話號碼格式）

**程式碼範例**：
```typescript
const [formData, setFormData] = useState({
  name: '',
  taxId: '',
  email: '',
  phone: '',
  billingAddress: '',
  shippingAddress: '',
  paymentMethod: 'CREDIT_CARD' as const
});

const handleInputChange = (field: keyof typeof formData) => (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  setFormData(prev => ({ ...prev, [field]: e.target.value }));
};

// 驗證函數
const validateForm = (): boolean => {
  if (!formData.name || !formData.email || !formData.phone) {
    toast.error('請填寫所有必填欄位');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    toast.error('Email 格式不正確');
    return false;
  }
  return true;
};

// 提交訂單
const handlePlaceOrder = async () => {
  if (!validateForm()) return;

  const orderData = {
    items: cartItems.map(item => ({
      productId: item.productId || String(item.id),
      quantity: item.quantity
    })),
    shippingInfo: formData,
    note: orderNote
  };

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });

  // ... 處理回應
};
```

**驗證**：提交訂單，檢查 API 收到完整表單資料

---

#### 1.3 統一 API 回應格式（3 小時）⚠️ P0

**問題**：不同 API 返回格式不一致（orders 返回 `{data: []}`, cart 返回 `{items: []}`）

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/api/orders/route.ts`
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/orders/page.tsx`

**步驟**：
1. 標準化所有列表 API 返回 `{data: [], pagination?: {}}`
2. 更新前端期望的格式
3. 測試所有 API 端點

**Orders API 修改**（第 111 行）：
```typescript
// 修改前
return NextResponse.json({
  orders: formattedOrders,
  pagination: { ... }
});

// 修改後
return NextResponse.json({
  data: formattedOrders,  // ✓ 統一使用 data
  pagination: { ... }
});
```

**前端修改**（`/app/orders/page.tsx` 第 100 行）：
```typescript
// 修改前
setOrders(data.orders || []);

// 修改後
setOrders(data.data || []);
```

**驗證**：測試 `/api/orders`, `/api/products`, `/api/cart` 格式一致

---

#### 1.4 添加錯誤邊界（4 小時）⚠️ P0

**問題**：頁面崩潰時顯示白屏，缺少友善錯誤提示

**新建檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/error.tsx`
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/not-found.tsx`
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/products/error.tsx`
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/orders/error.tsx`
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/cart/error.tsx`

**實作範例**（`app/error.tsx`）：
```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('頁面錯誤:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>發生錯誤</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || '載入頁面時發生問題，請稍後再試。'}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              重試
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
              返回首頁
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**not-found.tsx 範例**：
```typescript
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <p className="text-xl mb-6">找不到您要的頁面</p>
        <Button asChild>
          <Link href="/">返回首頁</Link>
        </Button>
      </div>
    </div>
  );
}
```

**驗證**：觸發錯誤（如訪問不存在的訂單），確認顯示友善錯誤頁面

---

#### 1.5 連接首頁至真實 API（5 小時）⚠️ P0

**問題**：首頁使用硬編碼 Mock 資料

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/page.tsx`

**步驟**：
1. 添加 `'use client'` 指令
2. 移除 Mock 資料（第 11-24 行）
3. 添加狀態管理和 API 調用
4. 添加 Loading Skeleton
5. 處理錯誤狀態

**程式碼範例**：
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featuredRes, latestRes] = await Promise.all([
          fetch('/api/products?featured=true&limit=4'),
          fetch('/api/products?sortBy=createdAt&order=desc&limit=4')
        ]);

        if (!featuredRes.ok || !latestRes.ok) {
          throw new Error('載入商品失敗');
        }

        const featuredData = await featuredRes.json();
        const latestData = await latestRes.json();

        setFeaturedProducts(featuredData.data || []);
        setLatestProducts(latestData.data || []);
      } catch (error) {
        toast.error('載入商品時發生錯誤');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <HomePageSkeleton />;
  }

  // ... 渲染商品
}

// Loading Skeleton 組件
function HomePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**驗證**：首頁顯示真實商品資料

---

#### 1.6 替換 alert() 為 Toast（3 小時）⚠️ P0

**問題**：使用原生 `alert()` 破壞行動裝置體驗

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/products/[id]/page.tsx`
- 所有使用 `alert()` 的檔案

**步驟**：
1. 搜尋所有 `alert(` 使用
2. 引入 `import { toast } from 'sonner'`
3. 替換為 `toast.success()` 或 `toast.error()`
4. 確保 `<Toaster />` 在 layout.tsx 中

**程式碼修改**：
```typescript
// 修改前
alert(`已加入購物車: ${quantity} ${product?.unit || '件'}`);

// 修改後
import { toast } from 'sonner';
toast.success(`已加入購物車：${quantity} ${product?.unit || '件'}`);

// 錯誤處理
// 修改前
alert(err instanceof Error ? err.message : '加入購物車失敗');

// 修改後
toast.error(err instanceof Error ? err.message : '加入購物車失敗');
```

**驗證**：所有通知使用 Toast，無 alert() 彈窗

---

#### 1.7 驗證與整合測試（6 小時）

**測試範圍**：
1. 完整的結帳流程（瀏覽 → 加入購物車 → 結帳 → 訂單確認）
2. 所有 API 端點正常運作
3. 錯誤情境測試（網路錯誤、資料驗證失敗、404）
4. 跨瀏覽器測試（Chrome、Safari、Firefox）
5. 響應式測試（手機、平板、桌面）

---

### 第 3-4 週：UI/UX 核心改進（30 小時）

**目標**：建立品牌識別度、優化視覺設計、提升互動體驗

**📊 執行進度**：
- ✅ **全部 6 個任務完成**（2026-02-18 完成）
  - ✅ 2.1 品牌色系統 - OKLCH + 語義化 tokens + Noto Sans TC
  - ✅ 2.2 移除硬編碼色彩 - 20 個 tokens 統一替換
  - ✅ 2.3 商品卡片優化 - 新增"還差 X 件達優惠"提示
  - ✅ 2.4 首頁現代化設計 - Hero 區塊增強 + 平台優勢重設計
  - ✅ 2.5 購物車互動改善 - 刪除確認對話框 + 完整 UX
  - ✅ 2.6 測試驗收 - 216/216 測試通過（100%）
- ✅ **構建驗收**: 5.0-5.6 秒，55/55 頁面生成，零新錯誤
- ✅ **質量指標**:
  - TypeScript 型別安全：0 新錯誤
  - 測試覆蓋：216/216 (100%)
  - 色彩統一：20 個硬編碼替換完成

---

#### 2.1 建立品牌色系統（5 小時） ✅ COMPLETED

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/globals.css`

**步驟**：
1. 定義 OKLCH 品牌色彩
2. 添加語義化色彩 tokens（success、warning、info）
3. 添加中文字體支援

**CSS 變數定義**：
```css
@layer base {
  :root {
    /* 品牌主色 - 藍色系 */
    --primary: oklch(0.55 0.22 264);
    --primary-foreground: oklch(0.98 0 0);

    /* 語義化色彩 */
    --success: oklch(0.7 0.18 162);
    --success-foreground: oklch(0.98 0 0);
    --warning: oklch(0.75 0.15 70);
    --warning-foreground: oklch(0.2 0 0);
    --info: oklch(0.72 0.14 196);
    --info-foreground: oklch(0.98 0 0);

    /* 保留原有的 destructive */
    --destructive: oklch(0.577 0.245 27.325);
    --destructive-foreground: oklch(0.985 0 0);
  }

  /* 中文字體支援 */
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap');

  @theme inline {
    --font-sans: 'Noto Sans TC', var(--font-geist-sans), system-ui, sans-serif;
  }
}
```

**驗證**：色彩系統在淺色/深色模式下正確顯示

---

#### 2.2 移除硬編碼色彩（6 小時）

**搜尋模式**：`grep -r "blue-[0-9]\|red-[0-9]\|green-[0-9]" src/`

**優先修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/page.tsx`（Hero 區塊 bg-blue-600）
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/components/layout/header.tsx`（text-blue-600）
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/products/[id]/page.tsx`（階梯卡片）
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/checkout/page.tsx`（bg-blue-600）

**替換規則**：
```typescript
// 修改前 → 修改後
bg-blue-600 → bg-primary
text-blue-600 → text-primary
hover:bg-blue-700 → hover:bg-primary/90
text-red-600 → text-destructive
text-green-600 → text-success
bg-yellow-100 → bg-warning/10
text-yellow-800 → text-warning
```

**驗證**：所有色彩使用設計系統 tokens

---

#### 2.3 優化商品卡片設計（5 小時）

**目標**：添加「還差 X 件達優惠」提示、美化進度條

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/products/[id]/page.tsx`

**關鍵功能**：
```typescript
// 計算下一階梯資訊
const getNextTierInfo = () => {
  const currentQty = product.totalSold || 0;
  const sortedTiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);

  const nextTier = sortedTiers.find(tier => tier.minQty > currentQty);

  if (nextTier) {
    const currentTier = sortedTiers.findLast(tier => tier.minQty <= currentQty) || sortedTiers[0];
    return {
      remaining: nextTier.minQty - currentQty,
      price: nextTier.price,
      currentPrice: currentTier.price,
      savings: (currentTier.price - nextTier.price) * nextTier.minQty
    };
  }
  return null;
};

const nextTierInfo = getNextTierInfo();

// UI 顯示
{nextTierInfo && (
  <div className="flex items-center gap-2 mt-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
    <TrendingUp className="h-4 w-4 text-warning" />
    <p className="text-sm text-warning-foreground">
      <span className="font-medium">再買 {nextTierInfo.remaining} {product.unit}</span>
      即可享 <span className="font-bold">${nextTierInfo.price}/{product.unit}</span> 優惠
      （省 ${(nextTierInfo.currentPrice - nextTierInfo.price).toFixed(0)}）
    </p>
  </div>
)}
```

**驗證**：商品頁顯示清晰的優惠提示

---

#### 2.4 首頁現代化設計（6 小時）

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/page.tsx`

**改進項目**：
1. 更新 Hero 區塊使用品牌色漸變
2. 改善間距和排版
3. 添加商品分類區塊
4. 優化響應式佈局

**Hero 區塊範例**：
```typescript
<section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20 overflow-hidden">
  {/* 網格背景 */}
  <div className="absolute inset-0 bg-grid-white/10" />

  <div className="container relative mx-auto px-4 text-center">
    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
      CEO 團購電商平台
    </h1>
    <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90 leading-relaxed">
      專為醫療機構打造的專業團購平台<br />
      享受量大價優的採購體驗
    </p>

    {/* 搜尋框 */}
    <form className="max-w-2xl mx-auto">
      <div className="relative">
        <Input
          type="text"
          name="search"
          placeholder="搜尋商品..."
          className="h-14 px-6 pr-14 text-lg rounded-full shadow-lg bg-white text-foreground"
        />
        <Button
          type="submit"
          size="lg"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </form>
  </div>
</section>
```

**驗證**：首頁視覺專業且現代

---

#### 2.5 購物車互動改善（4 小時）

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/cart/page.tsx`

**改進項目**：
1. 添加刪除確認對話框（使用 AlertDialog）
2. 優化數量調整的載入狀態
3. 添加樂觀更新（Optimistic UI）

**刪除確認對話框**：
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm" disabled={removingItemId === item.id}>
      {removingItemId === item.id ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      移除
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>確認移除商品</AlertDialogTitle>
      <AlertDialogDescription>
        確定要從購物車移除「{item.product?.name}」嗎？
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>取消</AlertDialogCancel>
      <AlertDialogAction onClick={() => handleRemoveItem(item.id)}>
        確認移除
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**驗證**：購物車操作流暢且安全

---

#### 2.6 測試與調整（4 小時）

---

### 第 5-6 週：購物流程優化（30 小時）

**目標**：完善結帳體驗、訂單管理功能

#### 3.1 訂單確認頁面（6 小時）

**新建檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/orders/confirmation/page.tsx`

**功能**：
1. 顯示訂單編號、總金額、預計送達時間
2. 顯示付款方式和配送資訊
3. 提供「繼續購物」和「查看訂單」按鈕
4. 可選：添加慶祝動畫（confetti）

**驗證**：訂單成功後顯示確認頁面

---

#### 3.2 結帳進度指示器（4 小時）

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/checkout/page.tsx`

**功能**：添加步驟指示器（購物車 → 填寫資料 → 確認訂單 → 完成）

**驗證**：用戶清楚知道當前進度

---

#### 3.3 訂單搜尋功能（5 小時）

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/orders/page.tsx`
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/api/orders/route.ts`

**功能**：
1. 添加訂單編號搜尋輸入框
2. 添加日期範圍篩選
3. 更新 API 支援搜尋參數

**驗證**：可按訂單編號和日期搜尋

---

#### 3.4 庫存管理指示器（6 小時）✨ P2

**修改檔案**：
- 商品列表頁
- 商品詳情頁
- 購物車頁

**功能**：
1. 顯示「低庫存」、「售完」標籤
2. 庫存不足時禁用加入購物車
3. 購物車顯示庫存狀態

**驗證**：庫存資訊清晰可見

---

#### 3.5 最低集購數量（4 小時）✨ P2

**修改內容**：
1. 在 Product schema 添加 `minGroupQty` 欄位
2. 結帳時檢查是否達最低數量
3. 顯示集購進度

**驗證**：集購規則正確執行

---

#### 3.6 整合測試（5 小時）

---

### 第 7 週：代碼品質 + Staging（15 小時）

**目標**：修復代碼問題、完成部署驗證

#### 4.1 修復關鍵 Linting 錯誤（6 小時）

**優先處理**：
1. 移除 80 個 `@typescript-eslint/no-explicit-any`
2. 修復 76 個未使用變數警告
3. 修復 React hooks 依賴問題

**方法**：
- 將 `any` 替換為具體類型（如 `Prisma.OrderWhereInput`）
- 移除或使用未使用的變數
- 添加正確的 useEffect 依賴

**驗證**：Linting 錯誤 < 50

---

#### 4.2 修復 Email 服務測試（3 小時）

**修改檔案**：
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/lib/email/__tests__/email-service.test.ts`

**驗證**：所有 193 測試通過（100%）

---

#### 4.3 Staging 部署驗證（4 小時）

**活動**：
1. 部署到 Staging 環境
2. 運行冒煙測試
3. 效能測試（頁面載入速度）
4. 安全掃描
5. 記錄部署流程

---

#### 4.4 最終 QA 與文檔（2 小時）

**活動**：
1. 完整功能測試
2. 更新 README 和部署文檔
3. 準備上線檢查清單

---

## 關鍵檔案路徑

### P0 必修檔案（第 1-2 週）
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/orders/[id]/page.tsx` - 訂單詳情 Mock 資料修復
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/checkout/page.tsx` - 結帳表單資料收集
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/page.tsx` - 首頁 API 連接
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/api/orders/route.ts` - API 格式統一
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/error.tsx` - 錯誤邊界（新建）
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/not-found.tsx` - 404 頁面（新建）

### UI 改進檔案（第 3-4 週）
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/globals.css` - 品牌色系統
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/products/[id]/page.tsx` - 商品卡片優化
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/components/layout/header.tsx` - 移除硬編碼色彩
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/cart/page.tsx` - 購物車互動

### 功能擴展檔案（第 5-6 週）
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/orders/confirmation/page.tsx` - 訂單確認（新建）
- `/Users/hsuyungfeng/Applesoft/統購PHP/ceo-platform/src/app/orders/page.tsx` - 訂單搜尋

---

## 可重用的現有工具

### 已安裝的組件和工具
1. **Toast 系統**：`sonner` 已安裝（在 layout.tsx 中已有 `<Toaster />`）
2. **Progress 組件**：`/src/components/ui/progress.tsx`（支援自訂顏色和尺寸）
3. **階梯定價邏輯**：`/src/lib/pricing.ts`（`calculateUnitPrice` 函數）
4. **Prisma Client**：`/src/lib/prisma.ts`（資料庫連接）
5. **Logger**：`/src/lib/logger.ts`（Pino 日誌系統）
6. **驗證器**：`/src/lib/validators.ts`（Zod schemas）

### 設計系統組件（18 個）
- Button, Input, Textarea, Select, Checkbox, Switch
- Card, Table, Separator
- Dialog, AlertDialog, DropdownMenu
- Alert, Badge, Progress
- Form, Label, Sonner (Toast)

---

## 風險評估

### 高風險項目
1. **資料庫遷移問題**：如果需要添加新欄位（如 `minGroupQty`）
   - **緩解**：使用 Prisma migrate，先在開發環境測試

2. **API 破壞性變更**：統一回應格式可能影響現有功能
   - **緩解**：逐步更新，保持向後相容，或使用 API 版本控制

3. **效能下降**：首頁從 Mock 改為 API 可能增加載入時間
   - **緩解**：實作 ISR（Incremental Static Regeneration）或快取

4. **認證 Bug**：修改表單可能影響訂單創建流程
   - **緩解**：在 Staging 環境完整測試

### 緩解策略
1. **功能開關（Feature Flags）**：重大變更使用環境變數控制
2. **漸進式推出**：先在 Staging 驗證，再部署到生產
3. **資料庫備份**：每次遷移前完整備份
4. **回滾腳本**：準備快速回滾方案

---

## 驗證方式

### 第 1-2 週驗證
1. **訂單詳情頁**：訪問 `/orders/[真實ID]`，確認顯示真實資料
2. **結帳表單**：提交訂單，檢查 API 收到完整表單資料（使用瀏覽器 DevTools Network 標籤）
3. **首頁 API**：確認首頁顯示資料庫中的真實商品
4. **API 格式**：測試 `/api/orders`, `/api/products`, `/api/cart` 返回一致格式
5. **錯誤邊界**：訪問不存在的頁面（如 `/orders/999999`），確認顯示 404 頁面
6. **Toast 通知**：加入購物車，確認顯示 Toast 而非 alert

### 第 3-4 週驗證
1. **色彩系統**：檢查所有頁面使用設計系統色彩（無硬編碼色彩）
2. **商品卡片**：確認顯示「還差 X 件達優惠」提示
3. **首頁設計**：視覺專業、響應式佈局正常
4. **購物車**：刪除項目時顯示確認對話框

### 第 5-6 週驗證
1. **訂單確認**：下單成功後跳轉至確認頁面
2. **結帳進度**：顯示當前步驟指示器
3. **訂單搜尋**：可按訂單編號搜尋

### 第 7 週驗證
1. **Linting**：運行 `pnpm lint`，錯誤 < 50
2. **測試**：運行 `pnpm test`，所有測試通過
3. **建置**：運行 `pnpm build`，成功建置
4. **Staging**：在 Staging 環境完整測試所有流程

---

## 時間分配總覽

| 週次 | 階段 | 預估時數 | 關鍵成果 |
|------|------|----------|----------|
| 1-2 | P0 緊急修復 | 30 小時 | 修復所有阻塞性 Bug，可基本運作 |
| 3-4 | UI/UX 改進 | 30 小時 | 建立品牌色系統，優化視覺設計 |
| 5-6 | 購物流程優化 | 30 小時 | 完善結帳體驗，訂單管理功能 |
| 7 | 代碼品質 + Staging | 15 小時 | 修復 linting/測試，部署驗證 |
| **總計** | **7 週** | **105 小時** | **可上線的完整平台** |

---

## 成功標準

### 第 2 週結束時（P0 修復完成）
- ✅ 所有頁面連接真實 API（無 Mock 資料）
- ✅ 結帳流程可完整收集表單資料
- ✅ API 回應格式統一
- ✅ 所有頁面有錯誤邊界保護
- ✅ 使用 Toast 通知（無 alert）

### 第 4 週結束時（UI 改進完成）
- ✅ 品牌色系統建立且一致使用
- ✅ 首頁視覺專業現代
- ✅ 商品卡片顯示清晰的優惠資訊
- ✅ 購物車互動流暢安全

### 第 6 週結束時（功能完善）
- ✅ 訂單確認頁面完成
- ✅ 結帳有進度指示
- ✅ 訂單可搜尋和篩選

### 第 7 週結束時（上線就緒）
- ✅ Linting 錯誤 < 50
- ✅ 所有測試通過（193/193）
- ✅ Staging 環境運行穩定
- ✅ 部署流程文檔完整

---

## 下一步

完成此計劃後，V3.1 可考慮的功能：
- 實際支付整合（信用卡、第三方支付）
- 發票管理系統
- 物流追蹤
- 評價系統
- Mobile 應用精細化
- 推薦演算法
- 優惠券系統

---

**計劃制定日期**：2026-02-18
**預計完成日期**：2026-04-08（7 週後）
**資源**：個人開發者，兼職 15 小時/週
**總預算**：105 小時

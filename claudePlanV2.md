# CEO 團購電商平台 v2 - 綜合改善計劃 V2

> **審查日期**：2026-02-17
> **審查方式**：三人專家團隊分析（UX/產品、技術架構、批判性評估）
> **目標**：統整 ClaudePlan.md 與 progress.md，提出優化執行路徑

---

## 概略

本文件整合了三個獨立視角的分析：

1. **UX/產品專家**：用戶體驗、設計一致性、無障礙性 (7/10)
2. **技術架構師**：系統設計、程式碼品質、可維護性 (2/5) ⚠️
3. **批判性評估者**：風險挑戰、假設驗證、重大決策點

---

## 🚨 第0優先級：致命問題（必須立即解決）

### 問題 A：雙重程式碼庫悖論 ✅ **已解決（2026-02-17）**

**現狀**：
- ~~`ceo-platform/`（960 KB）與 `ceo-monorepo/apps/web/`（1.2 MB）並存~~ ✅ **已合併**
- ~~`.worktrees/phase6/`、`.worktrees/email-auth/` 有額外副本~~ ✅ **已清理**
- ~~最近的 commit 同時修改兩個版本~~ ✅ **單一源頭已建立**
- **當前狀態**：`ceo-platform/` 為單一源頭代碼庫，包含所有功能（Phase 0-8）及安全強化（CSRF、速率限制、Sentry）

**解決方案執行**：
```
✅ 保留：ceo-platform/（單一源頭）
✅ 合併安全功能：從 ceo-monorepo 複製安全庫（CSRF、速率限制、輸入驗證）
✅ 清理工作樹：釋放 5.9GB 磁碟空間
✅ 測試遷移：Jest → Vitest，189/193 測試通過
```

**完成時間**：2026-02-17（7 階段合併計劃完成）

**剩餘工作**：
- 修復 4 個測試失敗（Email 服務測試）
- 處理 156 個 linting 錯誤（81 錯誤，75 警告）

---

### 問題 B：從未真正部署過

**現狀**：

- `progress.md` 記錄："配置完成但從未真正部署過"
- Deployment Readiness = 2/5 ⭐
- Docker 設定存在，但未在實際基礎設施上驗證

**為什麼危險**：

- Schema migrations 可能在生產環境失敗
- 環境變數配置未實測
- 資料庫連線池設定可能不適合負荷
- 無法估計真實的 breaking points（100 用戶？1000？）

**決策點**：必須部署到 staging 環境並運行負荷測試

**建議方案**：

```
Week 1：部署到 staging
  - 驗證 Docker build 成功
  - 驗證 Prisma migrations 完整無誤
  - 測試環境變數與 secrets 管理

Week 2：運行負荷測試
  - 100 concurrent users（購物流程）
  - 1000 concurrent API calls（搜尋 + 商品詳情）
  - 監控 DB 連線使用率

Week 3：修復發現的問題
  - Index 缺失、query 優化
  - 連線池配置調整
  - 錯誤率監控
```

**時間成本**：1-2 週

---

### 問題 C：架構混淆 - 誰負責後端？

**現狀**：

- `ceo-platform/src/app/api/` 有 41 個 API 路由
- 這些處理：認證、商品、購物車、訂單、**管理端點**、webhooks
- `package.json` 裡有 `"hono": "^4.11.9"`，但沒用到
- Next.js API Routes 設計用於簡單 lambda，不是完整後端

**為什麼危險**：

- Next.js API Routes 在「複雜商務邏輯」時會成為瓶頸
- 你有 41 個路由，這超出了「簡單 lambda」的範圍
- 「Hono 已安裝但未使用」暗示原計劃是「分離後端」但被放棄

**決策點**：要麼承認「Next.js API Routes 足夠」，要麼現在就提取為獨立 Hono 服務

**建議方案**（挑一個）：

```
選項 A：堅持 Next.js API Routes（V1 快速上線）
  風險：最多支援 ~1000 訂單/天
  限制：設定明確的上限，超過時重新架構

選項 B：現在提取為 Hono 後端（更長期）
  成本：+3-4 週時間
  收益：更易擴展、獨立部署、微服務基礎
```

**我的建議**：選 A（快速上線），但明確寫下「V1.1 或 V2 時提取」

---

## ⭐ 第1優先級：關鍵功能修復（本週完成）

### F1. 替換所有 `alert()` 為 Toast（高影響）

**現狀**：商品詳情頁、購物車頁面使用原生 `alert()`，破壞移動裝置體驗

**修復**：

```typescript
// 舊
alert("已加入購物車");

// 新
import { toast } from "sonner";
toast.success("已加入購物車");
```

**時間**：1 小時
**影響**：UX 評分 +2 分

---

### F2. 建立 Error Boundary（中等影響）

**現狀**：零個 `error.tsx` 檔案，頁面錯誤 = 白屏

**修復**：

```typescript
// app/error.tsx
'use client';
export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>出錯了</h1>
      <button onClick={reset}>重試</button>
    </div>
  );
}
```

**時間**：2 小時（含在重點頁面上放置）
**影響**：UX 評分 +1 分，可靠性 +3 分

---

### F3. 移除 33 個 `any` 型別（程式碼品質）

**現狀**：

```typescript
const where: any = {};  // ❌ API 路由
async jwt({ token, user }: { token: any; user: any })  // ❌ 認證
```

**修復**：

```typescript
import { Prisma } from "@prisma/client";
const where: Prisma.OrderWhereInput = {}; // ✅
```

**時間**：2-3 小時
**影響**：編譯時找到 bug，可維護性 +2 分

---

### F4. 實作 ISR/SSR 策略（效能）

**現狀**：所有頁面 `'use client'`，全部靠客戶端 fetch

**修復**：商品列表頁改為 SSR + ISR

```typescript
// app/products/page.tsx
export const revalidate = 60; // ISR: 每 60 秒重新驗證

export default async function ProductsPage() {
  const products = await fetch("/api/products", {
    next: { revalidate: 60 },
  });
  // 伺服器端渲染，流送至客戶端
}
```

**時間**：3-4 小時
**影響**：Lighthouse 評分 +15 分（SEO + Core Web Vitals）

---

## 🟡 第2優先級：安全 + 品質（本週完成）

### S1. 從 Git 歷史清除 `.env.local`（Critical）

**現狀**：敏感憑證已存在 Git 歷史

**修復**：

```bash
# 使用 BFG Repo-Cleaner
bfg --delete-files .env.local repo/.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**時間**：2-3 小時
**風險**：必須輪換所有洩漏的密碼

---

### S2. 移除 61 個 `console.log`（程式碼衛生）

**現狀**：

```typescript
console.error("憑證驗證失敗:", validatedCredentials.error);
```

**修復**：

```typescript
import { logger } from "@/lib/logger";
logger.error({ err: validatedCredentials.error }, "憑證驗證失敗");
```

**時間**：2 小時（Pino 已安裝，只需遷移呼叫）
**影響**：生產監控 + 中央化日誌

---

### S3. 新增 CORS + CSRF + CSP 頭（安全）

**現狀**：無防護

**修復**：在 `middleware.ts` 添加

```typescript
// Middleware
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Strict-Transport-Security", "max-age=31536000");
  return response;
}
```

**時間**：1-2 小時
**影響**：OWASP 安全評分 +10 分

---

## 📊 第3優先級：測試覆蓋（2-3 週）

### T1. 寫入關鍵路徑的 E2E 測試

**目前現狀**：

- 164 個「安全測試」（文件記載）
- 15 個「API 測試」（實際狀態不明）
- **0 個整合測試**：signup → verify email → browse → checkout

**建議目標**：

```
優先順序 1️⃣ （高風險）：
  - 使用者註冊 → 驗證郵件 → 登入
  - 瀏覽商品 → 加入購物車 → 結帳 → 訂單確認
  - 管理員：新增商品 → 上架 → 使用者可見

優先順序 2️⃣ （中風險）：
  - 訂單取消 → 庫存回補
  - 分類管理 → 拖拽排序

預計測試數：20-30 個 E2E 測試
預計工時：10-15 小時
```

**建議工具**：Playwright（已配置）或 Cypress

---

## 🎯 最終決策與執行計劃（2026-02-17 確認）

### ✅ 關鍵決策確認

| 決策       | 選擇                        | 理由                                                                       |
| ---------- | --------------------------- | -------------------------------------------------------------------------- |
| 代碼庫方向 | **保留 ceo-platform**       | 有最新 bug 修復、Husky、Vitest；monorepo 的 8 個安全測試有價值但可複製過來 |
| 後端架構   | **堅持 Next.js API Routes** | 36 routes、3,667 LOC 在能力範圍內；Hono 已安裝但零使用；無性能問題證據     |
| Hono 時機  | **V1.1 或 V2**              | 當日訂單 >1000 筆或 API 請求 >10000/hr 時再考慮                            |
| 推播通知   | **Expo Server SDK 完成**    | 完整實現 FCM/APNs 支援、DeviceToken 模型、API 端點、Mobile 整合、測試     |

### 📋 第一階段：7 階段代碼庫合併 ✅ **已完成（2026-02-17）**

**完整詳細計劃見**：`/Users/hsuyungfeng/.claude/plans/linear-fluttering-squirrel.md`

**執行狀態**：
```
✅ 階段 1：安全備份 + Git 標籤（已完成）
✅ 階段 2：數據庫模式遷移（Email + OAuth 表）（已完成）
✅ 階段 3：安全功能遷移（Sentry + security middleware）（已完成）
✅ 階段 4：測試遷移（Jest → Vitest，8 個文件）（已完成，189/193 測試通過）
✅ 階段 5：驗證與編譯（pnpm build, pnpm test）（已完成）
✅ 階段 6：Worktrees 清理（釋放 5.9GB）（已完成）
✅ 階段 7：最終提交 + 版本標籤（已完成）
```

**已達成成果**：
- ✅ 單一代碼庫（`ceo-platform/` 為唯一源）
- ✅ 完整功能（Email 驗證 + OAuth + Sentry 監控）
- ✅ 11 個測試文件（3 API + 8 安全）
- ✅ 釋放 5.9GB 磁盤空間（已完成清理）
- ✅ 向 staging 部署做準備

**剩餘工作**：
- 修復 4 個測試失敗（Email 服務測試）
- 處理 156 個 linting 錯誤（81 錯誤，75 警告）

### 📍 第二階段：功能與品質修復（立即開始，2026-02-17 ~ 2026-03-03）

**高優先級用戶要求項目**：
1. ✅ **Push 通知配置**：已完整實現（DeviceToken 模型、Expo Server SDK、API 端點、Mobile 整合、測試與文檔）
2. **App 圖示生成**：生成各尺寸的 App 圖示資源（中優先級）

**原有功能與品質修復**：
```
Week 1-2（2026-02-17 ~ 2026-03-03）
├─ F1: Alert → Toast（1h）
├─ F2: Error Boundary（2h）
├─ F3: 移除 33 個 any 型別（2-3h）
├─ S1-S3: 安全頭 + CORS + CSRF（2h）
├─ 測試覆蓋率目標：70%+
├─ ISR 策略實施（3-4h）
├─ ✅ Push 通知基礎設施配置（FCM/APNs）（已完成）
├─ App 圖示資源生成（2-3h）
└─ Staging 部署準備
```

### 📍 第三階段：Staging 部署 + 負荷測試（1-2 週，2026-03-04 ~ 2026-03-18）

```
Week 3-4
├─ Day 1-2（2h）  部署到 staging 環境
├─ Day 3-4（4h）  運行負荷測試（100 → 1000 concurrent users）
├─ Day 5（2h）    修復發現的性能問題
└─ Day 6（2h）    驗證 migrations、secrets、監控
```

### 📍 第四階段：App Store 上架準備（時間待定，依 staging 結果調整）

根據 staging 部署結果，準備最終發佈：

```
- iOS TestFlight 內測
- Android Google Play 內測
- App Store 上架
- 生產環境監控設置
```

---

## 📋 UX 檢查清單

基於 UX 專家的 7/10 評估，優先修復：

```
🔴 Critical UX Issues:
  ☐ F1: Alert → Toast（已列）
  ☐ F2: Error Boundary（已列）

🟡 High UX Issues（第 3-4 週）:
  ☐ 商品詳情頁：加入 skeleton loader
  ☐ 購物車：加入數量變更的 toast 提示
  ☐ 圖片：改用 next/image（已部分完成）
  ☐ Footer 連結：修正年份與 href

🟢 Accessibility（第 5 週）:
  ☐ 加入 aria-label（購物車、選單）
  ☐ 加入焦點可見狀態（鍵盤導航）
  ☐ 將 placeholder-only input 改為 label + input
```

---

## ⚡ 技術債排序（按執行優先級）

### 🚨 第一優先：代碼庫合併（1-3 天內，13-16 小時）

| 項目                                 | 風險   | 工時 | 狀態       |
| ------------------------------------ | ------ | ---- | ---------- |
| **Phase 1-2：備份 + 數據庫遷移**     | High   | 3h   | **進行中** |
| **Phase 3-4：安全功能 + 測試遷移**   | High   | 10h  | **進行中** |
| **Phase 5-7：驗證 + Cleanup + 提交** | Medium | 3.5h | **進行中** |

### ⭐ 第二優先：功能與品質修復（2-3 週）

| 項目                    | 風險     | 工時 | 狀態       |
| ----------------------- | -------- | ---- | ---------- |
| Staging 部署測試        | Critical | 1-2w | 合併後開始 |
| Alert → Toast           | High     | 1h   | F1         |
| Error Boundary          | High     | 2h   | F2         |
| 移除 33 個 any 型別     | High     | 2-3h | F3         |
| 添加安全頭（CORS/CSRF） | High     | 1-2h | S3         |
| ISR 策略實施            | Medium   | 3-4h | F4         |

### 🟡 第三優先：長期改進（1 月+）

| 項目                 | 風險   | 工時   | 狀態    |
| -------------------- | ------ | ------ | ------- |
| E2E 測試（核心路徑） | Medium | 10-15h | T1      |
| 無障礙標籤           | Low    | 2-3h   | 第 5 週 |
| 日誌系統（Pino）     | Low    | 2h     | 已完成  |

### 💡 架構決策（已決策）

| 決策              | 選擇                       | 詳情                                                                        |
| ----------------- | -------------------------- | --------------------------------------------------------------------------- |
| **Hono 後端遷移** | ❌ 不需要（V1）            | 36 routes、3,667 LOC 在 Next.js 能力範圍；零性能問題證據；Hono 已安裝但未用 |
| **遷移觸發條件**  | 日訂單 >1000 或 API >10k/h | V1.1 或 V2 評估是否需要                                                     |
| **立即優化**      | 連接池配置、ISR 實施       | 不涉及架構改變，只是參數調整                                                |

---

## ⚠️ 批判性評估：5 大風險

### Risk 1: 「準備就緒」的幻覺

**問題**：90% 功能完成 ≠ 40% 部署就緒

- 代碼完成了，但從未在負荷下運行過
- 配置文件存在，但從未使用過

**行動**：先部署到 staging（真實基礎設施），再宣布「準備就緒」

---

### Risk 2: 架構決策延後

**問題**：Hono 已安裝但無用，Next.js API Routes 被推往極限

- 現在有 41 個路由 + 複雜商務邏輯
- 「下次重構」會變成「永不重構」

**行動**：選項 A 或 B（見上文），明確寫下時間點

---

### Risk 3: 三個程式碼庫同時維護

**問題**：ceo-platform + ceo-monorepo + worktrees = 分散的努力

**行動**：這週做決策，下週執行清理

---

### Risk 4: 測試覆蓋率虛假

**問題**：164 個「安全測試」聲稱，但實際測試檔案極少

- 無 component 測試
- 無 integration 測試
- 無 happy path E2E 測試

**行動**：從「核心流程 E2E 測試」開始，目標 50% 覆蓋率

---

### Risk 5: AI 生成文件風險

**問題**：ClaudePlan.md / progress.md 由 AI 生成，可能有遺漏或幻覺

**行動**：讓人類團隊成員寫一份「部署運維指南」（從零開始），捕捉遺漏的步驟

---

## 🎯 決策已確認（2026-02-17）

✅ **代碼庫決策**：保留 `ceo-platform/`，從 `ceo-monorepo/` 複製安全功能
✅ **架構決策**：堅持 Next.js API Routes，V1.1 或 V2 時評估 Hono
✅ **部署決策**：代碼庫合併後立即開始 Staging 部署（2026-02-24）
✅ **發佈決策**：完成 staging 驗證後準備 App Store 上架

---

## 📅 完整時間表（最終版）

| Phase          | 名稱                    | 工時        | 預計完成       | 狀態         |
| -------------- | ----------------------- | ----------- | -------------- | ------------ |
| **Phase 1** 🚨 | 代碼庫合併（7 階段）    | 13-16h      | 2026-02-17     | **已完成**   |
| **Phase 2** ⭐ | 功能 + 品質修復         | 2-3w        | 2026-03-03     | **進行中**   |
| **Phase 3** 🟡 | Staging 部署 + 負荷測試 | 1-2w        | 2026-03-18     | Phase 2 後   |
| **Phase 4** 🟢 | 上架準備 + Beta         | 2-4w        | 2026-04-15     | Phase 3 後   |
| **總計**       |                         | **7-10 週** | **2026-04-15** | **進行中**   |

### 關鍵里程碑

- ✅ **2026-02-17**：代碼庫合併完成（單一源，11 個測試，安全強化）
- ✅ **2026-02-17**：Push 通知基礎設施完整實現（DeviceToken 模型、Expo Server SDK、API 端點、Mobile 整合）
- ⬜ **2026-03-03**：功能驗證完成（App 圖示、品質修復）
- ⬜ **2026-03-18**：Staging 負荷測試通過（100-1000 users）
- ⬜ **2026-04-01**：Beta 開始（TestFlight + Google Play）
- ⬜ **2026-04-15**：App Store 正式上架

---

## 📚 文件更新

本計劃應定期同步到：

- ✅ `claudePlanV2.md`（本文件）
- 📝 `progress.md`（每日更新）
- 🎯 GitHub Projects 看板（可視化進度）

---

## 最後的話

你建立了一個 **90% 完整的功能系統**。剩下的 10% 不是代碼，而是**信心**：

- 信心它能在生產環境運行（**本週執行代碼庫合併**）
- 信心 bug 會被及早發現（Phase 2：測試 + Error Boundary）
- 信心團隊能維護它（**單一代碼庫 = 一個源頭**）

## 執行清單（立即開始）

**本週（2026-02-17 ~ 2026-02-23）：代碼庫合併完成 + Phase 2 啟動**

```
✅ 代碼庫合併已完成（7 階段計劃完成）
⬜ 修復 4 個測試失敗（Email 服務測試）
⬜ 處理 156 個 linting 錯誤（81 錯誤，75 警告）
✅ 執行 Worktrees 清理（釋放 5.9GB）
✅ 最終提交 + 版本標籤
```

**Phase 2 優先任務（2026-02-17 ~ 2026-03-03）：功能與品質修復**

```
高優先級用戶要求：
1. ✅ Push 通知基礎設施配置（FCM/APNs）（已完成）
2. App 圖示資源生成（2-3h）

原有品質修復：
3. Alert → Toast 替換（1h）
4. Error Boundary 建立（2h）
5. 移除 33 個 any 型別（2-3h）
6. 安全頭 + CORS + CSRF 強化（2h）
7. ISR 策略實施（3-4h）
8. 測試覆蓋率提升至 70%+
```

**關鍵成果指標**

- ✅ 單一代碼庫（`ceo-platform/` 為唯一源）
- ✅ 11 個測試文件（189/193 通過，92%）
- ⬜ 釋放 5.9GB 磁盤空間（待清理）
- ✅ 新功能可用（Email、OAuth、Sentry）
- ✅ 生產構建成功（`pnpm build`）
- ✅ Push 通知基礎設施就緒（DeviceToken 模型、Expo Server SDK、API 端點、Mobile 整合、測試與文檔）
- ⬜ App 圖示資源生成完成

---

_此文件由 Claude (三專家團隊模式) 於 2026-02-17 生成，基於深入的代碼探索與決策驗證。_

_最後更新：2026-02-18 01:00（工作樹清理完成版）_
Ready to start Phase 2?

When you're ready, I can walk you through:

Day 1: Safety backup + Git tags (1 hour)
Day 2: Database schema migration (2 hours)
Days 3-4: Security features + test migration (6-10 hours)
Day 5: Verification & compile (2 hours)
Day 6: Worktrees cleanup (30 minutes) ✅
Day 7: Final commit (30 minutes) ✅

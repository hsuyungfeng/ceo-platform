# CEO 團購電商平台 v2 - 專案審查與改善計劃

> 審查日期：2026-02-11
> 審查工具：Claude Code (Opus 4.6)
> 審查範圍：專案結構、UI 品質、API 後端、行動應用、安全性

---

## 目錄

1. [專案概覽](#1-專案概覽)
2. [安全性問題（緊急）](#2-安全性問題緊急)
3. [UI 前端問題](#3-ui-前端問題)
4. [API 後端問題](#4-api-後端問題)
5. [行動應用問題](#5-行動應用問題)
6. [架構與技術債](#6-架構與技術債)
7. [改善計劃（依優先級排序）](#7-改善計劃依優先級排序)
8. [執行時間表](#8-執行時間表)

---

## 1. 專案概覽

### 技術堆疊
| 層級 | 技術 |
|------|------|
| 前端 Web | Next.js 15 (App Router) + React 19 + shadcn/ui + Tailwind CSS 4 |
| 行動端 | React Native (Expo SDK 54) + NativeWind + Expo Router |
| 後端 API | Next.js API Routes + Prisma 7+ |
| 資料庫 | PostgreSQL 16 |
| 認證 | NextAuth.js v5 (Credentials + Google OAuth + Apple Sign-In) |
| 狀態管理 | Zustand (Web + Mobile) |
| 部署 | Docker + Nginx + GitHub Actions CI/CD |
| Monorepo | Turborepo 2.4.4 + pnpm workspaces |

### 檔案統計
| 目錄 | .tsx 檔案 | .ts 檔案 | 說明 |
|------|----------|---------|------|
| `ceo-platform/src/` | 68 | 47 | 主要開發目錄 |
| `web/src/` | 33 | 21 | 舊版前端（已棄用？） |
| `HTML/` | - | - | 699 個檔案、138 個 PHP（舊版系統） |
| `.worktrees/phase6/` | - | - | Turborepo monorepo 結構 |
| `.worktrees/email-auth/` | - | - | Email 認證功能分支 |

### 已完成階段
- Phase 0-5：Web 平台（完成）
- Phase 6：行動端 + Monorepo（大部分完成）
- Phase 7：App Store 上架（待進行）

---

## 2. 安全性問題（緊急）

### 🔴 嚴重等級：Critical

#### 2.1 資料庫密碼硬編碼
- **檔案**：`ceo-platform/src/lib/prisma.ts`
- **問題**：資料庫連線字串直接寫在程式碼中作為 fallback
  ```typescript
  const databaseUrl = process.env.DATABASE_URL ||
    'postgresql://ceo_admin:SecureDevPass_2026!@localhost:5432/ceo_platform'
  ```
- **風險**：密碼洩漏至版本控制、任何能存取原始碼的人都可以取得資料庫存取權限
- **修復**：移除 fallback 值，改為在缺少環境變數時拋出錯誤

#### 2.2 .env.local 已提交至 Git
- **檔案**：`ceo-platform/.env.local`
- **問題**：包含敏感憑證的環境變數檔案已被 commit
- **風險**：所有 Git 歷史記錄中都存在明文密碼
- **修復**：
  1. 從 Git 歷史中移除（`git filter-branch` 或 BFG Repo-Cleaner）
  2. 更新 `.gitignore` 加入 `.env*` 規則
  3. 輪換所有已洩漏的密碼和 API 金鑰

#### 2.3 行動端 .env 已提交
- **檔案**：`.worktrees/phase6/ceo-monorepo/apps/mobile/.env`
- **內容**：`EXPO_PUBLIC_API_URL=http://localhost:3000`
- **修復**：加入 `.gitignore`，使用 `.env.example` 作為範本

#### 2.4 .gitignore 不完整
- **現況**：僅 12 bytes，嚴重不足
- **修復**：擴充為完整的 Node.js / Next.js / React Native 忽略規則，至少包含：
  ```
  node_modules/
  .env*
  .env.local
  .next/
  dist/
  build/
  *.log
  .DS_Store
  coverage/
  ```

### 🟡 嚴重等級：High

#### 2.5 健康檢查 API Token 驗證未完成
- **檔案**：`ceo-platform/src/app/api/health/route.ts`（POST 端點）
- **問題**：Token 驗證邏輯只有註解「// 驗證token邏輯...」，未實際實作
- **風險**：任何人都能透過 POST 請求觸發健康檢查

#### 2.6 Middleware 備份檔案暴露認證繞過風險
- **檔案**：`ceo-platform/src/middleware.ts.backup`
- **問題**：包含「allow all paths to be accessible」的註解，若被誤用將繞過所有認證
- **修復**：刪除 `.backup` 檔案，或加入 `.gitignore`

---

## 3. UI 前端問題

### 🔴 嚴重：Mock 資料未替換為真實 API

#### 3.1 商品詳情頁使用假資料
- **檔案**：`ceo-platform/src/app/products/[id]/page.tsx`
- **問題**：第 12 行定義了 `mockProduct` 物件，整頁使用假資料渲染
  ```typescript
  const mockProduct = { id: 1, name: '醫療口罩', ... }
  ```
- **影響**：使用者無法看到真實商品資訊
- **修復**：串接 `/api/products/[id]` API，使用 `useSWR` 或 `fetch` 載入真實資料

#### 3.2 購物車計數硬編碼
- **檔案**：`ceo-platform/src/components/layout/header.tsx`（第 13-14 行）
- **問題**：`cartItemCount` 為固定值，非從 API 或 Store 取得
- **修復**：接入 Zustand cart store 或 API 取得真實數量

#### 3.3 管理後台儀表板硬編碼百分比
- **檔案**：`ceo-platform/src/app/admin/page.tsx`
- **問題**：成長百分比為硬編碼值（+12%、+18%、+5%、+8%）
- **修復**：從 API 計算真實的週期對比成長率

### 🟡 UX 問題

#### 3.4 使用 alert() 而非 Toast
- **檔案**：`ceo-platform/src/app/products/[id]/page.tsx`（第 195 行）
- **問題**：加入購物車成功後使用 `alert()` 提示
- **修復**：改用 shadcn/ui 的 `toast` 元件，提供更好的使用者體驗

#### 3.5 登入頁面重導路徑錯誤
- **檔案**：`ceo-platform/src/app/login/page.tsx`
- **問題**：登入成功後重導向 `/(shop)` 路徑不正確
- **修復**：確認正確的路由群組路徑

#### 3.6 Footer 連結全部指向 #
- **檔案**：`ceo-platform/src/components/layout/footer.tsx`
- **問題**：所有底部連結的 `href` 都是 `#`，年份硬編碼為 2026
- **修復**：
  1. 連結指向真實頁面或移除不需要的連結
  2. 年份改為 `new Date().getFullYear()`

### 🟢 品質改善

#### 3.7 缺少無障礙標籤 (Accessibility)
- **影響範圍**：Header 圖示按鈕、表單元素、互動元素
- **修復**：加入 `aria-label`、`aria-describedby` 等屬性

#### 3.8 未使用 Next.js Image 元件
- **問題**：部分圖片使用原生 `<img>` 標籤
- **修復**：改用 `next/image` 以獲得自動最佳化（lazy loading、格式轉換、尺寸調整）

#### 3.9 缺少 Error Boundary
- **問題**：頁面錯誤會導致整個應用白屏
- **修復**：在關鍵頁面區段加入 React Error Boundary，搭配 Next.js `error.tsx`

#### 3.10 無國際化 (i18n) 支援
- **現況**：所有中文字串直接硬編碼在元件中
- **建議**：若未來需要多語言支援，考慮使用 `next-intl` 或 `react-i18next`
- **優先級**：低（目前為純中文平台，但預留擴充性）

---

## 4. API 後端問題

### 🟡 程式碼品質

#### 4.1 訂單編號產生可能有競態條件 (Race Condition)
- **檔案**：`ceo-platform/src/app/api/orders/route.ts`
- **問題**：使用 `count` 基底產生訂單編號，在高並發情況下可能重複
- **修復**：改用資料庫 sequence 或 UUID，或在 transaction 中使用 `SELECT ... FOR UPDATE`

#### 4.2 使用 `any` 型別
- **檔案**：`ceo-platform/src/app/api/orders/route.ts`
- **問題**：`const where: any = {}` 失去型別安全
- **修復**：使用 Prisma 產生的型別 `Prisma.OrderWhereInput`

### 🟢 正面發現

- Zod 驗證：API 輸入驗證完善，使用 Zod schema
- 錯誤處理：使用 try/catch 且回傳適當的 HTTP 狀態碼
- 日誌：使用 `console.error` 而非 `console.log`（但建議改用正式 logger）
- ORM：全程使用 Prisma，未發現 raw SQL 注入風險
- 無 `dangerouslySetInnerHTML` 使用（排除 node_modules）
- 無 `eval()` 使用

---

## 5. 行動應用問題

### 🟡 Mock 資料問題

#### 5.1 個人資料頁使用假資料
- **檔案**：`.worktrees/phase6/ceo-monorepo/apps/mobile/app/(tabs)/profile.tsx`
- **問題**：硬編碼使用者名稱「張小明」及其他假資料
- **修復**：串接 auth store 的真實使用者資料

#### 5.2 Store 未連接真實 API
- **檔案**：`.worktrees/phase6/ceo-monorepo/apps/mobile/stores/`
- **問題**：Zustand stores（cart、auth、preferences、products）部分仍使用本地假資料
- **修復**：整合 `@ceo/api-client` 套件，串接後端 API

### 🟢 正面發現

- 使用 Expo SDK 54 + React Native 0.81.5（版本新穎）
- NativeWind 樣式管理良好
- Zustand 狀態管理架構合理
- Expo Router 檔案式路由結構清晰

### 🟡 程式碼品質

#### 5.3 開發用 console.log 殘留
- **範圍**：hooks 目錄中的多個檔案
- **修復**：移除或替換為正式 logging 方案（如 Sentry）

---

## 6. 架構與技術債

### 6.1 多重程式碼副本
| 目錄 | 角色 | 狀態 |
|------|------|------|
| `ceo-platform/` | 主要開發目錄 | 活躍開發中 |
| `web/` | 舊版前端 | 似已棄用，但仍存在 |
| `HTML/` | 舊版 PHP 系統 | 遷移參考，699 檔案 |
| `.worktrees/phase6/` | Monorepo 分支 | 包含 mobile + shared packages |
| `.worktrees/email-auth/` | 功能分支 | Email 認證開發中 |

**問題**：不清楚哪個是「真正的 source of truth」，`ceo-platform/` 與 `.worktrees/phase6/ceo-monorepo/apps/web` 可能存在程式碼分歧。

**建議**：
1. 確定主開發目錄，合併 worktree 分支
2. 清理或歸檔不再使用的目錄（`web/`、`HTML/`）
3. 文件化目錄用途與開發流程

### 6.2 缺少正式日誌系統
- **現況**：使用 `console.error` / `console.log`
- **建議**：導入 `pino` 或 `winston`，設定日誌等級與結構化日誌

### 6.3 缺少測試
- **現況**：未發現測試檔案（`*.test.ts`、`*.spec.ts`）
- **建議**：
  1. 單元測試：Vitest（API routes、工具函數）
  2. 元件測試：React Testing Library
  3. E2E 測試：Playwright（關鍵使用者流程）
  4. 行動端測試：Detox 或 Maestro

### 6.4 缺少 CI/CD 品質把關
- **建議**：
  1. Pre-commit hooks（husky + lint-staged）
  2. GitHub Actions：lint、type check、test
  3. 自動化安全掃描（Snyk 或 GitHub Dependabot）

---

## 7. 改善計劃（依優先級排序）

### 第一優先：安全修復（立即執行）

| # | 任務 | 預計影響 | 複雜度 |
|---|------|---------|--------|
| S1 | 從 `prisma.ts` 移除硬編碼密碼，改為 env 缺失時拋出錯誤 | Critical | 低 |
| S2 | 使用 BFG 從 Git 歷史清除 `.env.local` | Critical | 中 |
| S3 | 輪換所有已洩漏的密碼（DB、OAuth secrets） | Critical | 中 |
| S4 | 更新 `.gitignore` 為完整版本 | High | 低 |
| S5 | 完成 health API 的 token 驗證 | High | 低 |
| S6 | 刪除 `middleware.ts.backup` | High | 低 |
| S7 | 從 Git 移除 mobile `.env` 檔案 | Medium | 低 |

### 第二優先：核心功能修復

| # | 任務 | 預計影響 | 複雜度 |
|---|------|---------|--------|
| F1 | 商品詳情頁串接真實 API（移除 mockProduct） | Critical | 中 |
| F2 | Header 購物車計數串接 Zustand store | High | 低 |
| F3 | 將 `alert()` 替換為 Toast 元件 | Medium | 低 |
| F4 | 修正登入頁面重導路徑 | Medium | 低 |
| F5 | 管理後台儀表板百分比改為真實計算 | Medium | 中 |
| F6 | Footer 連結修復 | Low | 低 |

### 第三優先：行動端完善

| # | 任務 | 預計影響 | 複雜度 |
|---|------|---------|--------|
| M1 | Profile 頁面串接真實使用者資料 | High | 中 |
| M2 | 所有 Zustand stores 串接後端 API | High | 高 |
| M3 | 移除開發用 console.log | Low | 低 |

### 第四優先：程式碼品質提升

| # | 任務 | 預計影響 | 複雜度 |
|---|------|---------|--------|
| Q1 | 訂單編號改用 DB sequence 避免競態條件 | High | 中 |
| Q2 | 移除 `any` 型別，使用 Prisma 產生的型別 | Medium | 低 |
| Q3 | 加入 React Error Boundary + error.tsx | Medium | 中 |
| Q4 | 圖片改用 `next/image` 元件 | Medium | 低 |
| Q5 | 加入基礎無障礙標籤 | Medium | 中 |
| Q6 | 導入正式 logger（pino） | Low | 中 |

### 第五優先：架構改善

| # | 任務 | 預計影響 | 複雜度 |
|---|------|---------|--------|
| A1 | 合併 worktree 分支，確定主開發目錄 | High | 高 |
| A2 | 清理/歸檔舊版目錄（web/、HTML/） | Medium | 低 |
| A3 | 建立 Vitest 測試框架 + 核心 API 測試 | High | 高 |
| A4 | 設定 husky + lint-staged pre-commit hooks | Medium | 低 |
| A5 | 設定 GitHub Actions CI pipeline | Medium | 中 |
| A6 | 導入 Dependabot 安全掃描 | Medium | 低 |

---

## 8. 執行時間表

### Week 1：安全修復 + 緊急功能
- [S1-S7] 所有安全修復
- [F1] 商品詳情頁 API 串接
- [F2] 購物車計數修復

### Week 2：前端功能完善
- [F3-F6] 所有前端功能修復
- [Q3] Error Boundary 建立
- [Q4] next/image 導入

### Week 3：行動端 + 品質
- [M1-M3] 行動端修復
- [Q1-Q2] 後端程式碼品質
- [Q5-Q6] 無障礙 + Logger

### Week 4：架構整理
- [A1-A2] 目錄整理與合併
- [A3] 測試框架建立
- [A4-A6] CI/CD 設定

---

## 附錄：審查方法

本次審查使用 5 個平行探索代理進行：

1. **專案結構探索**：掃描所有目錄、檔案類型、計數統計
2. **API 後端審查**：檢查路由、驗證、錯誤處理、SQL 注入風險
3. **UI 元件審查**：檢查前端頁面、mock 資料、UX 問題
4. **行動應用審查**：檢查 Expo 設定、Store、元件品質
5. **安全性審查**：檢查敏感資訊洩漏、認證繞過、XSS/注入風險

---

*此文件由 Claude Code (Opus 4.6) 自動產生，基於原始碼靜態分析。建議搭配人工審查確認優先級與執行細節。*

---

## 9. 下一階段開發與部署規劃（2026-02-11 更新）

### 背景：架構改善完成

在前一輪改善中已完成 **6 項基礎架構改善**，當前專案狀態：

| 項目 | 狀態 | 詳情 |
|------|------|------|
| 日誌系統 | ✅ 完成 | Pino 結構化日誌，32 個 API 檔案已遷移 |
| 單元測試 | ✅ 完成 | Vitest + RTL，15 個測試全部通過 |
| CI/CD 自動化 | ✅ 完成 | GitHub Actions 已啟用測試 |
| Pre-commit Hooks | ✅ 完成 | Husky + lint-staged 已配置 |
| .gitignore 擴充 | ✅ 完成 | 從 1 行擴充至 46 行規則 |
| 查詢參數驗證 | ✅ 完成 | Zod schema 已修復（null → undefined） |
| 檔案清理 | ✅ 完成 | 刪除 web/、歸檔 HTML/DB/、節省 ~2.2 GB |

### Phase 8：安全性強化與合規（預計 2-3 周）

#### 8.1 立即執行的安全修復

| 優先級 | 項目 | 狀態 | 預計工時 |
|--------|------|------|---------|
| Critical | 移除 prisma.ts 硬編碼密碼 | 待執行 | 1 小時 |
| Critical | 從 Git 歷史清除 .env.local | 待執行 | 2-3 小時 |
| Critical | 輪換已洩漏密碼 (DB、OAuth) | 待執行 | 1-2 小時 |
| High | 實作 health API token 驗證 | 待執行 | 1 小時 |
| High | 添加 CORS 與 CSRF 防護 | 待執行 | 2 小時 |
| High | 啟用 HTTPS 與 HSTS 頭 | 待執行 | 1 小時 |

**具體行動**：
```bash
# 1. 修復 prisma.ts：移除 fallback 密碼，缺失 env 時拋出錯誤
# 2. 使用 BFG 清除 git 歷史：
bfg --delete-files .env.local
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# 3. 在 middleware.ts 中添加：
- CORS 驗證
- CSRF token 檢查
- CSP (Content Security Policy) 頭
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security

# 4. health API 完成 token 驗證邏輯
# 5. 環境變數輪換清單（需手動執行）
```

#### 8.2 認證系統強化

| 項目 | 預計工時 | 複雜度 | 狀態 |
|------|---------|--------|------|
| 實作 JWT 刷新機制 | 2 小時 | 中 | 進行中 |
| 添加速率限制 (Rate Limiting) | 2 小時 | 中 | 待執行 |
| 實作 MFA (多因素認證) | 4-6 小時 | 高 | 待執行 |
| 添加會話超時管理 | 2 小時 | 中 | 待執行 |
| 實作登出後清除 token | 1 小時 | 低 | 待執行 |

**實施方案**：
```typescript
// JWT 刷新端點
POST /api/auth/refresh
- 檢查過期令牌（寬限期 7 天）
- 驗證簽名與用戶狀態
- 發放新 token（30 天有效期）

// 速率限制
使用 redis-based rate limiter
- 登入：5 次/15 分鐘
- API：100 次/分鐘 (登入用戶)

// MFA（後續計劃）
- 短信 OTP (Twilio/Vonage)
- TOTP (Google Authenticator)
- 備用碼
```

---

### Phase 9：功能完善與測試覆蓋（預計 3-4 周）

#### 9.1 前端功能修復

| # | 項目 | 預計工時 | 複雜度 | 狀態 |
|---|------|---------|--------|------|
| F1 | 商品詳情頁 API 串接 | 2 小時 | 中 | 待執行 |
| F2 | Header 購物車計數 Zustand 整合 | 1 小時 | 低 | 待執行 |
| F3 | Alert → Toast 元件替換 | 1 小時 | 低 | 待執行 |
| F4 | 登入重導路徑修正 | 30 分鐘 | 低 | 待執行 |
| F5 | 儀表板真實數據計算 | 2 小時 | 中 | 待執行 |
| F6 | Footer 連結與年份修復 | 30 分鐘 | 低 | 待執行 |

**詳細實施**：
```typescript
// F1: 商品詳情頁 API 串接
import { useSWR } from 'swr'
const { data: product, isLoading } = useSWR(
  `/api/products/${id}`,
  fetcher,
  { revalidateOnFocus: false }
)

// F2: 購物車計數整合
import { useCartStore } from '@/stores/useCartStore'
const itemCount = useCartStore((state) => state.items.length)

// F3: Toast 替換
import { toast } from 'sonner'
toast.success('已加入購物車')

// F5: 儀表板真實數據
const dashboardMetrics = await fetchDashboardData()
// 計算同期對比成長率
const growthRate = ((current - previous) / previous) * 100
```

#### 9.2 代碼品質提升

| # | 項目 | 預計工時 | 複雜度 | 狀態 |
|---|------|---------|--------|------|
| Q1 | 訂單編號改用 DB sequence | 2 小時 | 中 | 待執行 |
| Q2 | 移除 any 型別 | 2 小時 | 低 | 待執行 |
| Q3 | Error Boundary + error.tsx | 2 小時 | 中 | 待執行 |
| Q4 | 圖片改用 next/image | 1.5 小時 | 低 | 待執行 |
| Q5 | 無障礙標籤 (a11y) | 2 小時 | 中 | 待執行 |

**實施細節**：
```typescript
// Q1: 訂單編號 race condition 修復
// 改用 Prisma sequence 或 UUID
const orderNumber = crypto.randomUUID().slice(0, 12).toUpperCase()
// 或在資料庫層面使用 serial type

// Q3: Error Boundary 整合
// 在 app/layout.tsx 添加
<ErrorBoundary>
  <RootLayout {...props} />
</ErrorBoundary>

// 在 app/(shop)/page.tsx 添加
export const ErrorComponent = ({ error, reset }) => {
  return <ErrorPage error={error} onReset={reset} />
}

// Q5: 無障礙標籤
<button aria-label="打開購物車">
  <CartIcon />
</button>
```

#### 9.3 測試覆蓋率目標

**當前狀態**：15 個測試（3 個測試檔案）

**目標**：至少 50% 代碼覆蓋率

| 範圍 | 目標 | 預計測試數 | 預計工時 |
|------|------|----------|---------|
| API Routes | 80% | 20-25 個測試 | 8-10 小時 |
| 工具函數 | 80% | 10-15 個測試 | 4-5 小時 |
| React 元件 | 40% | 15-20 個測試 | 6-8 小時 |
| **總計** | **50%** | **45-60 個測試** | **18-23 小時** |

**測試優先級**：
1. ✅ API 認證端點（已有基礎）
2. ⭐ 購物車邏輯（高風險）
3. ⭐ 訂單建立與結算（高風險）
4. 商品搜尋與篩選
5. 用戶管理 API
6. 核心工具函數

---

### Phase 10：行動端完善（預計 2-3 周）

#### 10.1 Store 與 API 整合

| 項目 | 狀態 | 預計工時 | 複雜度 |
|------|------|---------|--------|
| useAuthStore → 真實 API | 待執行 | 2 小時 | 中 |
| useCartStore → 真實 API | 待執行 | 2 小時 | 中 |
| useProductStore → 分頁 API | 待執行 | 2.5 小時 | 中 |
| 個人檔案頁 API 串接 | 待執行 | 1.5 小時 | 低 |
| 移除 console.log | 待執行 | 1 小時 | 低 |

**實施模式**：
```typescript
// 使用 @ceo/api-client 封裝
import { apiClient } from '@ceo/api-client'

// Store 修改示例
const useAuthStore = create((set) => ({
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password })
    set({ user: response.user, token: response.token })
  },
  logout: async () => {
    await apiClient.post('/auth/logout')
    set({ user: null, token: null })
  }
}))
```

#### 10.2 行動端測試

| 項目 | 預計工時 | 複雜度 | 狀態 |
|------|---------|--------|------|
| 設定 Detox E2E 測試 | 2 小時 | 中 | 待執行 |
| 登入流程 E2E | 1 小時 | 低 | 待執行 |
| 購物車流程 E2E | 2 小時 | 中 | 待執行 |
| 訂單建立 E2E | 2 小時 | 中 | 待執行 |

---

### Phase 11：分支合併決策（待決定）

#### 11.1 Phase 6 Worktree 評估

**現狀**：
- `.worktrees/phase6/` - 19 個未合併提交
- 包含：Monorepo、Mobile App、Email 驗證、Apple Sign-In
- 大小：~5.8 GB

**決策矩陣**：

| 工作項 | 完成度 | 合併價值 | 風險 | 建議 |
|--------|--------|---------|------|------|
| Monorepo 結構 | ~90% | 高 | 低 | ✅ 建議合併 |
| Mobile App 基礎 | ~95% | 高 | 低 | ✅ 建議合併 |
| Email 驗證 | ~70% | 中 | 中 | ⚠️ 需完成後合併 |
| Apple Sign-In | ~95% | 高 | 低 | ✅ 建議合併 |

**合併計劃**：
```bash
# 1. 檢查 phase6 分支狀態
git worktree list
git log --oneline main..(.worktrees/phase6/feature/phase6-mobile-app) | wc -l

# 2. 檢查衝突
git merge --no-commit --no-ff (.worktrees/phase6/feature/phase6-mobile-app)

# 3. 運行測試
cd ceo-platform && pnpm test

# 4. 若無衝突，提交合併 PR
git merge (.worktrees/phase6/feature/phase6-mobile-app)

# 5. 刪除 worktree（合併後）
git worktree remove .worktrees/phase6
```

#### 11.2 郵件驗證分支

**狀態**：`.worktrees/email-auth/`

**評估清單**：
- [ ] 郵件發送邏輯完整？
- [ ] Token 驗證過期處理？
- [ ] Resend.com API 整合完成？
- [ ] 錯誤處理覆蓋所有邊界情況？
- [ ] 單元測試通過？

**完成標準**：
- 實作 POST `/api/auth/verify-email`
- 實作 POST `/api/auth/resend-email`
- 完整的 Zod 驗證
- 錯誤回應格式統一
- 速率限制（防止濫用）

---

### Phase 12：生產環境部署（預計 1-2 周）

#### 12.1 部署前檢查清單

**代碼品質**：
- [ ] 所有 ESLint 警告已解決
- [ ] TypeScript 編譯無誤
- [ ] 測試通過率 ≥ 95%
- [ ] 代碼覆蓋率 ≥ 50%
- [ ] 無 console.log / console.error（僅 logger）

**安全性**：
- [ ] 環境變數已從代碼移除
- [ ] 敏感密碼已輪換
- [ ] CORS 與 CSRF 防護已啟用
- [ ] 認證端點已通過安全測試
- [ ] SQL 注入風險已排除

**基礎設施**：
- [ ] Docker 映像已構建與測試
- [ ] docker-compose 已驗證
- [ ] 資料庫遷移已測試
- [ ] 環境變數檔案已配置
- [ ] nginx 反向代理已設定

**監控與日誌**：
- [ ] Pino 日誌已配置（JSON 輸出）
- [ ] 日誌聚合方案已選擇（ELK / DataDog / 等）
- [ ] 應用監控已設定（APM）
- [ ] 告警規則已配置
- [ ] 備份策略已實施

**功能驗證**：
- [ ] 所有核心用戶流程已測試
- [ ] 支付流程驗證（若適用）
- [ ] 郵件發送正常
- [ ] 第三方 OAuth 整合驗證
- [ ] 行動應用 API 可達性測試

#### 12.2 部署步驟

**第 1 天：預發布環境**
```bash
# 1. 構建與推送 Docker 映像
docker build -t ceo-platform:latest .
docker push registry.example.com/ceo-platform:latest

# 2. 在預發布環境部署
docker-compose -f docker-compose.prod.yml up -d

# 3. 運行煙霧測試
npm run test:smoke

# 4. 驗證關鍵功能
# - 登入/註冊
# - 商品瀏覽
# - 購物車
# - 訂單建立
# - 行動應用連接
```

**第 2 天：生產環境金絲雀部署**
```bash
# 1. 10% 流量切換至新版本
kubectl set image deployment/ceo-platform \
  ceo-platform=registry.example.com/ceo-platform:latest \
  --record

# 2. 監控錯誤率、延遲、資源使用
# 預期：錯誤率 < 0.1%，P95 延遲 < 500ms

# 3. 漸進式增加流量（25% → 50% → 100%）
# 每個階段等待 15-30 分鐘，觀察指標

# 4. 若無問題，完成部署
# 若發現問題，立即回滾
kubectl rollout undo deployment/ceo-platform
```

#### 12.3 部署後驗證

**即時監控（部署後 1 小時）**：
```bash
# 檢查應用日誌
kubectl logs -f deployment/ceo-platform --tail=100

# 檢查性能指標
curl https://api.example.com/health

# 檢查資料庫連線
SELECT version();
```

**功能驗證（部署後 2-4 小時）**：
- [ ] Web 應用可正常訪問
- [ ] API 端點回應正常
- [ ] 行動應用可連接
- [ ] 郵件發送正常
- [ ] 無異常錯誤率上升

**性能基準測試**：
```bash
# 使用 Apache Bench 或 k6
ab -n 1000 -c 100 https://api.example.com/api/products

# 預期結果
# - 平均回應時間 < 200ms
# - P95 < 500ms
# - 成功率 > 99.9%
```

---

### Phase 13：上架到 App Store / Google Play（預計 2-4 周）

#### 13.1 前置準備

| 項目 | 預計工時 | 複雜度 | 狀態 |
|------|---------|--------|------|
| 申請 Apple Developer 帳號 | 1-2 小時 | 低 | 待執行 |
| 申請 Google Play Developer 帳號 | 1 小時 | 低 | 待執行 |
| 編譯簽名的 IPA (iOS) | 2 小時 | 中 | 待執行 |
| 編譯簽名的 APK (Android) | 1.5 小時 | 中 | 待執行 |
| 配置深層連結 (Deep Links) | 2 小時 | 中 | 待執行 |

**詳細步驟**：
```bash
# iOS 構建（使用 EAS Build）
eas build --platform ios --auto-submit

# Android 構建
eas build --platform android

# 本地簽名（可選）
cd mobile && ./build-signed-apk.sh
```

#### 13.2 應用商店上架

**Apple App Store**：
- 應用名稱：CEO 團購平台
- 類別：購物
- 隱私政策：已準備
- 應用截圖：需設計（5 張）
- 描述文字：需編寫
- 審查時間：3-5 天
- 費用：99 USD/年

**Google Play Store**：
- 應用名稱：CEO 團購平台
- 類別：購物
- 隱私政策：已準備
- 應用截圖：需設計（8 張）
- 描述文字：需編寫
- 審查時間：1-2 天
- 費用：25 USD（一次性）

#### 13.3 上架清單

```bash
審查提交前驗證：
- [ ] 應用版本 ≥ 1.0.0
- [ ] 所有必填欄位已完成
- [ ] 應用圖標正確（不同尺寸）
- [ ] 隱私政策有效且可訪問
- [ ] 應用未包含硬編碼密鑰
- [ ] 使用者服務條款已準備
- [ ] 年齡分級問卷已完成
- [ ] 內容政策已審查
```

---

### 時間表總結

| Phase | 名稱 | 預計工時 | 目標完成 | 狀態 |
|-------|------|---------|---------|------|
| 8 | 安全性強化 | 10-15 小時 | 2026-02-18 | 計劃中 |
| 9 | 功能完善 + 測試 | 30-35 小時 | 2026-03-04 | 計劃中 |
| 10 | 行動端完善 | 15-20 小時 | 2026-03-11 | 計劃中 |
| 11 | 分支合併 | 5-10 小時 | 2026-03-13 | 待決定 |
| 12 | 生產環境部署 | 8-12 小時 | 2026-03-18 | 計劃中 |
| 13 | App Store 上架 | 20-30 小時 | 2026-04-01 | 計劃中 |
| **總計** | | **88-122 小時** | **2026-04-01** | **進行中** |

---

### 資源與工具清單

**必要工具**：
- [ ] Apple Developer 帳號（99 USD/年）
- [ ] Google Play Developer 帳號（25 USD）
- [ ] Sentry（錯誤追蹤，可選）
- [ ] DataDog 或 New Relic（監控，可選）
- [ ] Figma（設計應用截圖）
- [ ] 翻譯工具（若支援多語言）

**文檔準備**：
- [ ] 隱私政策文檔
- [ ] 用戶服務條款
- [ ] FAQ 文檔
- [ ] 部署運維指南
- [ ] API 文檔（開發者參考）

**測試工具**：
- [ ] TestFlight（iOS 內測）
- [ ] Google Play 內部測試（Android 內測）
- [ ] Sentry（生產環境錯誤監控）
- [ ] LogRocket（前端會話記錄，可選）

---

### 後續決策點

**立即需決定**：
1. 🔴 是否合併 Phase 6 worktree（影響：+5.8 GB 磁碟 vs. 統一 Monorepo）
2. 🔴 郵件驗證完成度評估（可否在 2026-02-25 前完成）
3. 🟡 MFA 實作時機（Phase 9 或 Phase 8）
4. 🟡 應用監控方案選擇（Sentry vs. DataDog vs. 自建）

**關鍵風險**：
- ⚠️ 分支合併衝突（若代碼分歧過大）
- ⚠️ 安全修復時間（Git 歷史清理耗時）
- ⚠️ 應用商店審查被拒（需備選方案）

---

*本計劃由 Claude (Opus 4.6) 於 2026-02-11 生成，基於已完成的 6 項架構改善與當前專案狀態。建議每週審查進度，必要時調整工時估計。*

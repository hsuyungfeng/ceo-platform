# 每日進度 (Daily Progress)

## 2026-02-28 (Phase 1 - 開始執行)

### 今日目標 (Today's Goals)
- ✅ 完成檔案結構重組 (主文件在根目錄，支持文件在 /doc)
- ✅ 執行 Priority #1, #2, #3 初步檢查
- 📋 開始 Phase 1: 準備與清理

### 進度 (Progress - Phase 1 執行)
✅ **已完成**：
- ✅ 檔案結構重組完成（Gem3Plan.md, DailyProgress.md, README_ANALYSIS.md 在根目錄）
- ✅ 在 /doc 建立了符號連結指向主文件
- ✅ Priority #2: Prisma 幽靈依賴已修復 (@prisma/client v7.3.0, prisma v7.3.0 已安裝)
- ✅ Priority #3: PocketBase 環境已驗證
  - pocketbase.ts 存在且初始化正確
  - NEXT_PUBLIC_POCKETBASE_URL 已設定為 http://127.0.0.1:8090
  - ✅ .env.local 已建立（包含 RESEND_API_KEY）
  - ✅ npx prisma generate 執行成功
  - ✅ npm run build 可執行（有警告，需修復）
- **召集三人專家團隊進行多角度分析**：
  - **UX/產品視角 (Agent 1)**：評估當前 UI/UX，識別可簡化的複雜功能
    - 發現：首頁、產品列表、產品詳情和管理儀表板包含大量 B2C 團購功能
    - 簡化機會：移除搜尋、分層定價、進度條、倒計時、評分系統
    - 預計代碼減少：30-40% 前端 + 20-30% 管理元件

  - **技術架構視角 (Agent 2)**：評估資料庫遷移和系統設計
    - 發現：混合資料庫狀態，41 個 Prisma 路由 + 6 個 PocketBase 路由
    - 風險：認證層 (NextAuth + Prisma vs. PocketBase) 不匹配
    - 機會：逐步遷移，已有 6 個路由成功使用 PocketBase 作為概念證明

  - **反對立場視角 (Agent 3)**：識別隱藏的複雜性和風險
    - 警告：月結系統、點數系統、發票合規、支付流程比預期複雜
    - 關鍵風險：Prisma 幽靈依賴、認證層重構、零停機切換
    - 問題：當前無月結實現，需要新建工作流

### 綜合分析結果 (Synthesis)
✅ **技術可行性**：**高 (8/10)**
- 已有混合實施，6 個路由已使用 PocketBase 證明可行
- 41 個 Prisma 路由可逐步遷移，風險可控

⚠️ **複雜性評估**：
- **高複雜度**：認證層 (NextAuth + Prisma + 自訂 JWT) → 需要仔細整合
- **高複雜度**：月結實現 (當前無此系統) → 需要新建發票流程
- **高複雜度**：零停機切換 → 需要並行運行策略

✅ **簡化潛力**：**顯著**
- UX 簡化可減少 30-40% 前端代碼
- 移除搜尋、分層定價、團購機制主要複雜性來源
- 管理儀表板可從 9 個部分簡化至 3 個卡片

### 更新的實施規劃 (Updated Implementation Plan)
已將三個代理的分析整合至更新的 `Gem3Plan.md`，包括：

1. **階段化方案**（6 個階段，13-20 週）
   - 第 1 階段：準備與清理 (1-2 週)
   - 第 2 階段：資料庫遷移 (4-6 週) ← 最長，最複雜
   - 第 3 階段：UX 簡化 (3-4 週) ← 高影響，中等複雜度
   - 第 4 階段：支付重構 (2-3 週) ← 新系統 (月結)
   - 第 5 階段：測試驗證 (2-3 週)
   - 第 6 階段：上線交接 (1-2 週)

2. **已識別的關鍵檔案**（必須優先處理）
   - `/src/auth.ts` - 認證核心
   - `/src/lib/auth-helper.ts` - 41 個路由的依賴
   - `/prisma/schema.prisma` - 20+ 模型定義
   - `/api/admin/products/route.ts` - 最複雜的事務操作
   - `/api/admin/users/route.ts` - 複雜查詢代表

3. **已知風險與緩解**
   - 高風險：認證層複雜、月結實現、零停機切換
   - 中等風險：PocketBase 效能、複雜查詢遷移、資料完整性
   - 低風險：代碼清理、UX 衝擊

### 下一步要做什麼 (Next to Do)
⏳ **本週進行中**：
- [ ] **Priority #1: 與業務/PM 會面** (本週)
  - 需要確認月結需求詳情（發票頻率、逾期政策、點數兌換率）
  - 驗證員工數量和交易量 (用於效能規劃)
  - 確認當前使用的支付方式 (是否真的只需 cash/monthly/points)
  - 確認搜尋功能是否有被使用

- [x] ✅ **Priority #2: 解決 Prisma 幽靈依賴** (本週)
  - [x] ✅ 添加 @prisma/client v7.3.0
  - [x] ✅ npx prisma generate 執行成功

- [x] ✅ **Priority #3: 驗證 PocketBase 環境** (本週)
  - [x] ✅ 建立 .env.local
  - [x] ✅ npm run build 可執行

- 🔥 **Phase 2.3: 認證層整合** (進行中 - 100% 代碼實現，待測試驗證)
  - [x] ✅ 分析現有認證架構
  - [x] ✅ 建立 `/src/lib/pocketbase-auth.ts` (20+ 個函數)
  - [x] ✅ 遷移 `/src/auth.ts` (Credentials + Google + Apple OAuth)
  - [x] ✅ 遷移 `/src/lib/auth-helper.ts` (Bearer Token + Session 驗證)
  - ⏳ **測試計劃**：建立於下方

---

## Phase 2.3 測試驗證計劃 (Authentication Testing Plan)

### 🧪 測試覆蓋範圍

#### 1. 認證流程單元測試
**Credentials 登入 (稅號 + 密碼)**
```typescript
// 測試場景：
✅ 有效稅號 + 正確密碼 → 成功登入
❌ 無效稅號 → 返回 null
❌ 有效稅號 + 錯誤密碼 → 返回 null
❌ 帳號狀態為 INACTIVE → 返回 null
```

**Bearer Token 驗證 (移動應用 JWT)**
```typescript
// 測試場景：
✅ 有效 JWT Token → 返回用戶信息
❌ 過期 Token → 返回 null
❌ 無效簽名 → 返回 null
❌ 缺少 user ID → 返回 null
❌ 用戶已刪除 → 返回 null
```

**Session 驗證 (Web 應用 NextAuth)**
```typescript
// 測試場景：
✅ 有效 Session → 返回用戶信息
❌ 無效 Session → 返回 null
❌ 用戶不存在 → 返回 null
❌ 帳號已停用 → 返回 null
```

#### 2. OAuth 流程集成測試
**Google OAuth**
```typescript
// 測試場景：
✅ 首次 Google 登入（新用戶）→ 重定向至註冊頁面
✅ 既有 Google 帳戶連結 → 直接登入，更新令牌
✅ Google OAuth 帳戶連結至現有用戶 → 成功連結
```

**Apple OAuth**
```typescript
// 測試場景與 Google 相同
```

#### 3. Token 刷新與寬限期
```typescript
// 測試場景：
✅ 有效 Token → 刷新成功
✅ 已過期但在 7 天寬限期內 → 刷新成功
❌ 超過寬限期（7+ 天）→ 刷新失敗
❌ Token 超過 60 天最大年限 → 拒絕
```

### 📋 完整端點驗證清單

**已受保護的 API 端點** (需驗證仍可工作)：
- [ ] `GET /api/user/profile` - 需有效 Session
- [ ] `POST /api/cart/add` - 需有效 Bearer Token 或 Session
- [ ] `POST /api/orders` - 需有效 Session
- [ ] `GET /api/admin/users` - 需 ADMIN 角色
- [ ] `GET /api/admin/orders` - 需 ADMIN 角色

**Public 端點** (應無認證要求)：
- [ ] `GET /api/products` - 無認證需求
- [ ] `GET /api/categories` - 無認證需求
- [ ] `POST /auth/signin` - 無先前認證需求

### ✅ 代碼完成度檢查清單

- [x] ✅ `pocketbase-auth.ts` - 20+ 函數已實現
  - [x] findUserByTaxId() - Credentials 登入
  - [x] findUserByEmail() - OAuth 用戶查詢
  - [x] findUserById() - Bearer Token 驗證
  - [x] findOAuthAccount() - OAuth 帳戶查詢
  - [x] createOAuthAccount() - OAuth 帳戶創建
  - [x] updateOAuthAccount() - OAuth 帳戶更新
  - [x] createTempOAuth() - 臨時註冊數據
  - [x] getTempOAuth() - 取得臨時數據
  - [x] deleteTempOAuth() - 清理過期數據
  - [x] verifyPassword() - 密碼驗證
  - [x] createUser() - 用戶創建
  - [x] updateUser() - 用戶更新
  - [x] isUserActive() - 狀態檢查

- [x] ✅ `/src/auth.ts` - 所有 Prisma 查詢已替換
  - [x] Credentials 提供者 (line 80)
  - [x] Google OAuth (lines 128-235)
  - [x] Apple OAuth (lines 242-349)

- [x] ✅ `/src/lib/auth-helper.ts` - 所有用戶查詢已替換
  - [x] validateBearerToken() (line 67)
  - [x] validateSession() (line 108)
  - [x] validateTokenForRefresh() (line 240)

### 🚀 下一步行動
⏳ **本週待做**：
- [ ] 啟動 PocketBase 本機實例 (`npm run dev` 並驗證 http://127.0.0.1:8090)
- [ ] 驗證 PocketBase users 集合已建立
- [ ] 執行簡單的集成測試（登入流程）
- [ ] 修復任何 PocketBase 連接問題
- [ ] 測試 Bearer Token 流程（移動應用模擬）

⏳ **下週計劃**：
- [ ] 完整的 OAuth 流程測試（需 Google/Apple 開發憑證）
- [ ] Edge case 測試（過期 Token、並發登入等）
- [ ] 開始 Phase 2.4: 逐路由遷移

---

## 2026-02-28 (Initial)

### 今日目標 (Today's Goals)
- 審查專案，移動舊文件，建立規劃，並準備向 PocketBase 轉移

### 進度 (Progress)
- 已將舊的 `.md` 計劃和報告移至 `doc/` 資料夾
- 建立了 `Gem3Plan.md` 和 `DailyProgress.md`
- 開始分析 `apps/web` 結構，尋找不必要的文件並準備移除 Prisma

### 下一步要做什麼 (Next to Do)
- 找出並刪除 monorepo 中不必要的文件/資料夾
- 執行 Prisma 的移除，安裝 PocketBase，並轉換資料庫邏輯

---

## 進行中的任務 (In-Progress)

### 第一階段：準備與清理 (Phase 1: Preparation & Cleanup)
- [x] 移動舊文件至 `doc/`
- [x] 建立規劃檔案 (Gem3Plan, DailyProgress)
- [ ] 解決 Prisma 幽靈依賴
- [ ] 驗證 PocketBase 環境設定
- [ ] 刪除備份檔案 (DB, HTML legacy backups)
- [ ] 業務需求驗證 (月結、點數、支付方式)

---

## 進度指標 (Progress Metrics)

### 當前狀態
| 指標 | 值 |
|------|-----|
| 計劃完整性 | 100% |
| 技術可行性評估 | 完成 |
| 風險識別 | 完成 |
| 實施時程制定 | 完成 |
| 關鍵檔案識別 | 完成 |

### 預期成果
| 里程碑 | 預計完成日期 |
|--------|----------|
| 準備與清理 | 2026-03-14 |
| 資料庫遷移 | 2026-04-25 |
| UX 簡化 | 2026-05-23 |
| 支付重構 | 2026-06-13 |
| 測試驗證 | 2026-06-27 |
| **上線** | **2026-07-11** |

---

**最後更新**：2026-02-28 14:00
**狀態**：規劃完成，準備進入第 1 階段

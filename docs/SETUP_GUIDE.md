# CEO Platform 建置指南

> 本指南對應 **Gem3Plan.md** 的技術架構，逐步帶你從零建置開發環境。

---

## 📁 專案結構總覽

```
ceo-platform/                          ← 根目錄（規劃文件在此）
├── Gem3Plan.md                        ← 架構計畫
├── DailyProgress.md                   ← 每日進度
├── SETUP_GUIDE.md                     ← 本文件
├── doc/                               ← 舊版備份文件
├── docs/                              ← 部署與測試文件
├── scripts/                           ← 工具腳本
└── ceo-monorepo/                      ← Monorepo 主體
    ├── package.json                   ← pnpm workspace 設定
    ├── pnpm-workspace.yaml
    ├── turbo.json                      ← Turborepo 設定
    └── apps/
        └── web/                       ← Next.js 主應用
            ├── package.json
            ├── next.config.ts
            ├── tailwind.config.ts
            ├── prisma/
            │   ├── schema.prisma      ← 資料庫模型定義
            │   └── migrations/        ← 遷移歷史
            ├── src/
            │   ├── app/               ← Next.js App Router 頁面
            │   │   ├── (auth)/        ← 登入、註冊等認證頁
            │   │   ├── admin/         ← 管理後台頁面
            │   │   ├── invoices/      ← 月結發票頁面
            │   │   ├── api/           ← API 路由 (41+ 個端點)
            │   │   └── ...
            │   ├── components/        ← 共用 UI 元件
            │   │   ├── ui/            ← shadcn/ui 元件
            │   │   └── invoices/      ← 發票相關元件
            │   └── lib/               ← 工具程式庫
            │       ├── prisma.ts      ← Prisma 客戶端
            │       ├── auth-helper.ts ← 認證輔助
            │       └── ...
            └── __tests__/             ← 測試
                ├── unit/
                └── e2e/
```

---

## 🛠️ 技術棧

| 層級 | 技術 |
|------|------|
| 框架 | Next.js 16 + React 19 + TypeScript |
| 樣式 | Tailwind CSS + shadcn/ui |
| 認證 | NextAuth v5 (Credentials + Google + Apple OAuth) |
| ORM | Prisma v7 |
| 資料庫 | PostgreSQL 16 |
| 套件管理 | pnpm (monorepo) |
| 測試 | Jest + Playwright |

---

## 🚀 建置步驟

### 前置需求確認

```bash
# 確認 Node.js 版本（需 v18+）
node --version

# 確認 pnpm（若未安裝：npm install -g pnpm）
pnpm --version

# 確認 PostgreSQL（需 v14+）
psql --version
```

---

### 步驟 1：取得專案

```bash
# 若尚未有專案，從 git 複製
git clone <你的 repo URL> ceo-platform
cd ceo-platform
```

---

### 步驟 2：安裝依賴

> 專案使用 **pnpm** 作為套件管理，並使用 Turborepo 做 monorepo 管理。

```bash
# 在 monorepo 根目錄安裝所有子套件依賴
cd ceo-monorepo
pnpm install
```

成功後你會看到 `apps/web/node_modules` 已建立。

---

### 步驟 3：設定環境變數

```bash
cd apps/web

# 複製範本
cp .env.local.example .env.local
```

編輯 `.env.local`，填入以下必要欄位：

```env
# ✅ 必填：PostgreSQL 連線字串
DATABASE_URL="postgresql://你的使用者:你的密碼@localhost:5432/ceo_platform"

# ✅ 必填：NextAuth 設定
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="隨機產生一個安全字串"   # 可用 openssl rand -base64 32

# ✅ 必填：Email 服務（用 Resend 免費方案即可）
RESEND_API_KEY="re_xxxxxxxxxxxx"

# 選填：Google OAuth（若要測試 Google 登入）
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# 選填：Apple OAuth（若要測試 Apple 登入）
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""
APPLE_TEAM_ID=""
APPLE_KEY_ID=""
```

---

### 步驟 4：建立 PostgreSQL 資料庫

```bash
# 進入 PostgreSQL
psql -U postgres

# 建立資料庫與使用者
CREATE USER ceo_admin WITH PASSWORD 'SecureDevPass_2026!';
CREATE DATABASE ceo_platform OWNER ceo_admin;
GRANT ALL PRIVILEGES ON DATABASE ceo_platform TO ceo_admin;
\q
```

---

### 步驟 5：執行 Prisma 資料庫遷移

```bash
# 在 apps/web 目錄下執行
cd ceo-monorepo/apps/web

# 產生 Prisma Client（TypeScript 型別）
pnpm db:generate

# 執行所有遷移（建立資料表）
pnpm db:migrate

# 確認 schema 是否與資料庫同步
npx prisma validate
```

遷移成功後，PostgreSQL 裡會建立所有資料表：
`users`, `orders`, `products`, `invoices`, `invoice_line_items` 等。

---

### 步驟 6：（選用）載入種子資料

```bash
# 載入測試資料（管理員帳號、範例產品等）
pnpm db:seed
```

預設測試帳號請見 `DOCKER_TEST_ACCOUNTS.md`。

---

### 步驟 7：啟動開發伺服器

```bash
# 在 apps/web 目錄下
pnpm dev

# 或從 monorepo 根目錄用 turbo 啟動
cd ceo-monorepo
pnpm dev
```

打開瀏覽器：**http://localhost:3000**

---

## ✅ 驗證安裝成功

```bash
# 1. TypeScript 型別檢查（應該 0 errors）
pnpm typecheck

# 2. 建置生產版本（應該 Clean build）
pnpm build

# 3. 執行測試
pnpm test
```

---

## 🔄 日常開發指令

```bash
# 啟動開發伺服器
pnpm dev

# 修改 prisma/schema.prisma 後執行遷移
pnpm db:migrate

# 重新產生 Prisma Client 型別
pnpm db:generate

# 用視覺介面瀏覽資料庫
pnpm db:studio

# 執行測試
pnpm test
pnpm test:watch      # 監聽模式
pnpm test:coverage   # 含覆蓋率報告
```

---

## 📊 目前專案進度

根據 `Gem3Plan.md`，目前進度為：

| 階段 | 狀態 |
|------|------|
| Phase 1：準備與清理 | ✅ 完成 |
| Phase 2：認證層 + API 遷移 | ✅ 完成（41 個路由全數驗證） |
| Phase 3：UX 簡化 | ✅ 完成（首頁 + 管理儀表板） |
| Phase 4：支付系統（月結發票）| ✅ 完成（9 個 API + 3 個前端頁面） |
| **Phase 4.5：B2B 團購功能** | 🔄 **進行中（Task 1 完成，Task 2-15 待做）** |
| Phase 5：測試驗證 | ⏳ 待開始 |
| Phase 6：上線交接 | ⏳ 待開始 |

---

## 🏗️ 重要檔案速查

| 用途 | 路徑 |
|------|------|
| 資料庫 Schema | `apps/web/prisma/schema.prisma` |
| NextAuth 設定 | `apps/web/src/auth.ts` |
| 認證 Helper | `apps/web/src/lib/auth-helper.ts` |
| Prisma 客戶端 | `apps/web/src/lib/prisma.ts` |
| API 路由（發票） | `apps/web/src/app/api/invoices/` |
| API 路由（管理） | `apps/web/src/app/api/admin/` |
| 單元測試 | `apps/web/__tests__/unit/` |
| E2E 測試 | `apps/web/__tests__/e2e/` |

---

## ⚠️ 常見問題

**Q：`pnpm db:migrate` 失敗，提示連線錯誤？**
→ 確認 PostgreSQL 服務已啟動，且 `.env.local` 的 `DATABASE_URL` 正確。

**Q：`pnpm typecheck` 有型別錯誤？**
→ 先執行 `pnpm db:generate` 重新產生 Prisma 型別，再重跑 typecheck。

**Q：`NEXTAUTH_SECRET` 怎麼產生？**
```bash
openssl rand -base64 32
```

**Q：Prisma Studio 無法開啟？**
→ 確認 DATABASE_URL 正確，並確認資料庫已執行遷移。

---

## 📚 相關文件

- `Gem3Plan.md` — 完整架構計畫與階段說明
- `DailyProgress.md` — 每日進度紀錄
- `QUICK_START.md` — 快速啟動參考
- `docs/PHASE_4_API_TESTING_GUIDE.md` — API 測試手冊（70+ 個測試案例）
- `DEPLOYMENT_CHECKLIST.md` — 部署前檢查清單

---

*最後更新：2026-03-01*

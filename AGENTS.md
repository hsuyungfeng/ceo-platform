# AGENTS.md - CEO 平台代理配置

## 概述

本文檔記錄 CEO 平台專案的 OpenCode 代理配置、工作流程和最佳實踐。

---

## 📋 專案資訊

**專案名稱**：CEO 平台 - 多供應商 B2B 批發平台
**技術棧**：Next.js 16.1.6 + Prisma v7.4.2 + PostgreSQL 16 + React Native
**專案狀態**：Phase 1-9 已完成，Phase 10 安全加固計劃已制定
**最後更新**：2026-03-07

---

## 🤖 OpenCode 配置

### 模型配置 (`opencode.jsonc`)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "deepseek": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DeepSeek",
      "options": {
        "baseURL": "https://api.deepseek.com/v1"
      },
      "models": {
        "deepseek-chat": {
          "name": "deepseek-chat"
        },
        "deepseek-reasoner": {
          "name": "deepseek-reasoner"
        }
      }
    }
  },
  "model": "deepseek/deepseek-reasoner",
  "mcp": {
    "chrome-devtools": {
      "command": [
        "npx",
        "-y",
        "chrome-devtools-mcp@latest"
      ],
      "type": "local"
    }
  },
  "plugin": [
    "opencode-scheduler"
  ]
}
```

### 當前使用模型
- **主要模型**：`deepseek/deepseek-reasoner`
- **備用模型**：`deepseek/deepseek-chat`
- **推理能力**：強推理、代碼生成、問題解決

---

## 🔧 MCP 工具配置

### Chrome DevTools MCP
- **用途**：前端測試、調試、效能分析
- **命令**：`npx -y chrome-devtools-mcp@latest`
- **功能**：
  - 頁面導航與截圖
  - 效能分析與 Lighthouse 審計
  - 網路請求監控
  - 控制台日誌查看

### 排程器插件
- **插件**：`opencode-scheduler`
- **用途**：定期任務排程
- **功能**：
  - 定期測試執行
  - 監控告警
  - 備份任務

---

## 📁 專案結構

### 主代碼庫
```
ceo-monorepo/                    ← 🟢 主要代碼庫
├── apps/
│   ├── web/                    ← Next.js Web 端
│   │   ├── prisma/schema.prisma (1024 行，37+ 模型)
│   │   ├── src/app/api/ (94 個 API 端點)
│   │   ├── src/app/ (40+ 前端頁面)
│   │   └── __tests__/ (完整測試框架)
│   └── mobile/                 ← React Native / Expo Mobile App
└── packages/                   ← 共用套件
```

### 舊代碼庫 (已歸檔)
```
ceo-platform/                   ← 🔴 舊版 B2C 獨立 Web 端
└── prisma/schema.prisma (536 行，22 模型)
```

### 文件結構
```
docs/                           ← 當前文件
doc/                            ← 歷史文件歸檔
DailyProgress.md                ← 每日進度追蹤
Gem3Plan.md                     ← 專案計劃
AGENTS.md                       ← 代理配置 (本文檔)
```

---

## 🛠️ 可用工具與命令

### 開發命令
```bash
# 啟動開發伺服器
cd ceo-monorepo/apps/web && npm run dev

# 類型檢查
cd ceo-monorepo/apps/web && npm run typecheck

# 代碼檢查
cd ceo-monorepo/apps/web && npm run lint

# 測試執行
cd ceo-monorepo/apps/web && npm run test
```

### 測試環境命令
```bash
# 啟動測試資料庫
cd ceo-monorepo/apps/web && npm run test:db:start

# 執行整合測試
cd ceo-monorepo/apps/web && npm run test:integration

# 停止測試環境
cd ceo-monorepo/apps/web && npm run test:db:stop
```

### Docker 命令
```bash
# 啟動開發資料庫
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

---

## 📝 工作流程指南

### 1. 代碼開發流程
1. **分析需求**：閱讀 `DailyProgress.md` 和 `Gem3Plan.md`
2. **檢查現有代碼**：使用搜索工具查找相關代碼
3. **實施修改**：遵循現有代碼風格和模式
4. **測試驗證**：運行相關測試套件
5. **類型檢查**：確保 TypeScript 無錯誤
6. **提交更改**：使用清晰的提交訊息

### 2. 測試工作流程
1. **單元測試**：為新功能添加單元測試
2. **整合測試**：使用 Docker 測試環境
3. **前端測試**：使用 Chrome DevTools MCP
4. **效能測試**：使用 Lighthouse 審計

### 3. 文件更新流程
1. **更新進度**：修改 `DailyProgress.md`
2. **更新計劃**：修改 `Gem3Plan.md`
3. **更新配置**：修改本文檔 (`AGENTS.md`)
4. **提交文件**：與代碼更改一起提交

---

## 🎯 代理最佳實踐

### 代碼風格指南
1. **TypeScript 優先**：使用嚴格類型檢查
2. **中文註解**：主要使用中文繁體註解
3. **現有模式**：遵循現有代碼結構和模式
4. **錯誤處理**：完整的錯誤處理和日誌記錄

### 文件規範
1. **中文為主**：主要文件使用中文繁體
2. **結構清晰**：使用 Markdown 標題層級
3. **更新及時**：及時更新進度和計劃文件
4. **版本控制**：所有更改通過 git 管理

### 測試要求
1. **測試覆蓋**：新功能需有對應測試
2. **測試隔離**：測試間不互相影響
3. **測試資料**：使用測試專用資料
4. **測試報告**：生成測試報告文件

---

## 🔄 定期任務

### 每日任務
1. **檢查進度**：閱讀 `DailyProgress.md`
2. **運行測試**：執行核心測試套件
3. **類型檢查**：確保代碼無類型錯誤
4. **更新文件**：記錄當日工作進度

### 每週任務
1. **全面測試**：運行所有測試套件
2. **效能檢查**：使用 Lighthouse 審計
3. **代碼審查**：檢查代碼質量和風格
4. **計劃更新**：更新 `Gem3Plan.md`

### 每月任務
1. **依賴更新**：檢查並更新依賴版本
2. **安全掃描**：檢查安全漏洞
3. **備份驗證**：驗證備份系統
4. **效能優化**：分析並優化效能瓶頸

---

## ⚠️ 注意事項與限制

### 已知限制
1. **NextAuth v5**：使用 beta 版本，可能有相容性問題
2. **ES 模組**：Jest 測試中 ES 模組支援有限
3. **記憶體使用**：大型測試套件可能記憶體使用較高
4. **網路依賴**：部分功能需要網路連接

### 安全注意
1. **環境變數**：不提交敏感資訊到 git
2. **API 金鑰**：使用環境變數管理
3. **資料庫存取**：限制資料庫存取權限
4. **日誌記錄**：不記錄敏感用戶資料

### 效能優化
1. **快取策略**：適當使用快取
2. **查詢優化**：優化資料庫查詢
3. **Bundle 大小**：監控前端 Bundle 大小
4. **圖片優化**：使用適當的圖片格式和大小

---

## 📞 問題排除

### 常見問題

#### 1. 測試資料庫連接失敗
```bash
# 檢查 Docker 容器狀態
docker-compose -f docker-compose.test.yml ps

# 重啟測試容器
npm run test:db:restart

# 檢查日誌
npm run test:db:logs
```

#### 2. TypeScript 類型錯誤
```bash
# 運行類型檢查
npm run typecheck

# 檢查 tsconfig 配置
cat tsconfig.json

# 清除 TypeScript 快取
rm -rf tsconfig.tsbuildinfo
```

#### 3. Jest 測試失敗
```bash
# 運行特定測試
npm test -- --testNamePattern="測試名稱"

# 查看詳細輸出
npm test -- --verbose

# 清除 Jest 快取
npm test -- --clearCache
```

#### 4. 開發伺服器無法啟動
```bash
# 檢查端口占用
lsof -i :3000

# 清除 Next.js 快取
rm -rf .next

# 重新安裝依賴
rm -rf node_modules package-lock.json
npm install
```

### 聯繫支援
- **文件**：查閱 `docs/` 目錄
- **進度**：查看 `DailyProgress.md`
- **計劃**：查看 `Gem3Plan.md`
- **配置**：查看本文檔 (`AGENTS.md`)

---

## 🔄 更新記錄

### 2026-03-06
- **創建文件**：初始版本創建
- **記錄配置**：OpenCode 配置記錄
- **工作流程**：定義標準工作流程
- **問題排除**：添加常見問題解決方案

### 未來更新計劃
1. **Phase 9 實施**：添加通知系統相關配置
2. **CI/CD 整合**：添加 GitHub Actions 配置
3. **監控配置**：添加 Sentry 等監控工具配置
4. **團隊協作**：添加團隊協作指南

---

## 📊 狀態指示器

### 專案狀態
- ✅ **Phase 1-9**：已完成
- 📋 **Phase 10**：安全加固與品質提升 - 計劃已制定
- 🟢 **測試環境**：正常運行
- 🟢 **開發環境**：正常運行
- 🟢 **文件系統**：完整

### 代理狀態
- 🟢 **OpenCode**：正常運行
- 🟢 **MCP 工具**：正常運行
- 🟢 **模型連接**：正常
- 🟢 **排程任務**：正常

---

**最後更新**：2026-03-07
**維護者**：CEO Platform Team
**文件版本**：v1.1.0
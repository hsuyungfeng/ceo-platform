# CEO 平台依賴修復總結

## 修復時間
2026-03-06

## 問題描述
CEO 平台開發伺服器啟動失敗，錯誤訊息顯示缺少 `@babel/preset-env` 模組。

## 根本原因
1. `babel.config.js` 中配置了 `@babel/preset-env`，但 `package.json` 中沒有對應的依賴
2. Next.js 16.1.6 使用 Turbopack 時對 Babel 配置有特殊要求
3. Jest 測試配置中缺少 `node-fetch-polyfill` 依賴

## 修復步驟

### 1. 安裝缺失的 Babel 依賴
```bash
cd ceo-monorepo/apps/web
pnpm add -D @babel/preset-env @babel/preset-typescript @babel/core
```

### 2. 安裝 Jest 測試依賴
```bash
pnpm add -D node-fetch-polyfill
```

### 3. 清除快取
```bash
rm -rf .next node_modules/.cache .turbo
```

### 4. 重新安裝依賴
```bash
pnpm install --force
```

### 5. 修改開發腳本
將 `package.json` 中的 `dev` 腳本從：
```json
"dev": "next dev --turbopack"
```
改為：
```json
"dev": "next dev"
```

## 安裝的依賴

### 開發依賴 (devDependencies)
1. **@babel/core@7.29.0** - Babel 核心編譯器
2. **@babel/preset-env@7.29.0** - 智能 Babel 預設，根據目標環境自動選擇插件
3. **@babel/preset-typescript@7.28.5** - TypeScript 支援預設
4. **node-fetch-polyfill@2.0.6** - Node.js 環境下的 fetch API polyfill

### 依賴關係
```
@babel/preset-env
├── @babel/core (required)
├── @babel/plugin-syntax-* (自動安裝)
└── @babel/plugin-transform-* (自動安裝)

node-fetch-polyfill
└── 用於 Jest 測試環境中的 Web API 模擬
```

## 配置更新

### babel.config.js
```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
  plugins: [],
};
```

### jest.setup.js
已包含對 `node-fetch-polyfill` 的支援：
```javascript
if (typeof global.Request === 'undefined') {
  try {
    const { Request, Response, fetch } = require('node-fetch-polyfill')
    global.Request = Request
    global.Response = Response
    global.fetch = fetch
  } catch (error) {
    // 備用方案
  }
}
```

## 測試結果

### 伺服器啟動
- ✅ 伺服器成功啟動（Next.js 16.1.6）
- ✅ Babel 配置正確載入
- ⚠️ Turbopack 警告：多個 lockfile 檢測
- ⚠️ middleware 文件約定已棄用警告

### 依賴驗證
```bash
# 驗證 Babel 依賴
pnpm list @babel/preset-env
# ✓ @babel/preset-env@7.29.0

# 驗證 node-fetch-polyfill
pnpm list node-fetch-polyfill
# ✓ node-fetch-polyfill@2.0.6
```

## 已知問題

### 1. Turbopack 配置警告
```
Warning: Next.js inferred your workspace root, but it may not be correct.
Detected multiple lockfiles
```

**建議解決方案**：
1. 在 `next.config.js` 中明確設置 `turbopack.root`
2. 清理多餘的 lockfile 文件

### 2. middleware 棄用警告
```
The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**建議解決方案**：
1. 將 `src/middleware.ts` 遷移到新的 proxy 模式
2. 或暫時忽略此警告（不影響功能）

### 3. 對等依賴警告
```
unmet peer react@^18.0.0: found 19.2.3
unmet peer next@"^13.2.0 || ^14.0 || ^15.0.0-rc.0": found 16.1.6
```

**影響評估**：
- 測試庫版本不匹配，但應不影響核心功能
- Sentry 版本警告，但 Next.js 16 應向後兼容

## 下一步建議

### 短期（本週）
1. **修復 Turbopack 警告**：設置明確的 root 目錄
2. **更新 middleware**：遷移到新的 proxy 模式
3. **測試完整功能**：使用 webapp-testing 技能進行端到端測試

### 中期（本月）
1. **依賴版本升級**：更新測試庫以支援 React 19
2. **CI/CD 集成**：將依賴檢查加入 CI 流程
3. **監控設置**：配置 Sentry 錯誤追蹤

### 長期（本季度）
1. **依賴管理自動化**：設置依賴更新自動化
2. **安全掃描**：定期進行安全漏洞掃描
3. **效能優化**：優化構建和啟動時間

## 文件更新
- ✅ 更新了 `package.json` 依賴
- ✅ 創建了本修復總結文件
- 📋 需要更新 `SETUP_GUIDE.md` 中的依賴安裝說明

## 負責人
CEO Platform Team

## 最後更新
2026-03-06
# 🎯 Phase 2.3 認證層測試 - 操作檢查清單

**日期**: 2026-02-28
**目標**: 完成 Phase 2.3 認證層的實際測試驗證
**預計時間**: 20 分鐘

---

## ✅ 前置準備 (已完成)

- [x] Phase 2.3 代碼實現 100% (pocketbase-auth.ts, auth.ts, auth-helper.ts)
- [x] 建立詳細測試計劃 (TESTING_PHASE_2_3.md)
- [x] 建立快速開始指南 (QUICK_START_TESTING.md)
- [x] 建立自動化測試腳本 (scripts/test-pocketbase-auth.ts)

---

## 📋 立即要做 (現在執行)

### 第 1 步：安裝 PocketBase ⏱️ 2 分鐘

**執行命令：**
```bash
brew install pocketbase
pocketbase version  # 驗證安裝
```

**檢查清單：**
- [ ] PocketBase 已安裝
- [ ] 版本號顯示成功（例：v0.21.0）

---

### 第 2 步：啟動 PocketBase 服務器 ⏱️ 1 分鐘

**在新的終端窗口執行：**
```bash
cd /Users/hsuyungfeng/Applesoft/Onecompany/ceo-platform
pocketbase serve
```

**檢查清單：**
- [ ] 看到 "Server started at http://127.0.0.1:8090"
- [ ] 看到 "REST API: http://127.0.0.1:8090/api/"
- [ ] 看到 "Admin UI: http://127.0.0.1:8090/_/"

✅ **保持此終端窗口運行！**

---

### 第 3 步：建立 Collections ⏱️ 5-10 分鐘

**打開瀏覽器訪問：**
```
http://127.0.0.1:8090/_/
```

**步驟 3.1：初始化管理員帳戶**
- [ ] 填寫電子郵件和密碼
- [ ] 點擊 "Create admin account"
- [ ] 記下密碼

**步驟 3.2：建立 3 個 Collections**

參照 [QUICK_START_TESTING.md](./QUICK_START_TESTING.md) 中的 "第 3 步" 建立以下 Collections：

#### Collection: `users`
- [ ] 集合名稱：`users`
- [ ] 字段已建立：taxId, email, password, name, role, status 等（共 13 個字段）
- [ ] 索引已設定：taxId (unique), email (unique)

#### Collection: `oAuthAccounts`
- [ ] 集合名稱：`oAuthAccounts`
- [ ] 字段已建立：userId, provider, providerId, accessToken 等（共 9 個字段）
- [ ] 關係已設定：userId → users.id

#### Collection: `tempOAuths`
- [ ] 集合名稱：`tempOAuths`
- [ ] 字段已建立：provider, providerId, email, accessToken, expiresAt 等（共 10 個字段）

✅ **所有 Collections 已準備好！**

---

### 第 4 步：執行自動測試 ⏱️ 2 分鐘

**在當前的終端窗口執行（不是 PocketBase 終端）：**

```bash
cd /Users/hsuyungfeng/Applesoft/Onecompany/ceo-platform/ceo-monorepo/apps/web
npx ts-node scripts/test-pocketbase-auth.ts
```

**檢查輸出：**

```
✅ 測試 1: 檢查 PocketBase 連接... ✓
✅ 測試 2: 建立測試用戶... ✓
✅ 測試 3: 根據 taxId 查找用戶... ✓
✅ 測試 4: 根據 email 查找用戶... ✓
✅ 測試 5: 根據 ID 查找用戶... ✓
✅ 測試 6: 驗證用戶密碼... ✓
✅ 測試 6b: 驗證錯誤密碼應被拒絕... ✓
✅ 測試 7: 檢查用戶狀態 (ACTIVE)... ✓
✅ 測試 8: 建立 OAuth 帳戶... ✓
✅ 測試 9: 查找 OAuth 帳戶... ✓

📊 測試結果摘要
✅ 通過: 10
❌ 失敗: 0
總計: 10

🎉 所有測試通過！
```

**檢查清單：**
- [ ] 所有 10 個測試顯示 ✅
- [ ] 失敗數為 0
- [ ] 看到 "🎉 所有測試通過"

---

## 🐛 故障排除

若測試失敗，按照以下順序檢查：

### 問題：Connection refused (127.0.0.1:8090)
**解決方案：**
- [ ] 確認 PocketBase 終端窗口仍在運行
- [ ] 檢查是否有錯誤信息
- [ ] 嘗試訪問：http://127.0.0.1:8090/_/ （瀏覽器應能訪問）

### 問題：Collection 'users' does not exist
**解決方案：**
- [ ] 確認所有 3 個 Collections 已在 PocketBase Admin UI 中建立
- [ ] 檢查名稱拼寫（區分大小寫）：users, oAuthAccounts, tempOAuths
- [ ] 確認字段已添加（至少要有 taxId, email, password, name）

### 問題：duplicate key value violates unique constraint
**解決方案：**
- [ ] 這表示測試用戶已存在（來自之前的測試運行）
- [ ] 這是正常的，腳本會自動跳過用戶建立
- [ ] 但之後的驗證應該仍然成功

### 問題：其他錯誤
**檢查步驟：**
- [ ] 查看錯誤信息中的具體內容
- [ ] 參照 [TESTING_PHASE_2_3.md](./TESTING_PHASE_2_3.md) 中的 "常見問題排除" 部分
- [ ] 檢查 PocketBase Admin UI 中的 Collections 設定

---

## ✨ 測試成功標誌

若看到以下結果，說明 Phase 2.3 已成功完成：

- ✅ 所有 10 個測試通過
- ✅ 用戶可以根據 taxId/email/id 被查找
- ✅ 密碼驗證正確（正確密碼通過，錯誤密碼被拒絕）
- ✅ 用戶狀態檢查工作正常
- ✅ OAuth 帳戶可以建立和查找

---

## 🎯 完成後的下一步

### 立即要做：

1. **提交測試結果：**
   ```bash
   git add -A
   git commit -m "test: Phase 2.3 認證層測試驗證完成"
   ```

2. **更新進度文檔：**
   - [ ] 編輯 DailyProgress.md，標記測試完成日期
   - [ ] 編輯 Gem3Plan.md，更新 Phase 2.3 為 100% 完成

3. **下週計劃：**
   - [ ] 開始 Phase 2.4: 逐路由遷移
   - [ ] 驗證已使用 PocketBase 的 6 個現有路由
   - [ ] 遷移公開路由（products, categories）

---

## 📞 參考資源

| 資源 | 用途 |
|------|------|
| [QUICK_START_TESTING.md](./QUICK_START_TESTING.md) | 快速開始指南（最簡潔） |
| [TESTING_PHASE_2_3.md](./TESTING_PHASE_2_3.md) | 詳細測試指南（全面） |
| [scripts/test-pocketbase-auth.ts](./ceo-monorepo/apps/web/scripts/test-pocketbase-auth.ts) | 自動化測試代碼 |
| [Gem3Plan.md](./Gem3Plan.md) | 完整實施計劃 |
| [DailyProgress.md](./DailyProgress.md) | 每日進度追蹤 |

---

## ⏰ 時間統計

| 步驟 | 時間 | 狀態 |
|------|------|------|
| 1. 安裝 PocketBase | 2 分鐘 | [ ] |
| 2. 啟動服務器 | 1 分鐘 | [ ] |
| 3. 建立 Collections | 5-10 分鐘 | [ ] |
| 4. 執行測試 | 2 分鐘 | [ ] |
| **總計** | **⏱️ 10-15 分鐘** | [ ] |

---

## 🚀 開始時間

**開始**: _______ (現在)
**預計完成**: _______ (+ 20 分鐘)
**實際完成**: _______

---

## 📝 筆記

在下方記錄任何問題或觀察結果：

```
[在此添加筆記]




```

---

**準備好了嗎？** 👉 從第 1 步開始：`brew install pocketbase`


# Phase 4 Staging 部署計劃

**日期:** 2026-02-28
**目標:** 部署 Phase 4 支付系統到 Staging 環境
**預期時間:** 2-3 小時（部署 + 基礎驗證）

---

## 📋 部署前檢查清單

### 代碼準備
- [x] ✅ npm run typecheck → 0 errors
- [x] ✅ npm run build → Clean build
- [x] ✅ Phase 4 E2E tests → 3/3 passing
- [x] ✅ All commits pushed to origin
- [x] ✅ No sensitive data in code

### 數據庫準備
- [ ] ✅ PostgreSQL staging instance running
- [ ] ✅ Prisma migrations applied to staging DB
- [ ] ✅ Invoice + InvoiceLineItem tables created
- [ ] ✅ Test data loaded (sample orders for invoice generation)
- [ ] ✅ Database backups taken

### 環境設置
- [ ] ✅ Staging env vars configured (.env.staging)
  - DATABASE_URL (staging postgres)
  - NEXTAUTH_SECRET
  - NEXTAUTH_URL=https://staging.your-domain.com
  - RESEND_API_KEY (if email enabled)
- [ ] ✅ CORS settings updated for staging domain
- [ ] ✅ API rate limiting configured
- [ ] ✅ Logging enabled for error tracking

---

## 🔄 部署流程

### Phase 1: 部署應用 (1 小時)
```bash
# 1. 建立 staging branch
git checkout -b staging/phase-4-payment

# 2. 設置 staging 環境
# (Your deployment process here)
# - Deploy to staging server
# - Configure environment variables
# - Run Prisma migrations
# - Restart application

# 3. 驗證部署
curl https://staging.your-domain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-02-28T..."}
```

### Phase 2: 快速驗證 (30 分鐘)
**運行 PHASE_4_API_TESTING_GUIDE.md 中的「快速測試」部分:**
```bash
# 1. 員工發票列表
curl -X GET https://staging.your-domain.com/api/invoices \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"
# Expected: 200, empty array or existing invoices

# 2. 管理員生成發票
curl -X POST https://staging.your-domain.com/api/admin/invoices/generate \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"billingMonth":"2026-02"}'
# Expected: 201, created invoices

# 3. 前端頁面加載
curl https://staging.your-domain.com/invoices
# Expected: 200, HTML content

# 4. 性能檢查
# All endpoints should respond < 500ms
```

---

## 🧪 Phase 5 並行測試計劃

在部署後立即開始以下測試（不阻塞部署）：

### 測試 1: 完整發票工作流程 (40 分鐘)
```
DRAFT → SENT → CONFIRMED → PAID

1. Admin: 生成月結發票
2. Admin: 發送發票給員工
3. Employee: 查看發票列表
4. Employee: 確認發票
5. Admin: 標記為已支付
6. Verify: 所有狀態轉換正確
```

### 測試 2: 支付方式功能 (30 分鐘)
```
CASH 流程:
1. 創建現金訂單
2. 驗證無需發票

MONTHLY_BILLING 流程:
1. 創建月結訂單
2. 月底自動生成發票
3. 驗證發票明細正確
```

### 測試 3: 安全性驗證 (25 分鐘)
```
✅ 認證檢查:
   - 401: 無 Token
   - 403: 員工訪問管理端點
   
✅ 授權檢查:
   - 員工只能看自己的發票
   - 管理員可以看所有發票
   
✅ 輸入驗證:
   - Invalid billingMonth format
   - Invalid invoice status
```

### 測試 4: 性能基準 (20 分鐘)
```
每個端點測試 10 次請求:

GET /api/invoices
GET /api/invoices/[id]
PATCH /api/invoices/[id]/confirm
POST /api/admin/invoices/generate
POST /api/admin/invoices/send-all
GET /api/admin/invoices

Target: All < 500ms (p95)
Warning: Any > 1000ms
```

### 測試 5: 邊界情況 (25 分鐘)
```
✅ 空狀態: 無發票時的行為
✅ 大數據: 100+ 發票列表性能
✅ 並發: 同時 5 個用戶操作
✅ 錯誤恢復: 生成失敗後重試
```

---

## 📊 測試驗收標準

### 部署檢查 (必須通過)
- [ ] ✅ 應用成功啟動
- [ ] ✅ /api/health 返回 200
- [ ] ✅ 數據庫連接正常
- [ ] ✅ 所有 9 個 API 端點可訪問

### 功能驗收 (必須通過)
- [ ] ✅ 發票完整工作流程
- [ ] ✅ 支付方式正確
- [ ] ✅ 授權檢查有效
- [ ] ✅ 錯誤處理正確

### 性能驗收 (建議)
- [ ] ✅ 單個端點 < 500ms
- [ ] ✅ 批量操作 < 1s
- [ ] ✅ 無內存泄漏
- [ ] ✅ 無 N+1 查詢

---

## 🚨 如果出現問題

### 常見問題排查

**症狀:** 發票頁面 500 錯誤
```
1. 檢查 /api/invoices 響應
2. 查看 server 日誌中的錯誤
3. 驗證數據庫連接
4. 檢查 Prisma 遷移是否完成
```

**症狀:** 認證失敗 (401)
```
1. 驗證 Bearer Token 格式
2. 檢查 NEXTAUTH_SECRET 設置
3. 確認 Token 未過期
4. 查看 auth 日誌
```

**症狀:** 發票生成失敗
```
1. 驗證 billingMonth 格式 (YYYY-MM)
2. 檢查是否有 MONTHLY_BILLING 訂單
3. 查看數據庫連接
4. 檢查磁盤空間
```

### 回滾計劃
```bash
# 如果需要回滾
git revert <commit-hash>
npm run build
# 重新部署之前的版本
```

---

## ✅ 部署完成檢查

完成以下項目後，Phase 4 就準備好進入生產環境：

- [ ] ✅ Staging 部署成功
- [ ] ✅ 所有快速測試通過
- [ ] ✅ Phase 5 並行測試完成
- [ ] ✅ 性能基準符合目標
- [ ] ✅ 無關鍵問題發現
- [ ] ✅ 利益相關者簽核

---

## 📈 下一步

1. **即時:** 部署到 Staging
2. **1 小時內:** 快速驗證測試
3. **同時:** Phase 5 並行測試
4. **3-4 小時後:** 準備生產部署
5. **明天:** 生產發布

**預期 Phase 4 在生產環境上線時間: 2026-03-01 上午**


# 供應商系統改進計劃 (Supplier System Enhancement Plan)

## 目標

將 CEO 平台從單一供應商擴展為多供應商 B2B 批發平台。

---

## 功能需求分析

### 1. 多供應商申請系統

**批發商視角：**
- 瀏覽可選供應商列表
- 提交供應商申請（選擇供應商 + 提交資料）
- 追蹤申請狀態
- 與已批准供應商進行交易

**供應商視角：**
- 審批/拒絕批發商申請
- 管理已批准的交易商名單
- 在手機或網頁端確認

### 2. 帳號階層系統

- **主帳號 (Main Account)**：1 個 - 完全控制權
- **附屬帳號 (Sub-account)**：多個 - 有限權限
- 適用於：供應商 & 批發商

### 3. 產品欄位擴展

### 4. 供應商註冊資訊欄位

---

## 資料庫設計 (Prisma Schema 擴展)

### 新增 Model

```prisma
// 供應商 (Supplier) - 主表
model Supplier {
  id              String         @id @default(cuid())
  taxId           String         @unique              // 統一編號
  companyName     String                              // 公司名稱
  contactPerson   String                              // 聯絡人
  phone           String                              // 電話
  email           String         @unique              // Email
  address         String                              // 地址
  industry        String?                            // 產業類別
  description     String?                            // 公司描述
  status          SupplierStatus @default(PENDING)   // 狀態
  isVerified      Boolean        @default(false)     // 是否驗證
  verifiedAt      DateTime?                          // 驗證時間
  verifiedBy      String?                            // 驗證人
  mainAccountId   String        @unique              // 主帳號 ID
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  
  mainAccount    User          @relation("SupplierMainAccount", fields: [mainAccountId], references: [id])
  subAccounts    User[]        @relation("SupplierSubAccounts")
  products       SupplierProduct[]
  applications   SupplierApplication[]
  
  @@map("suppliers")
}

enum SupplierStatus {
  PENDING     // 等待審批
  ACTIVE      // 活躍
  SUSPENDED   // 停用
  REJECTED    // 拒絕
}

// 供應商申請 (Supplier Application) - 批發商申請加入供應商
model SupplierApplication {
  id              String               @id @default(cuid())
  supplierId      String
  applicantId     String               // 申請者 userId
  
  // 申請資料
  companyName     String               // 公司名稱
  contactPerson   String               // 聯絡人
  phone          String               // 電話
  businessLicense String?              // 營業執照 URL
  note           String?              // 備註
  
  status          ApplicationStatus    @default(PENDING)
  reviewedBy      String?              // 審批人
  reviewedAt      DateTime?            // 審批時間
  rejectionReason String?              // 拒絕原因
  
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt
  
  supplier        Supplier             @relation(fields: [supplierId], references: [id])
  applicant       User                 @relation(fields: [applicantId], references: [id])
  
  @@unique([supplierId, applicantId])  // 每個批發商只能申請一次
  @@index([supplierId])
  @@index([applicantId])
  @@map("supplier_applications")
}

enum ApplicationStatus {
  PENDING     // 等待審批
  APPROVED    // 已批准
  REJECTED    // 已拒絕
}

// 供應商產品 (Supplier Product) - 供應商提供的產品
model SupplierProduct {
  id              String    @id @default(cuid())
  supplierId      String
  productId       String?   // 關聯平台產品（可選）
  
  // 產品資訊
  name            String    // 產品名稱
  SKU             String?   // SKU
  description     String?   // 產品描述
  category        String?   // 分類
  unit            String?   // 單位
  imageUrl        String?   // 產品圖片
  
  // 價格資訊
  price           Decimal   @db.Decimal(10, 2)    // 供應商報價
  moq             Int       @default(1)           // 最小訂購量
  leadTime        Int?                             // 交貨天數
  
  // 尺寸資訊（物流用）
  length          Decimal?  @db.Decimal(10, 2)    // 長度（cm）
  width           Decimal?  @db.Decimal(10, 2)    // 寬度（cm）
  height          Decimal?  @db.Decimal(10, 2)    // 高度（cm）
  weight          Decimal?  @db.Decimal(10, 3)    // 重量（kg）
  
  // 庫存
  stock           Int       @default(0)
  isActive        Boolean   @default(true)
  
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  supplier        Supplier  @relation(fields: [supplierId], references: [id])
  
  @@unique([supplierId, SKU])
  @@index([supplierId])
  @@map("supplier_products")
}

// 用戶關聯供應商 (User-Supplier Relation)
model UserSupplier {
  id              String    @id @default(cuid())
  userId          String
  supplierId      String
  role            SupplierUserRole @default(MEMBER)  // MAIN_ACCOUNT, SUB_ACCOUNT
  
  isActive        Boolean   @default(true)
  createdAt      DateTime  @default(now())
  
  user            User      @relation(fields: [userId], references: [id])
  supplier        Supplier  @relation(fields: [supplierId], references: [id])
  
  @@unique([userId, supplierId])
  @@map("user_suppliers")
}

enum SupplierUserRole {
  MAIN_ACCOUNT   // 主帳號
  SUB_ACCOUNT    // 附屬帳號
}
```

### 現有 Model 擴展

```prisma
// 現有 Product 模型擴展（加入尺寸欄位）
model Product {
  // ... existing fields ...
  
  // 尺寸資訊（物流用）
  length          Decimal?  @db.Decimal(10, 2)    // 長度（cm）
  width           Decimal?  @db.Decimal(10, 2)    // 寬度（cm）
  height          Decimal?  @db.Decimal(10, 2)    // 高度（cm）
  weight          Decimal?  @db.Decimal(10, 3)    // 重量（kg）
  
  // ... rest of fields ...
}
  // ... existing fields ...
  
  // 新增供應商關聯
  supplierMain     Supplier?     @relation("SupplierMainAccount")
  supplierSubOf    Supplier?     @relation("SupplierSubAccounts")
  userSuppliers   UserSupplier[]
  
  // 附屬帳號管理
  mainAccountId   String?       // 主帳號 ID（如果我是附屬帳號）
  mainAccount     User?         @relation("MainSubAccount", fields: [mainAccountId], references: [id])
  subAccounts     User[]        @relation("MainSubAccount")
  
  @@map("users")
}
```

---

## API 端點設計

### 供應商相關

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | /api/suppliers | 列出供應商（批發商可見） |
| GET | /api/suppliers/[id] | 供應商詳情 |
| POST | /api/suppliers/register | 供應商註冊（主帳號） |
| PATCH | /api/suppliers/[id] | 更新供應商資訊 |
| POST | /api/suppliers/[id]/verify | 驗證供應商（管理員） |

### 申請相關

| 方法 | 端點 | 說明 |
|------|------|------|
| POST | /api/supplier-applications | 提交申請 |
| GET | /api/supplier-applications | 我的申請列表 |
| GET | /api/supplier-applications/pending | 待審批列表（供應商） |
| PATCH | /api/supplier-applications/[id]/approve | 批准申請 |
| PATCH | /api/supplier-applications/[id]/reject | 拒絕申請 |

### 產品相關

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | /api/supplier-products | 供應商產品列表 |
| POST | /api/supplier-products | 新增產品 |
| PATCH | /api/supplier-products/[id] | 更新產品 |
| DELETE | /api/supplier-products/[id] | 刪除產品 |

### 帳號管理

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | /api/account/sub-accounts | 附屬帳號列表 |
| POST | /api/account/sub-accounts | 建立附屬帳號 |
| PATCH | /api/account/sub-accounts/[id] | 更新附屬帳號 |
| DELETE | /api/account/sub-accounts/[id] | 刪除附屬帳號 |

---

## 產品欄位設計

### 供應商產品內容欄位

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| name | String | ✅ | 產品名稱 |
| SKU | String | ✅ | 庫存單位 |
| description | Text | - | 產品描述 |
| category | String | - | 分類 |
| unit | String | - | 單位（箱/個/盒） |
| imageUrl | URL | - | 產品圖片 |
| price | Decimal | ✅ | 報價 |
| moq | Integer | ✅ | 最小訂購量 |
| leadTime | Integer | - | 交貨天數 |
| stock | Integer | - | 庫存數量 |
| isActive | Boolean | - | 是否上架 |

### 📦 產品尺寸欄位（物流用）

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| length | Decimal | - | 長度（cm） |
| width | Decimal | - | 寬度（cm） |
| height | Decimal | - | 高度（cm） |
| weight | Decimal | - | 重量（kg） |

---

## 供應商帳單系統（供應商付費）

### 📋 收費規則

| 項目 | 說明 |
|------|------|
| **收費方式** | 每月營業總量 1‰-3‰（千分之一至千分之三） |
| **儲值方式** | 先儲值後扣款（預付制） |
| **餘額提醒** | 餘額 < NT$ 1,000 時系統提醒 |
| **繳費期限** | 28 天內繳清 |
| **催收頻率** | 逾期每週提醒一次 |
| **停權處理** | 28 天後未繳清，帳號停權 |

### 收費流程

```
1. 供應商帳號建立 → 預設餘額 NT$ 0
2. 供應商儲值 → 餘額增加
3. 每月結算 → 營業總量 × 1‰-3‰ = 應扣金額
4. 系統扣款 → 餘額減少
5. 餘額 < NT$ 1,000 → 發送提醒通知
6. 超過 28 天未繳清 → 每週催收提醒
7. 超過 28 天 → 帳號停權（無法登入/交易）
```

### 帳單類型（重新設計）

| 類型 | 說明 | 計算方式 |
|------|------|----------|
| 平台服務費 | 每月營業總量收費 | 營業額 × 1‰-3‰ |
| 儲值 | 供應商自行儲值 | 餘額充值 |
| 退款 | 餘額退還 | 申請退還 |

### 供應商帳戶餘額模型

```prisma
// 供應商帳戶（儲值餘額）
model SupplierAccount {
  id              String    @id @default(cuid())
  supplierId      String    @unique
  
  // 餘額資訊
  balance         Decimal   @default(0) @db.Decimal(10, 2)  // 當前餘額
  totalSpent      Decimal   @default(0) @db.Decimal(10, 2)  // 累計已繳
  creditLimit     Decimal   @default(0) @db.Decimal(10, 2)  // 信用額度
  
  // 繳費狀態
  lastPaymentAt   DateTime?
  paymentDueDate  DateTime?                            // 繳費截止日
  isSuspended     Boolean   @default(false)            // 是否停權
  suspendedAt     DateTime?
  suspendReason   String?
  
  // 設定
  billingRate     Decimal   @default(0.001) @db.Decimal(5, 4)  // 收費率預設1‰
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  supplier        Supplier  @relation(fields: [supplierId], references: [id])
  
  @@map("supplier_accounts")
}

// 供應商交易記錄
model SupplierTransaction {
  id              String    @id @default(cuid())
  supplierId      String
  
  // 交易類型
  type            SupplierTransactionType
  
  // 金額
  amount          Decimal   @db.Decimal(10, 2)    // 變動金額
  balanceBefore   Decimal   @db.Decimal(10, 2)    // 變動前餘額
  balanceAfter    Decimal   @db.Decimal(10, 2)    // 變動後餘額
  
  // 關聯
  orderId         String?   // 訂單ID（計算費用時）
  invoiceId       String?   // 帳單ID
  
  // 備註
  note            String?
  
  createdAt       DateTime  @default(now())
  
  @@index([supplierId])
  @@map("supplier_transactions")
}

enum SupplierTransactionType {
  DEPOSIT         // 儲值
  MONTHLY_CHARGE  // 月費扣款
  REFUND          // 退款
  ADJUSTMENT      // 調整
}
```

### 繳費提醒系統

```prisma
// 繳費提醒記錄
model PaymentReminder {
  id              String    @id @default(cuid())
  supplierId      String
  
  // 提醒類型
  type            ReminderType
  
  // 提醒內容
  balance         Decimal   @db.Decimal(10, 2)    // 當時餘額
  dueAmount       Decimal   @db.Decimal(10, 2)    // 應繳金額
  daysOverdue     Int       // 逾期天數
  
  // 狀態
  isSent          Boolean   @default(false)
  sentAt          DateTime?
  
  createdAt       DateTime  @default(now())
  
  @@index([supplierId])
  @@map("payment_reminders")
}

enum ReminderType {
  LOW_BALANCE     // 餘額不足提醒（< NT$ 1,000）
  FIRST_WARNING   // 首次警告（逾期第7天）
  WEEKLY_REMINDER // 每週提醒（逾期每7天）
  FINAL_WARNING   // 最終警告（逾期第21天）
  SUSPEND_WARNING // 停權前最後警告（逾期第28天）
}
```

### 自動繳費扣款流程

```typescript
// 每月自動扣款流程
async function processMonthlyBilling(supplierId: string) {
  // 1. 計算當月營業總額
  const monthlySales = await calculateMonthlySales(supplierId);
  
  // 2. 計算收費金額（營業額 × 收費率）
  const billingRate = await getSupplierBillingRate(supplierId);
  const chargeAmount = monthlySales * billingRate;
  
  // 3. 檢查餘額是否足夠
  const account = await getSupplierAccount(supplierId);
  
  if (account.balance >= chargeAmount) {
    // 餘額足夠，直接扣款
    await deductBalance(supplierId, chargeAmount);
    await createTransaction(supplierId, 'MONTHLY_CHARGE', -chargeAmount);
  } else {
    // 餘額不足，產生帳單
    await createInvoice(supplierId, chargeAmount - account.balance);
    await sendLowBalanceReminder(supplierId);
  }
}

// 每日檢查逾期繳費
async function checkOverduePayments() {
  const overdueAccounts = await getOverdueAccounts(28); // 28天
  
  for (const account of overdueAccounts) {
    // 停權處理
    await suspendSupplier(account.supplierId);
    await sendSuspensionNotice(account.supplierId);
  }
  
  // 每週提醒
  const weeklyReminders = await getAccountsForWeeklyReminder();
  for (const account of weeklyReminders) {
    await sendWeeklyReminder(account.supplierId);
  }
}

### 供應商帳單資料表

```prisma
model SupplierInvoice {
  id              String              @id @default(cuid())
  invoiceNo       String              @unique              // 帳單編號
  supplierId      String
  
  // 帳單類型
  type            SupplierInvoiceType
  
  // 金額
  amount          Decimal            @db.Decimal(10, 2)
  tax             Decimal            @db.Decimal(10, 2) @default(0)
  totalAmount     Decimal            @db.Decimal(10, 2)
  
  // 產生期間
  billingMonth    String?            // YYYY-MM（月結）
  periodStart     DateTime?
  periodEnd        DateTime?
  
  // 狀態
  status          InvoicePaymentStatus @default(UNPAID)
  dueDate         DateTime
  paidAt          DateTime?
  
  // 備註
  note            String?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  supplier        Supplier          @relation(fields: [supplierId], references: [id])
  
  @@index([supplierId])
  @@index([billingMonth])
  @@map("supplier_invoices")
}

enum SupplierInvoiceType {
  MONTHLY_FEE     // 月租費
  PRODUCT_FEE     // 產品上架費
  TRANSACTION_FEE // 交易手續費
  SERVICE_FEE     // 額外服務費
}

enum InvoicePaymentStatus {
  UNPAID      // 未付款
  PAID        // 已付款
  OVERDUE     // 逾期
  CANCELLED   // 已取消
}
```

### 帳單 API 端點

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | /api/admin/supplier-invoices | 帳單列表 |
| POST | /api/admin/supplier-invoices | 產生帳單 |
| GET | /api/admin/supplier-invoices/[id] | 帳單詳情 |
| POST | /api/admin/supplier-invoices/[id]/send | 發送帳單 |
| POST | /api/admin/supplier-invoices/process-monthly | 每月自動扣款 |

### 儲值與帳戶 API

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | /api/supplier/account | 供應商帳戶資訊 |
| POST | /api/supplier/account/deposit | 儲值 |
| GET | /api/supplier/transactions | 交易記錄 |
| GET | /api/supplier-invoices | 供應商帳單列表 |
| POST | /api/supplier-invoices/[id]/pay | 繳費確認 |

### 繳費提醒 API

| 方法 | 端點 | 說明 |
|------|------|------|
| POST | /api/cron/check-overdue | 每日檢查逾期（排程） |
| POST | /api/cron/send-reminders | 發送提醒（排程） |

### 管理後台頁面

| 頁面 | 說明 |
|------|------|
| /admin/suppliers | 供應商管理 |
| /admin/supplier-invoices | 帳單產生與管理 |
| /admin/supplier-accounts | 儲值帳戶管理 |
| /admin/supplier-applications | 申請審批 |
| /admin/supplier-reminders | 繳費提醒記錄 |
| /supplier/dashboard | 供應商儀表板 |
| /supplier/account | 帳戶資訊與儲值 |
| /supplier/invoices | 供應商帳單 |
| /supplier/transactions | 交易記錄 |

---

## 供應商註冊資訊欄位

### 必填欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| taxId | String | 統一編號（9 碼） |
| companyName | String | 公司名稱 |
| contactPerson | String | 聯絡人姓名 |
| phone | String | 聯絡電話 |
| email | String | 電子郵件 |

### 選填欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| address | String | 公司地址 |
| industry | String | 產業類別 |
| description | String | 公司描述 |
| businessLicense | File | 營業執照（檔案上傳） |

---

## 前端頁面規劃

### 批發商端

| 頁面 | 說明 |
|------|------|
| /suppliers | 供應商列表 |
| /suppliers/[id] | 供應商詳情 |
| /suppliers/[id]/apply | 申請加入 |
| /my-applications | 我的申請 |
| /supplier-products | 供應商產品瀏覽 |

### 供應商端

| 頁面 | 說明 |
|------|------|
| /supplier/dashboard | 供應商儀表板 |
| /supplier/applications | 申請審批 |
| /supplier/products | 產品管理 |
| /supplier/settings | 供應商設定 |

### 帳號管理

| 頁面 | 說明 |
|------|------|
| /account/sub-accounts | 附屬帳號管理 |
| /account/create-sub-account | 建立附屬帳號 |

---

## 工作流程

### 1. 供應商註冊流程

```
1. 用戶註冊帳號
2. 提交供應商註冊申請
3. 管理員審批
4. 審批通過後成為供應商主帳號
5. 可開始管理產品和審批批發商申請
```

### 2. 批發商申請流程

```
1. 批發商瀏覽供應商列表
2. 選擇供應商提交申請
3. 填寫申請表單
4. 供應商審批（網頁/手機）
5. 審批通過後可開始採購
```

### 3. 附屬帳號流程

```
1. 主帳號建立附屬帳號
2. 附屬帳號設定密碼
3. 登入後受限於主帳號設定的權限
4. 主帳號可隨時停用附屬帳號
```

---

## 優先級規劃

### Phase 1: 基礎設施 (預計 1 週)
- [ ] 資料庫 Schema 擴展
- [ ] 基本 API 端點
- [ ] 供應商註冊頁面

### Phase 2: 申請系統 (預計 1 週)
- [ ] 批發商申請流程
- [ ] 供應商審批介面
- [ ] 申請狀態追蹤

### Phase 3: 產品管理 (預計 1 週)
- [ ] 供應商產品 CRUD
- [ ] 批發商產品瀏覽
- [ ] 價格顯示

### Phase 4: 帳號系統 (預計 1 週)
- [ ] 附屬帳號建立
- [ ] 權限管理
- [ ] 活動記錄

---

## 預估時間

| 階段 | 時間 | 總計 |
|------|------|------|
| Phase 1 | 1 週 | 1 週 |
| Phase 2 | 1 週 | 2 週 |
| Phase 3 | 1 週 | 3 週 |
| Phase 4 | 1 週 | 4 週 |

**總計：4 週**

---

## 風險與考量

1. **權限控制**：附屬帳號需要精細的權限控制
2. **資料隔離**：批發商只能看到已批准的供應商
3. **審批流程**：需要考慮審批時效和通知
4. **手機響應**：供應商審批需要手機友好介面

---

*最後更新：2026-03-05*

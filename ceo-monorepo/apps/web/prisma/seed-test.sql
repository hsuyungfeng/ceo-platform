-- ============================================
-- 測試環境種子資料
-- 用於整合測試，提供基本的測試資料
-- 注意：測試資料庫會在每次測試前重置
-- ============================================

-- 1. 建立測試管理員使用者
INSERT INTO users (id, email, password, name, "taxId", phone, address, "contactPerson", points, role, "createdAt", "updatedAt")
SELECT 
  'test-admin-001', 
  'test.admin@example.com', 
  '$2b$12$xFXyy72MFf3k4qTQ.vHj3OPfSMpfWoViV2zAq8/sWDTC2Z4WCSJ0q', -- Test123!
  '測試管理員', 
  '99998888', 
  '0912000001', 
  '測試地址 1 號', 
  '測試聯絡人', 
  10000, 
  'SUPER_ADMIN', 
  NOW(), 
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test.admin@example.com');

-- 2. 建立測試普通使用者
INSERT INTO users (id, email, password, name, "taxId", phone, address, "contactPerson", points, role, "createdAt", "updatedAt")
SELECT 
  'test-user-001', 
  'test.user@example.com', 
  '$2b$12$xFXyy72MFf3k4qTQ.vHj3OPfSMpfWoViV2zAq8/sWDTC2Z4WCSJ0q', -- Test123!
  '測試使用者', 
  '11112222', 
  '0912000002', 
  '測試地址 2 號', 
  '測試聯絡人', 
  5000, 
  'MEMBER', 
  NOW(), 
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test.user@example.com');

-- 3. 建立測試廠商
INSERT INTO firms (id, name, phone, address, "createdAt", "updatedAt")
SELECT 
  'test-firm-001', 
  '測試廠商有限公司', 
  '0223334444', 
  '廠商測試地址', 
  NOW(), 
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM firms WHERE id = 'test-firm-001');

-- 4. 建立測試分類
INSERT INTO categories (id, name, level, "sortOrder", "createdAt")
SELECT 'test-cat-001', '測試分類', 1, 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '測試分類');

-- 5. 建立測試產品
INSERT INTO products (
  id, 
  name, 
  description, 
  unit, 
  "categoryId", 
  "firmId", 
  "isActive", 
  "isFeatured", 
  "totalSold",
  "createdAt",
  "updatedAt"
)
SELECT 
  'test-prod-001',
  '測試產品 A',
  '這是測試產品 A 的描述',
  '個',
  'test-cat-001',
  'test-firm-001',
  true,
  false,
  0,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = '測試產品 A');

-- 6. 建立測試供應商
INSERT INTO suppliers (
  id,
  "taxId",
  "companyName",
  "contactPerson",
  phone,
  email,
  address,
  status,
  "mainAccountId",
  "industry",
  "description",
  "isVerified",
  "verifiedAt",
  "verifiedBy",
  "createdAt",
  "updatedAt"
)
SELECT 
  'test-supplier-001',
  '55556666',
  '測試供應商有限公司',
  '供應商聯絡人',
  '0912555666',
  'supplier.test@example.com',
  '供應商測試地址',
  'ACTIVE',
  'test-admin-001',
  NULL,
  NULL,
  false,
  NULL,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE "taxId" = '55556666');

-- 7. 建立測試供應商帳戶
INSERT INTO "supplier_accounts" (
  id,
  "supplierId",
  balance,
  "totalSpent",
  "billingRate",
  "isSuspended",
  "createdAt",
  "updatedAt"
)
SELECT 
  'test-account-001',
  'test-supplier-001',
  10000.00,
  0.00,
  0.002, -- 0.2%
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "supplier_accounts" WHERE "supplierId" = 'test-supplier-001');

-- 8. 建立測試供應商產品
INSERT INTO "supplier_products" (
  id,
  "supplierId",
  name,
  description,
  price,
  length,
  width,
  height,
  weight,
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT 
  'test-supplier-prod-001',
  'test-supplier-001',
  '供應商測試產品',
  '供應商測試產品描述',
  150.00,
  10.0,
  5.0,
  3.0,
  0.5,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "supplier_products" WHERE name = '供應商測試產品');

-- 9. 建立使用者-供應商關聯（主帳號）
INSERT INTO "user_suppliers" (
  id,
  "userId",
  "supplierId",
  role,
  "createdAt"
)
SELECT 
  'test-user-supplier-001',
  'test-user-001',
  'test-supplier-001',
  'MAIN_ACCOUNT',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "user_suppliers" WHERE "userId" = 'test-user-001' AND "supplierId" = 'test-supplier-001');

-- 10. 建立測試訂單
INSERT INTO orders (
  id,
  "orderNo",
  "userId",
  status,
  "totalAmount",
  "paymentMethod",
  "createdAt",
  "updatedAt"
)
SELECT 
  'test-order-001',
  'TEST-001',
  'test-user-001',
  'PENDING',
  1000.00,
  'CASH',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE "orderNo" = 'TEST-001');

-- 11. 建立測試訂單項目
INSERT INTO "order_items" (
  id,
  "orderId",
  "productId",
  quantity,
  "unitPrice",
  subtotal
)
SELECT 
  'test-order-item-001',
  'test-order-001',
  'test-prod-001',
  10,
  100.00,
  1000.00
WHERE NOT EXISTS (SELECT 1 FROM "order_items" WHERE "orderId" = 'test-order-001');

-- 12. 建立測試發票
INSERT INTO invoices (
  id,
  "invoiceNo",
  "userId",
  "billingMonth",
  "billingStartDate",
  "billingEndDate",
  "totalAmount",
  "totalItems",
  status,
  "invoiceFormat",
  "createdAt",
  "updatedAt"
)
SELECT 
  'test-invoice-001',
  'INV-TEST-001',
  'test-user-001',
  '2026-03',
  '2026-03-01 00:00:00',
  '2026-03-31 23:59:59',
  1000.00,
  1,
  'DRAFT',
  'simple',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE "invoiceNo" = 'INV-TEST-001');

-- 13. 建立測試發票行項目
INSERT INTO "invoice_line_items" (
  id,
  "invoiceId",
  "orderId",
  "productName",
  quantity,
  "unitPrice",
  subtotal,
  "createdAt",
  "updatedAt"
)
SELECT 
  'test-invoice-line-001',
  'test-invoice-001',
  'test-order-001',
  '測試產品 A',
  10,
  100.00,
  1000.00,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "invoice_line_items" WHERE "invoiceId" = 'test-invoice-001');

-- ============================================
-- 測試資料說明：
-- 1. 密碼：所有測試使用者密碼都是 Test123!
-- 2. 資料關聯：使用者 -> 訂單 -> 發票
-- 3. 供應商關聯：使用者 -> 供應商 -> 供應商產品
-- 4. 測試資料使用前綴 "test-" 以便識別
-- 5. 整合測試應在這些基礎資料上進行操作
-- ============================================
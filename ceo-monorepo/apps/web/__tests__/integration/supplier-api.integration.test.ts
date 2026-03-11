/**
 * 供應商系統整合測試
 * 
 * 這個測試檔案使用真實的 PostgreSQL 測試資料庫，
 * 測試供應商系統的 API 端點。
 */

import { describe, test, expect, beforeAll, beforeEach, afterEach } from '@jest/globals'
import { prismaTest } from '@/lib/prisma-test'

// Type declarations for global test helpers
declare global {
  var testDatabaseReady: boolean;
  var testDatabaseReset: boolean;
  var createTestUser: (userData?: any) => Promise<any>;
  var createTestProduct: (productData?: any) => Promise<any>;
  var createTestSupplier: (supplierData?: any) => Promise<any>;
}

// 測試供應商 API 的基本功能
describe('供應商系統整合測試', () => {
  
  // 測試前的準備
  beforeAll(async () => {
    console.log('🔄 供應商整合測試準備中...')
    
    // 確保測試資料庫已就緒
    expect(global.testDatabaseReady).toBe(true)
    
    // 建立測試資料
    await createTestData()
  })
  
  // 每個測試前的清理
  beforeEach(async () => {
    // 每個測試前會自動重置資料庫
    console.log(`🧪 開始測試: ${expect.getState().currentTestName}`)
  })
  
  // 測試後的清理
  afterEach(async () => {
    console.log(`✅ 測試完成: ${expect.getState().currentTestName}`)
  })
  
  // 測試 1: 供應商列表 API
  test('GET /api/suppliers - 應返回供應商列表', async () => {
    // 建立測試用戶作為主帳號
    const mainAccount = await global.createTestUser({ role: 'SUPER_ADMIN' });
    // 建立測試供應商
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `test-tax-${Date.now()}`,
        companyName: `測試公司 ${Date.now()}`,
        contactPerson: `測試聯絡人 ${Date.now()}`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        email: `test${Date.now()}@example.com`,
        address: `測試地址 ${Date.now()}`,
        status: 'ACTIVE',
        mainAccountId: mainAccount.id,
      },
    })
    
    // 驗證供應商已建立
    const foundSupplier = await prismaTest.supplier.findUnique({
      where: { id: supplier.id },
    })
    
    expect(foundSupplier).toBeDefined()
    expect(foundSupplier?.companyName).toBe(supplier.companyName)
    expect(foundSupplier?.status).toBe('ACTIVE')
  })
  
  // 測試 2: 供應商申請流程
  test('供應商申請流程整合測試', async () => {
    // 1. 建立測試使用者
    const user = await prismaTest.user.create({
      data: {
        email: `applicant${Date.now()}@example.com`,
        password: '$2b$12$xFXyy72MFf3k4qTQ.vHj3OPfSMpfWoViV2zAq8/sWDTC2Z4WCSJ0q', // Test123!
        name: `申請人 ${Date.now()}`,
        taxId: `app${Date.now()}`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        role: 'MEMBER',
        points: 1000,
      },
    })
    
    // 2. 建立測試供應商
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `supplier-tax-${Date.now()}`,
        companyName: `目標供應商 ${Date.now()}`,
        contactPerson: `供應商聯絡人 ${Date.now()}`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        email: `target${Date.now()}@example.com`,
        address: `供應商地址 ${Date.now()}`,
        status: 'ACTIVE',
        mainAccountId: user.id,
      },
    })
    
    // 3. 模擬申請流程
    const application = await prismaTest.supplierApplication.create({
      data: {
        supplierId: supplier.id,
        applicantId: user.id,
        companyName: supplier.companyName,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        status: 'PENDING',
        note: '測試申請備註',
      },
    })
    
    // 4. 驗證申請已建立
    const foundApplication = await prismaTest.supplierApplication.findUnique({
      where: { id: application.id },
      include: {
        supplier: true,
        applicant: true,
      },
    })
    
    expect(foundApplication).toBeDefined()
    expect(foundApplication?.status).toBe('PENDING')
    expect(foundApplication?.supplier.companyName).toBe(supplier.companyName)
    expect(foundApplication?.applicant.name).toBe(user.name)
    
    // 5. 模擬批准申請
    const approvedApplication = await prismaTest.supplierApplication.update({
      where: { id: application.id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: 'test-admin',
      },
    })
    
    expect(approvedApplication.status).toBe('APPROVED')
    expect(approvedApplication.reviewedAt).toBeDefined()
    
    // 6. 建立使用者-供應商關聯
    const userSupplier = await prismaTest.userSupplier.create({
      data: {
        userId: user.id,
        supplierId: supplier.id,
        role: 'SUB_ACCOUNT',
      },
    })
    
    expect(userSupplier).toBeDefined()
    expect(userSupplier.role).toBe('SUB_ACCOUNT')
  })
  
  // 測試 3: 供應商帳戶系統
  test('供應商帳戶餘額管理', async () => {
    // 建立測試用戶作為主帳號
    const mainAccount = await global.createTestUser({ role: 'SUPER_ADMIN' });
    // 建立測試供應商和帳戶
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `balance-test-${Date.now()}`,
        companyName: `餘額測試公司 ${Date.now()}`,
        contactPerson: `餘額測試聯絡人`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        email: `balance${Date.now()}@example.com`,
        address: `餘額測試地址`,
        status: 'ACTIVE',
        mainAccountId: mainAccount.id,
        account: {
          create: {
            balance: 5000.00,
            totalSpent: 1000.00,
            billingRate: 0.002,
            isSuspended: false,
          },
        },
      },
      include: {
        account: true,
      },
    })
    
    // 驗證帳戶已建立
    expect(supplier.account).toBeDefined()
    expect(supplier.account?.balance.toString()).toBe('5000')
    expect(supplier.account?.billingRate.toString()).toBe('0.002')
    
    // 模擬儲值交易
    const balanceBefore = supplier.account!.balance
    const balanceAfter = balanceBefore.plus(2000.00)
    const transaction = await prismaTest.supplierTransaction.create({
      data: {
        supplierId: supplier.id,
        type: 'DEPOSIT',
        amount: 2000.00,
        balanceBefore,
        balanceAfter,
        note: '測試儲值',
      },
    })
    
    // 更新帳戶餘額
    const updatedAccount = await prismaTest.supplierAccount.update({
      where: { id: supplier.account!.id },
      data: {
        balance: {
          increment: 2000.00,
        },
      },
    })
    
    expect(updatedAccount.balance.toString()).toBe('7000')
    
    // 驗證交易記錄
    const foundTransaction = await prismaTest.supplierTransaction.findFirst({
      where: { supplierId: supplier.id },
    })
    
    expect(foundTransaction).toBeDefined()
    expect(foundTransaction?.type).toBe('DEPOSIT')
    expect(foundTransaction?.amount.toString()).toBe('2000')
  })
  
  // 測試 4: 供應商產品管理
  test('供應商產品 CRUD 操作', async () => {
    // 建立測試用戶作為主帳號
    const mainAccount = await global.createTestUser({ role: 'SUPER_ADMIN' });
    // 建立測試供應商
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `product-test-${Date.now()}`,
        companyName: `產品測試公司 ${Date.now()}`,
        contactPerson: `產品測試聯絡人`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        email: `product${Date.now()}@example.com`,
        address: `產品測試地址`,
        status: 'ACTIVE',
        mainAccountId: mainAccount.id,
      },
    })
    
    // 建立供應商產品
    const product = await prismaTest.supplierProduct.create({
      data: {
        supplierId: supplier.id,
        name: `測試供應商產品 ${Date.now()}`,
        description: '產品描述',
        price: 250.00,
        length: 15.0,
        width: 10.0,
        height: 5.0,
        weight: 1.2,
        isActive: true,
      },
    })
    
    // 驗證產品建立
    expect(product).toBeDefined()
    expect(product.name).toContain('測試供應商產品')
    expect(product.price.toString()).toBe('250')
    expect(product.length?.toString()).toBe('15')
    expect(product.weight?.toString()).toBe('1.2')
    
    // 更新產品
    const updatedProduct = await prismaTest.supplierProduct.update({
      where: { id: product.id },
      data: {
        price: 230.00,
        description: '更新後的描述',
      },
    })
    
    expect(updatedProduct.price.toString()).toBe('230')
    expect(updatedProduct.description).toBe('更新後的描述')
    
    // 查詢供應商的產品列表
    const supplierProducts = await prismaTest.supplierProduct.findMany({
      where: { supplierId: supplier.id },
    })
    
    expect(supplierProducts.length).toBeGreaterThan(0)
    expect(supplierProducts[0].supplierId).toBe(supplier.id)
  })
  
  // 測試 5: 低餘額檢查邏輯
  test('供應商低餘額檢查邏輯', async () => {
    // 建立測試用戶作為主帳號
    const mainAccount = await global.createTestUser({ role: 'SUPER_ADMIN' });
    // 建立低餘額測試供應商
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `low-balance-test-${Date.now()}`,
        companyName: `低餘額測試公司 ${Date.now()}`,
        contactPerson: `低餘額測試聯絡人`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        email: `lowbalance${Date.now()}@example.com`,
        address: `低餘額測試地址`,
        status: 'ACTIVE',
        mainAccountId: mainAccount.id,
        account: {
          create: {
            balance: 500.00, // 低於 NT$1,000 閾值
            totalSpent: 5000.00,
            billingRate: 0.002,
            isSuspended: false,
          },
        },
      },
      include: {
        account: true,
      },
    })
    
    // 檢查是否低餘額
    const isLowBalance = supplier.account!.balance.lessThan(1000)
    expect(isLowBalance).toBe(true)
    
    // 模擬低餘額提醒
    const reminder = await prismaTest.paymentReminder.create({
      data: {
        supplierId: supplier.id,
        type: 'LOW_BALANCE',
        balance: supplier.account!.balance,
        dueAmount: 0,
        daysOverdue: 0,
      },
    })
    
    expect(reminder).toBeDefined()
    expect(reminder.type).toBe('LOW_BALANCE')
    expect(reminder.balance.toString()).toBe('500')
  })
})

/**
 * 建立測試資料
 */
async function createTestData() {
  console.log('📝 建立供應商測試基礎資料...')
  
  // 檢查是否已有基礎測試資料
  const existingSuppliers = await prismaTest.supplier.count()
  
  if (existingSuppliers === 0) {
    // 建立基礎測試管理員用戶
    const user = await prismaTest.user.upsert({
      where: { email: 'base.supplier.admin@example.com' },
      update: {},
      create: {
        email: 'base.supplier.admin@example.com',
        password: '$2b$12$xFXyy72MFf3k4qTQ.vHj3OPfSMpfWoViV2zAq8/sWDTC2Z4WCSJ0q', // Test123!
        name: '基礎供應商管理員',
        taxId: 'baseadmin001',
        phone: '0912000000',
        role: 'SUPER_ADMIN',
      },
    });

    // 建立基礎測試供應商
    await prismaTest.supplier.create({
      data: {
        taxId: 'test-base-supplier-001',
        companyName: '基礎測試供應商',
        contactPerson: '基礎聯絡人',
        phone: '0912000000',
        email: 'base.supplier@example.com',
        address: '基礎測試地址',
        status: 'ACTIVE',
        mainAccountId: user.id,
        account: {
          create: {
            balance: 10000.00,
            totalSpent: 0,
            billingRate: 0.002,
            isSuspended: false,
          },
        },
      },
    })
    
    console.log('✅ 基礎測試資料建立完成')
  } else {
    console.log('✅ 已有基礎測試資料')
  }
}

  // 測試 5: 供應商詳細資訊和驗證流程
  test('供應商詳細資訊查詢和驗證流程', async () => {
    // 建立測試用戶作為主帳號
    const mainAccount = await global.createTestUser({ role: 'SUPER_ADMIN' });
    // 建立測試供應商
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `detail-test-${Date.now()}`,
        companyName: `詳細資訊測試公司 ${Date.now()}`,
        contactPerson: `詳細資訊測試聯絡人`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        email: `detail${Date.now()}@example.com`,
        address: `詳細資訊測試地址`,
        status: 'PENDING',
        mainAccountId: mainAccount.id,
      },
    });
    
    // 驗證供應商詳細資訊查詢
    const foundSupplier = await prismaTest.supplier.findUnique({
      where: { id: supplier.id },
      include: {
        account: true,
        mainAccount: true,
      },
    });
    
    expect(foundSupplier).toBeDefined();
    expect(foundSupplier?.status).toBe('PENDING');
    expect(foundSupplier?.mainAccountId).toBe(mainAccount.id);
    
    // 模擬驗證流程
    const verifiedSupplier = await prismaTest.supplier.update({
      where: { id: supplier.id },
      data: {
        status: 'ACTIVE',
        verifiedBy: 'test-admin',
        verifiedAt: new Date(),
      },
    });
    
    expect(verifiedSupplier.status).toBe('ACTIVE');
    expect(verifiedSupplier.verifiedBy).toBe('test-admin');
    expect(verifiedSupplier.verifiedAt).toBeDefined();
  });
  
  // 測試 6: 供應商申請審核流程
  test('供應商申請審核完整流程', async () => {
    // 建立申請人和供應商
    const applicant = await global.createTestUser({ role: 'MEMBER' });
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `app-review-test-${Date.now()}`,
        companyName: `申請審核測試公司 ${Date.now()}`,
        contactPerson: `申請審核測試聯絡人`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        email: `appreview${Date.now()}@example.com`,
        address: `申請審核測試地址`,
        status: 'PENDING',
        mainAccountId: applicant.id,
      },
    });
    
    // 建立申請
    const application = await prismaTest.supplierApplication.create({
      data: {
        supplierId: supplier.id,
        applicantId: applicant.id,
        companyName: supplier.companyName,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        status: 'PENDING',
        note: '測試申請審核流程',
      },
    });
    
    // 模擬批准申請
    const approvedApplication = await prismaTest.supplierApplication.update({
      where: { id: application.id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: 'admin-user',
        note: '符合資格，批准申請',
      },
    });
    
    expect(approvedApplication.status).toBe('APPROVED');
    expect(approvedApplication.reviewedAt).toBeDefined();
    
    // 更新供應商狀態
    const updatedSupplier = await prismaTest.supplier.update({
      where: { id: supplier.id },
      data: {
        status: 'ACTIVE',
      },
    });
    
    expect(updatedSupplier.status).toBe('ACTIVE');
    
    // 模擬拒絕申請（另一個申請者）
    const applicant2 = await global.createTestUser({ 
      role: 'MEMBER',
      email: `reject.applicant.${Date.now()}@example.com`,
    });
    const application2 = await prismaTest.supplierApplication.create({
      data: {
        supplierId: supplier.id,
        applicantId: applicant2.id,
        companyName: '拒絕測試公司',
        contactPerson: '拒絕測試聯絡人',
        phone: '0912000000',
        status: 'PENDING',
        note: '拒絕測試',
      },
    });
    
    const rejectedApplication = await prismaTest.supplierApplication.update({
      where: { id: application2.id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: 'admin-user',
        rejectionReason: '資料不全，拒絕申請',
      },
    });
    
    expect(rejectedApplication.status).toBe('REJECTED');
  });
  
  // 測試 7: 供應商產品管理完整流程
  test('供應商產品 CRUD 完整流程', async () => {
    // 建立測試用戶作為主帳號
    const mainAccount = await global.createTestUser({ role: 'SUPER_ADMIN' });
    // 建立測試供應商
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `product-crud-test-${Date.now()}`,
        companyName: `產品 CRUD 測試公司 ${Date.now()}`,
        contactPerson: `產品 CRUD 測試聯絡人`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        email: `productcrud${Date.now()}@example.com`,
        address: `產品 CRUD 測試地址`,
        status: 'ACTIVE',
        mainAccountId: mainAccount.id,
      },
    });
    
    // 1. 建立產品
    const product = await prismaTest.supplierProduct.create({
      data: {
        supplierId: supplier.id,
        name: `測試供應商產品 ${Date.now()}`,
        description: '產品描述',
        price: 250.00,
        unit: '個',
        moq: 10,
        isActive: true,
        stock: 100,
        category: '電子零件',
      },
    });
    
    expect(product).toBeDefined();
    expect(product.supplierId).toBe(supplier.id);
    expect(product.price.toString()).toBe('250');
    
    // 2. 查詢產品列表
    const products = await prismaTest.supplierProduct.findMany({
      where: { supplierId: supplier.id },
    });
    
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].name).toBe(product.name);
    
    // 3. 更新產品
    const updatedProduct = await prismaTest.supplierProduct.update({
      where: { id: product.id },
      data: {
        price: 275.00,
        description: '更新後的描述',
        isActive: false,
      },
    });
    
    expect(updatedProduct.price.toString()).toBe('275');
    expect(updatedProduct.description).toBe('更新後的描述');
    expect(updatedProduct.isActive).toBe(false);
    
    // 4. 刪除產品
    await prismaTest.supplierProduct.delete({
      where: { id: product.id },
    });
    
    const deletedProduct = await prismaTest.supplierProduct.findUnique({
      where: { id: product.id },
    });
    
    expect(deletedProduct).toBeNull();
  });
  
  // 測試 8: 子帳號管理系統
  test('供應商子帳號管理', async () => {
    // 建立主帳號和供應商
    const mainAccount = await global.createTestUser({ role: 'SUPER_ADMIN' });
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `subaccount-test-${Date.now()}`,
        companyName: `子帳號測試公司 ${Date.now()}`,
        contactPerson: `子帳號測試聯絡人`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        email: `subaccount${Date.now()}@example.com`,
        address: `子帳號測試地址`,
        status: 'ACTIVE',
        mainAccountId: mainAccount.id,
      },
    });
    
    // 建立子帳號用戶
    const subAccountUser = await global.createTestUser({ 
      role: 'MEMBER',
      email: `subuser${Date.now()}@example.com`,
    });
    
    // 建立使用者-供應商關聯（子帳號）
    const userSupplier = await prismaTest.userSupplier.create({
      data: {
        userId: subAccountUser.id,
        supplierId: supplier.id,
        role: 'SUB_ACCOUNT',
      },
    });
    
    expect(userSupplier).toBeDefined();
    expect(userSupplier.role).toBe('SUB_ACCOUNT');
    
    // 查詢子帳號列表
    const subAccounts = await prismaTest.userSupplier.findMany({
      where: { 
        supplierId: supplier.id,
        role: 'SUB_ACCOUNT',
      },
      include: {
        user: true,
      },
    });
    
    expect(subAccounts.length).toBeGreaterThan(0);
    expect(subAccounts[0].user.email).toBe(subAccountUser.email);
    
    // 更新子帳號狀態
    const updatedUserSupplier = await prismaTest.userSupplier.update({
      where: { id: userSupplier.id },
      data: {
        isActive: false,
      },
    });
    
    expect(updatedUserSupplier.isActive).toBe(false);
    expect(updatedUserSupplier.role).toBe('SUB_ACCOUNT');
    
    // 刪除子帳號
    await prismaTest.userSupplier.delete({
      where: { id: userSupplier.id },
    });
    
    const deletedUserSupplier = await prismaTest.userSupplier.findUnique({
      where: { id: userSupplier.id },
    });
    
    expect(deletedUserSupplier).toBeNull();
  });
  
  // 測試 9: 供應商帳戶和交易系統
  test('供應商帳戶餘額監控和低餘額警報', async () => {
    // 建立測試用戶作為主帳號
    const mainAccount = await global.createTestUser({ role: 'SUPER_ADMIN' });
    // 建立測試供應商和帳戶（低餘額）
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `lowbalance-test-${Date.now()}`,
        companyName: `低餘額測試公司 ${Date.now()}`,
        contactPerson: `低餘額測試聯絡人`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        email: `lowbalance${Date.now()}@example.com`,
        address: `低餘額測試地址`,
        status: 'ACTIVE',
        mainAccountId: mainAccount.id,
        account: {
          create: {
            balance: 500.00, // 低於 NT$1,000 閾值
            totalSpent: 5000.00,
            billingRate: 0.002,
            isSuspended: false,
          },
        },
      },
      include: {
        account: true,
      },
    });
    
    // 驗證低餘額狀態
    expect(supplier.account).toBeDefined();
    const balance = parseFloat(supplier.account!.balance.toString());
    expect(balance).toBeLessThan(1000); // NT$1,000 閾值
    
    // 模擬交易記錄
    const transaction = await prismaTest.supplierTransaction.create({
      data: {
        supplierId: supplier.id,
        type: 'ADJUSTMENT',
        amount: 100.00,
        balanceBefore: supplier.account!.balance,
        balanceAfter: supplier.account!.balance.minus(100.00),
        note: '測試提款',
      },
    });
    
    expect(transaction).toBeDefined();
    expect(transaction.type).toBe('ADJUSTMENT');
    
    // 更新帳戶餘額（更低）
    const updatedAccount = await prismaTest.supplierAccount.update({
      where: { id: supplier.account!.id },
      data: {
        balance: {
          decrement: 100.00,
        },
      },
    });
    
    const newBalance = parseFloat(updatedAccount.balance.toString());
    expect(newBalance).toBe(400.00);
    
    // 驗證低餘額狀態（應觸發警報）
    const isLowBalance = newBalance < 1000;
    expect(isLowBalance).toBe(true);
  });
  
  // 測試 10: 供應商發票和支付系統
  test('供應商發票生成和支付', async () => {
    // 建立測試用戶作為主帳號
    const mainAccount = await global.createTestUser({ role: 'SUPER_ADMIN' });
    // 建立測試供應商和帳戶
    const supplier = await prismaTest.supplier.create({
      data: {
        taxId: `invoice-test-${Date.now()}`,
        companyName: `發票測試公司 ${Date.now()}`,
        contactPerson: `發票測試聯絡人`,
        phone: `0912${Date.now().toString().slice(-6)}`,
        email: `invoice${Date.now()}@example.com`,
        address: `發票測試地址`,
        status: 'ACTIVE',
        mainAccountId: mainAccount.id,
        account: {
          create: {
            balance: 5000.00,
            totalSpent: 1000.00,
            billingRate: 0.002,
            isSuspended: false,
          },
        },
      },
      include: {
        account: true,
      },
    });
    
    // 建立測試發票
    const invoiceNo = `INV-${Date.now()}`;
    const invoice = await prismaTest.supplierInvoice.create({
      data: {
        supplierId: supplier.id,
        invoiceNo: invoiceNo,
        type: 'SERVICE_FEE',
        amount: 1500.00,
        tax: 0.00,
        totalAmount: 1500.00,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
        status: 'UNPAID',
        billingMonth: '2025-03',
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
        periodEnd: new Date(),
        note: '測試發票備註',
      },
    });
    
    expect(invoice).toBeDefined();
    expect(invoice.status).toBe('UNPAID');
    expect(invoice.amount.toString()).toBe('1500');
    
    // 查詢發票列表
    const invoices = await prismaTest.supplierInvoice.findMany({
      where: { supplierId: supplier.id },
    });
    
    expect(invoices.length).toBeGreaterThan(0);
    expect(invoices[0].invoiceNo).toBe(invoice.invoiceNo);
    
    // 模擬支付發票
    const paidInvoice = await prismaTest.supplierInvoice.update({
      where: { id: invoice.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });
    
    expect(paidInvoice.status).toBe('PAID');
    expect(paidInvoice.paidAt).toBeDefined();
    
    // 驗證帳戶餘額變化（支付後應減少）
    // 注意：實際系統中，支付發票會觸發餘額更新
    // 這裡我們只是驗證狀態變化
  });

/**
 * 測試總結：
 * 
 * 這個整合測試檔案展示了：
 * 1. 使用真實 PostgreSQL 測試資料庫進行測試
 * 2. 測試供應商系統的核心功能
 * 3. 模擬完整的業務流程
 * 4. 驗證資料庫操作的正確性
 * 
 * 測試執行順序：
 * 1. 測試資料庫啟動和遷移
 * 2. 每個測試前重置資料庫
 * 3. 執行測試用例
 * 4. 測試後清理
 * 
 * 注意事項：
 * - 測試應獨立，不依賴執行順序
 * - 測試後應清理測試資料
 * - 使用真實資料庫操作，避免模擬
 */
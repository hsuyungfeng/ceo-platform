/**
 * 整合測試全局設定
 * 
 * 這個檔案負責：
 * 1. 載入測試環境變數
 * 2. 啟動測試資料庫連接
 * 3. 設定全局測試夾具
 * 4. 測試後的清理工作
 */

const dotenv = require('dotenv')
const { 
  prismaTest, 
  checkTestDatabaseConnection, 
  applyTestMigrations,
  resetTestDatabase 
} = require('@/lib/prisma-test')

// 載入測試環境變數
dotenv.config({ path: '.env.test.local' })

// 設置測試環境變數
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-integration-tests-only'
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-integration-tests-only'
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-for-integration-tests-only'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// 設置測試資料庫環境變數（如果未設置）
if (!process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL_TEST = 'postgresql://ceo_test:TestPassword123!@localhost:5433/ceo_platform_test'
}

// 全局測試變數
global.testDatabaseReady = false
global.testDatabaseReset = false

/**
 * 設定 Jest 全局鉤子
 */
beforeAll(async () => {
  console.log('🚀 整合測試環境初始化...')
  
  try {
    // 檢查測試資料庫連接
    console.log('🔌 檢查測試資料庫連接...')
    const connected = await checkTestDatabaseConnection()
    
    if (!connected) {
      console.error('❌ 測試資料庫連接失敗')
      throw new Error('測試資料庫連接失敗')
    }
    
    console.log('✅ 測試資料庫連接成功')
    
    // 應用最新遷移
    console.log('🔧 應用資料庫遷移...')
    await applyTestMigrations()
    console.log('✅ 資料庫遷移完成')
    
    // 標記資料庫已準備就緒
    global.testDatabaseReady = true
    
    console.log('🎉 整合測試環境初始化完成')
  } catch (error) {
    console.error('❌ 整合測試環境初始化失敗:', error)
    throw error
  }
}, 30000) // 30 秒超時

/**
 * 每個測試前重置資料庫
 */
beforeEach(async () => {
  if (!global.testDatabaseReady) {
    throw new Error('測試資料庫未準備就緒')
  }
  
  // 只有在需要重置時才重置（避免不必要的重置）
  if (!global.testDatabaseReset) {
    console.log('🧹 重置測試資料庫...')
    await resetTestDatabase()
    global.testDatabaseReset = true
  }
})

/**
 * 每個測試後標記需要重置
 */
afterEach(() => {
  global.testDatabaseReset = false
})

/**
 * 所有測試完成後清理
 */
afterAll(async () => {
  console.log('🧹 清理整合測試環境...')
  
  // 注意：我們不關閉 Prisma 連接，因為它是全域的
  // 並且會在 Jest 進程結束時自動關閉
  
  console.log('✅ 整合測試環境清理完成')
})

/**
 * 全局 afterEach：在每個測試之後執行
 */
afterEach(async () => {
  console.log(`✅ 測試完成: ${expect.getState().currentTestName}`)
  
  // 可選：在這裡可以添加測試後的清理邏輯
})

/**
 * 全局 afterAll：在所有測試之後執行一次
 */
afterAll(async () => {
  console.log('🧹 整合測試環境清理...')
  
  try {
    // 關閉 Prisma 連接
    await prismaTest.$disconnect()
    console.log('✅ Prisma 連接已關閉')
    
    // 重置全局變數
    global.testDatabaseReady = false
    global.testFixtures = {}
    
    console.log('🎉 整合測試環境清理完成')
  } catch (error) {
    console.error('❌ 整合測試環境清理失敗:', error)
  }
}, 30000) // 30秒超時

/**
 * 測試輔助函數：建立測試用戶
 */
global.createTestUser = async (userData = {}) => {
  const defaultUser = {
    email: `test.user.${Date.now()}@example.com`,
    password: '$2a$12$K3V/BzZ8.5jQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQj', // Test123!
    name: `Test User ${Date.now()}`,
    taxId: `test${Date.now()}`,
    phone: `0912${Date.now().toString().slice(-6)}`,
    role: 'MEMBER',
    points: 1000,
    ...userData,
  }
  
  return await prismaTest.user.create({
    data: defaultUser,
  })
}

/**
 * 測試輔助函數：建立測試產品
 */
global.createTestProduct = async (productData = {}) => {
  // 創建測試類別（如果不存在）
  let category = await prismaTest.category.findFirst({
    where: { name: 'Test Category' }
  });
  
  if (!category) {
    category = await prismaTest.category.create({
      data: {
        name: 'Test Category',
        isActive: true
      }
    });
  }
  
  // 創建測試廠商（如果不存在）
  let firm = await prismaTest.firm.findFirst({
    where: { name: 'Test Firm' }
  });
  
  if (!firm) {
    firm = await prismaTest.firm.create({
      data: {
        name: 'Test Firm',
        isActive: true
      }
    });
  }
  
  const defaultProduct = {
    name: `Test Product ${Date.now()}`,
    description: `Test product description ${Date.now()}`,
    unit: '個',
    categoryId: category.id,
    firmId: firm.id,
    isActive: true,
    isFeatured: false,
    totalSold: 0,
    ...productData,
  }
  
  const product = await prismaTest.product.create({
    data: defaultProduct,
  });
  
  // 創建價格層級
  await prismaTest.priceTier.create({
    data: {
      productId: product.id,
      minQty: 1,
      price: 100
    }
  });
  
  return product;
}

/**
 * 測試輔助函數：建立測試供應商
 */
global.createTestSupplier = async (supplierData = {}) => {
  // 先創建一個用戶作為主帳戶
  const mainAccount = await global.createTestUser({
    email: `supplier.account.${Date.now()}@example.com`,
    name: `Supplier Account ${Date.now()}`,
    role: 'MEMBER'
  });
  
  const defaultSupplier = {
    taxId: `test${Date.now()}`,
    companyName: `Test Supplier ${Date.now()}`,
    contactPerson: `Test Contact ${Date.now()}`,
    phone: `0912${Date.now().toString().slice(-6)}`,
    email: `supplier.${Date.now()}@example.com`,
    address: `Test Address ${Date.now()}`,
    status: 'ACTIVE',
    mainAccountId: mainAccount.id,
    ...supplierData,
  }
  
  return await prismaTest.supplier.create({
    data: defaultSupplier,
  })
}

console.log('📋 整合測試全局設定載入完成')
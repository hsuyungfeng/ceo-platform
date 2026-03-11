#!/usr/bin/env node

/**
 * 測試環境驗證腳本
 * 
 * 這個腳本用於驗證測試資料庫環境是否正常運作。
 * 執行順序：
 * 1. 啟動測試資料庫容器
 * 2. 檢查連接
 * 3. 應用遷移
 * 4. 執行簡單的測試查詢
 */

const { execSync } = require('child_process')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

console.log('🔍 開始測試環境驗證...')
console.log('='.repeat(60))

try {
  (async () => {
    const TEST_DATABASE_URL = 'postgresql://ceo_test:TestPassword123!@localhost:5433/ceo_platform_test'
  // 步驟 1: 檢查 Docker 是否運行
  console.log('1. 檢查 Docker 服務...')
  try {
    execSync('docker version', { stdio: 'pipe' })
    console.log('   ✅ Docker 服務正常')
  } catch (error) {
    console.log('   ❌ Docker 服務未運行或無法訪問')
    console.log('   請確保 Docker 已安裝並正在運行')
    process.exit(1)
  }

  // 步驟 2: 啟動測試資料庫容器
  console.log('2. 啟動測試資料庫容器...')
  try {
    execSync('docker-compose -f docker-compose.test.yml up -d', { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log('   ✅ 測試資料庫容器已啟動')
    
    // 等待容器健康檢查通過
    console.log('   ⏳ 等待容器健康檢查...')
    execSync('sleep 5')
  } catch (error) {
    console.log('   ❌ 啟動測試資料庫容器失敗')
    console.log('   錯誤訊息:', error.message)
    process.exit(1)
  }

  // 步驟 3: 等待資料庫準備就緒
  console.log('3. 等待資料庫準備就緒...')
  let retries = 10
  let connected = false
  
  while (retries > 0 && !connected) {
    try {
      execSync(`docker exec ceo-postgres-test pg_isready -U ceo_test -d ceo_platform_test`, {
        stdio: 'pipe',
        timeout: 5000
      })
      connected = true
      console.log('   ✅ 資料庫連接正常')
    } catch (error) {
      console.log(`   ⏳ 等待資料庫... (剩餘嘗試次數: ${retries})`)
      retries--
      if (retries > 0) {
        // 等待 3 秒後重試
        execSync('sleep 3')
      }
    }
  }
  
  if (!connected) {
    console.log('   ❌ 資料庫連接失敗')
    console.log('   請檢查:')
    console.log('   1. Docker 容器是否正常運行: docker-compose -f docker-compose.test.yml ps')
    console.log('   2. 容器日誌: docker-compose -f docker-compose.test.yml logs postgres-test')
    process.exit(1)
  }

  // 步驟 4: 應用 Prisma 遷移
  console.log('4. 應用資料庫遷移...')
  try {
    execSync('node_modules/.bin/prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL }
    })
    console.log('   ✅ 資料庫遷移完成')
  } catch (error) {
    console.log('   ❌ 資料庫遷移失敗')
    console.log('   錯誤訊息:', error.message)
    process.exit(1)
  }

  // 步驟 5: 測試 Prisma 客戶端連接
  console.log('5. 測試 Prisma 客戶端連接...')
  
  try {
    // 使用適配器建立 Prisma 客戶端（與主專案保持一致）
    const pool = new Pool({
      connectionString: TEST_DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    })
    
    const adapter = new PrismaPg(pool)
    
    const prisma = new PrismaClient({
      adapter,
      log: ['error'],
      errorFormat: 'minimal',
    })
    
    // 執行簡單查詢
    const result = await prisma.$queryRaw`SELECT 1 as test_value`
    console.log('   ✅ Prisma 客戶端連接正常')
    console.log('   測試查詢結果:', result)
    
    // 檢查表格數量
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as table_count 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `
    console.log('   資料庫表格數量:', tableCount[0]?.table_count || 0)
    
    await prisma.$disconnect()
  } catch (error) {
    console.log('   ❌ Prisma 客戶端連接失敗')
    console.log('   錯誤訊息:', error.message)
    process.exit(1)
  }

  // 步驟 6: 插入測試資料
  console.log('6. 插入測試資料...')
  try {
    execSync(`cat prisma/seed-test.sql | docker exec -i ceo-postgres-test psql -U ceo_test -d ceo_platform_test`, {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log('   ✅ 測試資料插入完成')
  } catch (error) {
    console.log('   ⚠️  測試資料插入失敗（可能已存在）')
    console.log('   錯誤訊息:', error.message)
  }

  // 步驟 7: 執行簡單的整合測試
  console.log('7. 執行整合測試驗證...')
  try {
    execSync('node_modules/.bin/jest __tests__/integration/supplier-api.integration.test.ts --config jest.config.integration.js --testNamePattern="應返回供應商列表"', {
      stdio: 'inherit',
      cwd: process.cwd(),
      timeout: 30000,
      env: { ...process.env, NODE_ENV: 'test', DATABASE_URL_TEST: TEST_DATABASE_URL }
    })
    console.log('   ✅ 整合測試驗證通過')
  } catch (error) {
    console.log('   ⚠️  整合測試驗證失敗')
    console.log('   錯誤訊息:', error.message)
    console.log('   注意：這可能只是測試本身的問題，環境可能仍然正常')
  }

  console.log('='.repeat(60))
  console.log('🎉 測試環境驗證完成！')
  console.log('')
  console.log('可用命令:')
  console.log('  • 啟動測試資料庫: npm run test:db:start')
  console.log('  • 停止測試資料庫: npm run test:db:stop')
  console.log('  • 執行整合測試: npm run test:integration')
  console.log('  • 執行特定測試: npm run test:integration -- --testNamePattern="測試名稱"')
  console.log('')
  console.log('下一步:')
  console.log('  1. 運行完整的整合測試: npm run test:integration')
  console.log('  2. 開發新的整合測試: 在 __tests__/integration/ 目錄建立 .integration.test.ts 檔案')
  console.log('  3. 查看測試覆蓋率: npm run test:integration:coverage')

})()
} catch (error) {
  console.error('❌ 測試環境驗證過程發生錯誤:', error)
  process.exit(1)
}
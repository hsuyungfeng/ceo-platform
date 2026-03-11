/**
 * 測試環境專用 Prisma 客戶端配置
 * 
 * 這個模組提供測試環境專用的 PrismaClient 實例，
 * 使用 DATABASE_URL_TEST 環境變數連接到測試資料庫。
 * 測試資料庫應該是獨立的，避免與開發環境衝突。
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// 測試環境專用的全域變數
const testGlobalForPrisma = globalThis as unknown as {
  prismaTest: PrismaClient | undefined
}

// 測試環境連接字串
// 優先使用 DATABASE_URL_TEST，如果未設定則使用預設的測試連接
const TEST_DATABASE_URL = process.env.DATABASE_URL_TEST || 
  'postgresql://ceo_test:TestPassword123!@localhost:5433/ceo_platform_test'

let prismaTestInstance: PrismaClient

// 建立或取得測試 Prisma 實例
if (!testGlobalForPrisma.prismaTest) {
  console.log('🚀 建立測試 PrismaClient 實例，連接至:', 
    TEST_DATABASE_URL.replace(/:([^:@]+)@/, ':****@')) // 隱藏密碼

  const pool = new Pool({
    connectionString: TEST_DATABASE_URL,
    max: 10, // 測試環境減少連接數
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  const adapter = new PrismaPg(pool)

  prismaTestInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'test' ? ['warn', 'error'] : ['error'],
    // 測試環境開啟詳細錯誤訊息
    errorFormat: 'pretty',
    // 禁止批量操作，確保測試可追蹤
    // batch: false,
  })

  // 在測試環境中，我們希望每次測試都能取得新的實例
  // 但為了效能，我們還是會快取在 Node.js 全域中
  if (process.env.NODE_ENV === 'test') {
    testGlobalForPrisma.prismaTest = prismaTestInstance
  }
} else {
  prismaTestInstance = testGlobalForPrisma.prismaTest
}

/**
 * 建立全新的 PrismaClient 實例（用於隔離測試）
 */
export function createTestPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: TEST_DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: ['error'],
    errorFormat: 'minimal',
  })
}

/**
 * 重置測試資料庫（用於測試前的清理）
 */
export async function resetTestDatabase(): Promise<void> {
  console.log('🧹 重置測試資料庫...')
  
  try {
    // 刪除所有表格中的資料，但保留表格結構
    // 注意：這會按照外鍵約束的順序刪除
    const tablenames = await prismaTestInstance.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations';`

    // 禁用外鍵約束檢查
    await prismaTestInstance.$executeRaw`SET session_replication_role = 'replica';`

    for (const { tablename } of tablenames) {
      await prismaTestInstance.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
      )
    }

    // 重新啟用外鍵約束檢查
    await prismaTestInstance.$executeRaw`SET session_replication_role = 'origin';`
    
    console.log('✅ 測試資料庫重置完成')
  } catch (error) {
    console.error('❌ 重置測試資料庫失敗:', error)
    throw error
  }
}

/**
 * 應用 Prisma 遷移到測試資料庫（確保 schema 最新）
 */
export async function applyTestMigrations(): Promise<void> {
  console.log('🔧 應用 Prisma 遷移到測試資料庫...')
  
  // 在測試環境中，我們通常使用 db push 而不是 migrate
  // 因為測試資料庫是臨時的，不需要保留遷移歷史
  const { execSync } = require('child_process')
  
  try {
    // 暫時設置 DATABASE_URL 環境變數
    const originalDatabaseUrl = process.env.DATABASE_URL
    process.env.DATABASE_URL = TEST_DATABASE_URL
    
    // 使用 prisma db push 應用 schema（不保留遷移歷史）
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
    
    // 恢復原始 DATABASE_URL
    process.env.DATABASE_URL = originalDatabaseUrl
    
    console.log('✅ 測試資料庫遷移完成')
  } catch (error) {
    console.error('❌ 測試資料庫遷移失敗:', error)
    throw error
  }
}

/**
 * 檢查測試資料庫連接
 */
export async function checkTestDatabaseConnection(): Promise<boolean> {
  try {
    await prismaTestInstance.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('❌ 測試資料庫連接失敗:', error)
    return false
  }
}

// 導出測試 Prisma 實例
export const prismaTest = prismaTestInstance
export default prismaTest
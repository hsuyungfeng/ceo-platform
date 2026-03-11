/**
 * Jest 環境變數設置
 * 
 * 在測試運行前設置環境變數
 */

const dotenv = require('dotenv')

// 載入測試環境變數
dotenv.config({ path: '.env.test.local' })

// 設置測試環境變數
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-integration-tests-only'
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-for-integration-tests-only'
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-nextauth-secret-for-integration-tests-only'
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
process.env.CRON_SECRET = process.env.CRON_SECRET || 'test-cron-secret-2026'
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 're_dummy_test_key'
process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'test@example.com'
process.env.EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'reply@example.com'

// 設置資料庫連接（使用測試資料庫）
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST || 'postgresql://ceo_test:TestPassword123!@localhost:5433/ceo_platform_test'

console.log('✅ 測試環境變數已設置')
console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '已設置' : '未設置'}`)
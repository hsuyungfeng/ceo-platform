/**
 * 整合測試專用 Jest 配置
 * 
 * 這個配置用於執行需要真實資料庫的整合測試，
 * 使用 Docker 測試 PostgreSQL 資料庫。
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // 使用整合測試的 setup 檔案
  setupFilesAfterEnv: ['<rootDir>/jest-setup-integration.cjs'],
  
  // 使用 node 環境而不是 jsdom（整合測試不需要 DOM）
  testEnvironment: 'jest-environment-node',
  
  // 轉換忽略模式
  transformIgnorePatterns: [
    '/node_modules/(?!(next-auth|@auth/core)/)',
  ],
  
  // 模組名稱映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@ceo/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@ceo/api-client$': '<rootDir>/../../packages/api-client/src/index.ts',
    
    // 在整合測試中，使用真實的 Prisma 客戶端而不是模擬
    '^@/lib/prisma$': '<rootDir>/src/lib/prisma-test.ts',
  },
  
  // 只執行整合測試檔案
  testMatch: [
    '**/__tests__/integration/**/*.[jt]s?(x)',
    '**/__tests__/**/*.integration.[jt]s?(x)',
    '**/?(*.)+(spec.integration|test.integration).[jt]s?(x)',
  ],
  
  // 測試檔案匹配排除
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/unit/',
    '/__tests__/e2e/',
  ],
  
  // 收集測試覆蓋範圍
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  
  // 測試覆蓋閾值（整合測試可以稍低）
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  
  // 測試超時時間（整合測試可能需要更長時間）
  testTimeout: 30000, // 30秒
  
  // 最大並行測試數（資料庫測試建議順序執行）
  maxWorkers: 1,
  
  // 顯示詳細測試結果
  verbose: true,
  

}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
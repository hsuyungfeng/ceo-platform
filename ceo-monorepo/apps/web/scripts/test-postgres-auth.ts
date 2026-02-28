#!/usr/bin/env npx tsx

/**
 * PostgreSQL + Prisma Authentication Test
 * Tests core authentication functions with PostgreSQL backend
 */

// Load environment variables before importing anything else
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Debug: Check if DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}
console.log('✅ DATABASE_URL found:', process.env.DATABASE_URL.split('@')[0] + '@***');

import {
  findUserByTaxId,
  findUserByEmail,
  findUserById,
  verifyPassword,
  isUserActive,
  createUser,
  createOAuthAccount,
  findOAuthAccount,
} from '@/lib/prisma-auth';

// Test data
const TEST_USER = {
  taxId: '12345678',
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
  firmName: 'Test Company',
  role: 'MEMBER',
  status: 'ACTIVE',
};

const TEST_OAUTH = {
  provider: 'google',
  providerId: 'google_12345',
  email: 'oauth@example.com',
  name: 'OAuth Test User',
  accessToken: 'test_access_token_12345',
};

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(type: 'success' | 'error' | 'info' | 'test', message: string) {
  const symbols = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    test: '🧪',
  };

  const colorMap = {
    success: colors.green,
    error: colors.red,
    info: colors.blue,
    test: colors.yellow,
  };

  console.log(`${colorMap[type]}${symbols[type]} ${message}${colors.reset}`);
}

async function testPostgresAuth() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 PostgreSQL + Prisma 認證層測試開始');
  console.log('='.repeat(60) + '\n');

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // 測試 1: 資料庫連接
    log('test', '測試 1: 檢查 PostgreSQL 連接...');
    try {
      const testConnection = await findUserByTaxId('test_connection_check_12345');
      log('success', '✓ PostgreSQL 連接成功');
      testsPassed++;
    } catch (error) {
      log('error', `✗ PostgreSQL 連接失敗: ${(error as any)?.message || '未知錯誤'}`);
      log('info', '確保 PostgreSQL 伺服器正在運行且資料庫已初始化');
      testsFailed++;
      return;
    }

    // 測試 2: 建立測試用戶
    log('test', '測試 2: 建立測試用戶...');
    try {
      const newUser = await createUser({
        taxId: TEST_USER.taxId,
        email: TEST_USER.email,
        password: TEST_USER.password,
        name: TEST_USER.name,
        firmName: TEST_USER.firmName,
        points: 0,
        role: TEST_USER.role,
        status: TEST_USER.status,
        emailVerified: false,
        phone: null,
        address: null,
        contactPerson: null,
      });
      log('success', `✓ 用戶已建立 (ID: ${newUser.id})`);
      testsPassed++;

      const createdUserId = newUser.id;

      // 測試 3: 根據 taxId 查找用戶
      log('test', '測試 3: 根據 taxId 查找用戶...');
      const userByTaxId = await findUserByTaxId(TEST_USER.taxId);
      if (userByTaxId && userByTaxId.taxId === TEST_USER.taxId) {
        log('success', `✓ 找到用戶 (taxId: ${userByTaxId.taxId})`);
        testsPassed++;
      } else {
        log('error', '✗ 未能根據 taxId 找到用戶');
        testsFailed++;
      }

      // 測試 4: 根據 email 查找用戶
      log('test', '測試 4: 根據 email 查找用戶...');
      const userByEmail = await findUserByEmail(TEST_USER.email);
      if (userByEmail && userByEmail.email === TEST_USER.email) {
        log('success', `✓ 找到用戶 (email: ${userByEmail.email})`);
        testsPassed++;
      } else {
        log('error', '✗ 未能根據 email 找到用戶');
        testsFailed++;
      }

      // 測試 5: 根據 ID 查找用戶
      log('test', '測試 5: 根據 ID 查找用戶...');
      const userById = await findUserById(createdUserId);
      if (userById && userById.id === createdUserId) {
        log('success', `✓ 找到用戶 (ID: ${userById.id})`);
        testsPassed++;
      } else {
        log('error', '✗ 未能根據 ID 找到用戶');
        testsFailed++;
      }

      // 測試 6: 驗證密碼
      log('test', '測試 6: 驗證用戶密碼...');
      if (userByTaxId) {
        const isPasswordValid = await verifyPassword(userByTaxId, TEST_USER.password);
        if (isPasswordValid) {
          log('success', '✓ 密碼驗證成功');
          testsPassed++;
        } else {
          log('error', '✗ 密碼驗證失敗 (密碼不匹配)');
          testsFailed++;
        }

        // 測試 6b: 驗證錯誤密碼
        log('test', '測試 6b: 驗證錯誤密碼應被拒絕...');
        const isInvalidPassword = await verifyPassword(userByTaxId, 'WrongPassword123!');
        if (!isInvalidPassword) {
          log('success', '✓ 錯誤密碼被正確拒絕');
          testsPassed++;
        } else {
          log('error', '✗ 錯誤密碼未被拒絕 (安全風險!)');
          testsFailed++;
        }
      }

      // 測試 7: 檢查用戶狀態
      log('test', '測試 7: 檢查用戶狀態 (ACTIVE)...');
      if (userByTaxId && isUserActive(userByTaxId)) {
        log('success', '✓ 用戶狀態為 ACTIVE');
        testsPassed++;
      } else {
        log('error', '✗ 用戶狀態檢查失敗');
        testsFailed++;
      }

      // 測試 8: 建立 OAuth 帳戶
      log('test', '測試 8: 建立 OAuth 帳戶 (Google)...');
      try {
        const oauthAccount = await createOAuthAccount(
          createdUserId,
          TEST_OAUTH.provider,
          TEST_OAUTH.providerId,
          {
            email: TEST_OAUTH.email,
            name: TEST_OAUTH.name,
            accessToken: TEST_OAUTH.accessToken,
          }
        );
        log('success', `✓ OAuth 帳戶已建立 (ID: ${oauthAccount.id})`);
        testsPassed++;

        // 測試 9: 查找 OAuth 帳戶
        log('test', '測試 9: 根據 provider 和 providerId 查找 OAuth 帳戶...');
        const foundOAuthAccount = await findOAuthAccount(
          TEST_OAUTH.provider,
          TEST_OAUTH.providerId
        );
        if (foundOAuthAccount) {
          log('success', `✓ 找到 OAuth 帳戶 (providerId: ${foundOAuthAccount.account.providerId})`);
          testsPassed++;
        } else {
          log('error', '✗ 未能找到 OAuth 帳戶');
          testsFailed++;
        }
      } catch (error) {
        log('error', `✗ OAuth 帳戶建立失敗: ${(error as any)?.message}`);
        testsFailed += 2;
      }
    } catch (error) {
      log('error', `✗ 用戶建立失敗: ${(error as any)?.message}`);
      testsFailed++;
    }
  } catch (error) {
    log('error', `✗ 測試執行失敗: ${error}`);
    testsFailed++;
  }

  // 結果摘要
  console.log('\n' + '='.repeat(60));
  console.log('📊 測試結果摘要');
  console.log('='.repeat(60));
  console.log(`${colors.green}✅ 通過: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ 失敗: ${testsFailed}${colors.reset}`);
  console.log(`${'總計'}: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log(
      `\n${colors.green}🎉 所有測試通過！PostgreSQL + Prisma 認證層已就緒${colors.reset}\n`
    );
    process.exit(0);
  } else {
    console.log(
      `\n${colors.red}⚠️  某些測試失敗，請檢查上述錯誤信息${colors.reset}\n`
    );
    process.exit(1);
  }
}

testPostgresAuth().catch((error) => {
  console.error('測試執行異常:', error);
  process.exit(1);
});

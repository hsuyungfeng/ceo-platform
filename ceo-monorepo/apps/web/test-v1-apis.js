#!/usr/bin/env node

/**
 * v1 API 驗證測試腳本
 * 
 * 這個腳本用於驗證所有 v1 API 的基本功能
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// 測試的 API 端點
const apiEndpoints = [
  '/api/v1/health',
  '/api/v1/home',
  '/api/v1/user/profile',
  '/api/v1/suppliers',
  '/api/v1/supplier-applications',
  '/api/v1/orders',
];

// 服務器 URL
const serverUrl = 'http://localhost:3000';

async function testApiEndpoint(endpoint) {
  try {
    console.log(`🔍 測試 ${endpoint}...`);
    
    const command = `curl -s -o /dev/null -w "%{http_code}" ${serverUrl}${endpoint}`;
    const { stdout } = await execAsync(command);
    
    const statusCode = parseInt(stdout.trim());
    
    // 接受以下狀態碼：
    // 200 - 成功
    // 207 - 多狀態（健康檢查）
    // 400 - 錯誤請求（某些 API 需要特定參數）
    // 401 - 需要認證
    // 403 - 權限不足
    if (statusCode === 200 || statusCode === 207 || statusCode === 400 || statusCode === 401 || statusCode === 403) {
      console.log(`✅ ${endpoint} - 狀態碼: ${statusCode}`);
      return true;
    } else {
      console.log(`❌ ${endpoint} - 狀態碼: ${statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${endpoint} - 錯誤: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 開始 v1 API 驗證測試');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of apiEndpoints) {
    const success = await testApiEndpoint(endpoint);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('=' .repeat(50));
  console.log(`📊 測試結果: ${passed} 通過, ${failed} 失敗`);
  
  if (failed > 0) {
    console.log('⚠️  有些 API 測試失敗，請檢查服務器是否運行');
    process.exit(1);
  } else {
    console.log('🎉 所有 API 測試通過！');
    process.exit(0);
  }
}

// 檢查服務器是否運行
async function checkServer() {
  try {
    await execAsync(`curl -s --head ${serverUrl} | head -n 1`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔧 檢查服務器狀態...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ 服務器未運行，請先啟動開發服務器：');
    console.log('   cd /home/hsu/Desktop/CEO/ceo-monorepo/apps/web');
    console.log('   npm run dev:next');
    process.exit(1);
  }
  
  console.log('✅ 服務器正在運行');
  await runTests();
}

main().catch(error => {
  console.error('❌ 測試腳本錯誤:', error);
  process.exit(1);
});
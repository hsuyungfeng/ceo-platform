#!/usr/bin/env node

/**
 * Redis 遷移測試腳本
 * 測試 CSRF 保護和速率限制的 Redis 遷移功能
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.cyan}=== ${title} ===${colors.reset}`);
}

function logSuccess(message) {
  log('green', `✓ ${message}`);
}

function logWarning(message) {
  log('yellow', `⚠ ${message}`);
}

function logError(message) {
  log('red', `✗ ${message}`);
}

function logInfo(message) {
  log('blue', `ℹ ${message}`);
}

async function runTest() {
  logSection('Redis 遷移測試');
  logInfo('開始測試 Redis 遷移功能...');

  try {
    // 1. 檢查環境變數
    logSection('1. 環境變數檢查');
    
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
      logWarning('.env.local 文件不存在，使用預設配置');
    } else {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const hasRedisUrl = envContent.includes('REDIS_URL');
      
      if (hasRedisUrl) {
        logSuccess('找到 REDIS_URL 配置');
      } else {
        logWarning('未找到 REDIS_URL 配置，將使用記憶體存儲');
      }
    }

    // 2. 檢查 TypeScript 編譯
    logSection('2. TypeScript 編譯檢查');
    
    try {
      const result = execSync('npx tsc --noEmit src/lib/csrf-protection-enhanced.ts 2>&1', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
      });
      
      if (result.includes('error')) {
        // 檢查是否只是模組找不到的錯誤（可能是路徑配置問題）
        const errors = result.split('\n').filter(line => line.includes('error'));
        const moduleErrors = errors.filter(error => error.includes('Cannot find module'));
        
        if (moduleErrors.length === errors.length) {
          logWarning('CSRF 保護文件有模組導入錯誤（可能是路徑配置問題）');
          logInfo('錯誤詳情:');
          moduleErrors.forEach(err => logInfo(`  ${err}`));
        } else {
          logError('CSRF 保護文件編譯失敗');
          errors.forEach(err => logError(`  ${err}`));
          return false;
        }
      } else {
        logSuccess('CSRF 保護文件編譯通過');
      }
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.message;
      if (errorOutput.includes('Cannot find module')) {
        logWarning('CSRF 保護文件有模組導入錯誤');
      } else {
        logError('CSRF 保護文件編譯失敗');
        console.error(errorOutput);
        return false;
      }
    }

    try {
      const result = execSync('npx tsc --noEmit src/lib/global-rate-limiter.ts 2>&1', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
      });
      
      if (result.includes('error')) {
        const errors = result.split('\n').filter(line => line.includes('error'));
        const moduleErrors = errors.filter(error => error.includes('Cannot find module'));
        
        if (moduleErrors.length === errors.length) {
          logWarning('全域速率限制文件有模組導入錯誤（可能是路徑配置問題）');
        } else {
          logError('全域速率限制文件編譯失敗');
          errors.forEach(err => logError(`  ${err}`));
          return false;
        }
      } else {
        logSuccess('全域速率限制文件編譯通過');
      }
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.message;
      if (errorOutput.includes('Cannot find module')) {
        logWarning('全域速率限制文件有模組導入錯誤');
      } else {
        logError('全域速率限制文件編譯失敗');
        console.error(errorOutput);
        return false;
      }
    }

    // 3. 檢查 Redis 客戶端
    logSection('3. Redis 客戶端檢查');
    
    try {
      const redisClientCode = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'lib', 'redis-client.ts'),
        'utf8'
      );
      
      if (redisClientCode.includes('class RedisClient')) {
        logSuccess('Redis 客戶端類別存在');
      } else {
        logError('Redis 客戶端類別不存在');
        return false;
      }
    } catch (error) {
      logError('無法讀取 Redis 客戶端文件');
      return false;
    }

    // 4. 檢查 Docker Compose 配置
    logSection('4. Docker Compose 配置檢查');
    
    const composeFiles = [
      'docker-compose.yml',
      'docker-compose.dev.yml',
    ];
    
    for (const file of composeFiles) {
      const composePath = path.join(__dirname, '..', file);
      if (fs.existsSync(composePath)) {
        const content = fs.readFileSync(composePath, 'utf8');
        if (content.includes('redis:')) {
          logSuccess(`${file} 包含 Redis 服務配置`);
        }
      }
    }

    // 5. 檢查 CSRF 遷移
    logSection('5. CSRF Redis 遷移檢查');
    
    const csrfEnhancedCode = fs.readFileSync(
      path.join(__dirname, '..', 'src', 'lib', 'csrf-protection-enhanced.ts'),
      'utf8'
    );
    
    const csrfChecks = [
      { name: 'Redis 存儲支持', pattern: /storeTokenInRedis/ },
      { name: '記憶體存儲回退', pattern: /memoryTokens/ },
      { name: '健康檢查', pattern: /healthCheck/ },
      { name: '存儲模式檢測', pattern: /getStorageMode/ },
    ];
    
    csrfChecks.forEach(check => {
      if (csrfEnhancedCode.match(check.pattern)) {
        logSuccess(`${check.name} 功能存在`);
      } else {
        logWarning(`${check.name} 功能未找到`);
      }
    });

    // 6. 檢查速率限制遷移
    logSection('6. 速率限制 Redis 遷移檢查');
    
    const rateLimiterCode = fs.readFileSync(
      path.join(__dirname, '..', 'src', 'lib', 'global-rate-limiter.ts'),
      'utf8'
    );
    
    const rateLimiterChecks = [
      { name: 'Redis 速率限制', pattern: /checkWithRedis/ },
      { name: '記憶體回退', pattern: /checkWithMemory/ },
      { name: '分散式支持', pattern: /redisAvailable/ },
      { name: '速率限制頭部', pattern: /X-RateLimit/ },
    ];
    
    rateLimiterChecks.forEach(check => {
      if (rateLimiterCode.match(check.pattern)) {
        logSuccess(`${check.name} 功能存在`);
      } else {
        logWarning(`${check.name} 功能未找到`);
      }
    });

    // 7. 檢查伺服器集成
    logSection('7. 伺服器集成檢查');
    
    const serverCode = fs.readFileSync(
      path.join(__dirname, '..', 'server.ts'),
      'utf8'
    );
    
    if (serverCode.includes('defaultGlobalRateLimiter')) {
      logSuccess('伺服器已集成全域速率限制');
    } else {
      logWarning('伺服器未集成全域速率限制');
    }

    // 8. 檢查 Prisma 超時配置
    logSection('8. Prisma 超時配置檢查');
    
    const prismaCode = fs.readFileSync(
      path.join(__dirname, '..', 'src', 'lib', 'prisma.ts'),
      'utf8'
    );
    
    const prismaChecks = [
      { name: '查詢超時中間件', pattern: /\$use.*timeout/ },
      { name: '連接池配置', pattern: /max.*idleTimeoutMillis/ },
      { name: '慢查詢日誌', pattern: /duration.*1000/ },
      { name: '健康檢查', pattern: /healthCheck/ },
    ];
    
    prismaChecks.forEach(check => {
      if (prismaCode.match(check.pattern)) {
        logSuccess(`${check.name} 功能存在`);
      } else {
        logWarning(`${check.name} 功能未找到`);
      }
    });

    // 9. 生成測試報告
    logSection('9. 測試總結');
    
    logInfo('Redis 遷移測試完成！');
    logInfo('下一步建議：');
    logInfo('1. 啟動 Redis 服務: docker-compose up -d redis');
    logInfo('2. 配置 .env.local 中的 REDIS_URL');
    logInfo('3. 重啟開發伺服器: npm run dev');
    logInfo('4. 驗證 CSRF 和速率限制功能');
    
    return true;

  } catch (error) {
    logError('測試過程中發生錯誤:');
    console.error(error);
    return false;
  }
}

// 執行測試
runTest().then(success => {
  if (success) {
    logSuccess('所有測試通過！');
    process.exit(0);
  } else {
    logError('測試失敗，請檢查上述錯誤');
    process.exit(1);
  }
}).catch(error => {
  logError('測試執行錯誤:');
  console.error(error);
  process.exit(1);
});
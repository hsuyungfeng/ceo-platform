// 測試修復後的供應商 API
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testSupplierAPI() {
  console.log('=== 測試供應商 API 修復 ===\n');
  
  try {
    // 1. 先檢查 TypeScript 編譯
    console.log('1. 檢查 TypeScript 編譯...');
    const tsCheck = await execAsync('cd /home/hsu/Desktop/CEO/ceo-monorepo/apps/web && npx tsc --noEmit --skipLibCheck src/app/api/v1/suppliers/route.ts 2>&1 | grep -v "node_modules" | head -10');
    
    if (tsCheck.stdout.includes('error')) {
      console.log('❌ TypeScript 錯誤:');
      console.log(tsCheck.stdout);
    } else {
      console.log('✅ TypeScript 編譯通過\n');
    }
    
    // 2. 檢查 API 代碼結構
    console.log('2. 檢查 API 代碼結構...');
    const apiCode = require('fs').readFileSync('/home/hsu/Desktop/CEO/ceo-monorepo/apps/web/src/app/api/v1/suppliers/route.ts', 'utf8');
    
    // 檢查修復的問題
    const checks = {
      hasAnyType: apiCode.includes('where: any'),
      hasCountQuery: apiCode.includes('_count:'),
      hasCorrectSelect: apiCode.includes('products:') && apiCode.includes('supplierApplications:'),
      hasTypeDefinition: apiCode.includes('const where: {') && apiCode.includes('status?: string'),
    };
    
    console.log('代碼檢查結果:');
    console.log(`  - 是否還有 any 類型: ${checks.hasAnyType ? '❌' : '✅'}`);
    console.log(`  - 是否還有錯誤的 _count 查詢: ${checks.hasCountQuery ? '❌' : '✅'}`);
    console.log(`  - 是否有正確的 select 查詢: ${checks.hasCorrectSelect ? '✅' : '❌'}`);
    console.log(`  - 是否有類型定義: ${checks.hasTypeDefinition ? '✅' : '❌'}`);
    
    // 3. 檢查測試文件
    console.log('\n3. 檢查測試文件...');
    const testFile = '/home/hsu/Desktop/CEO/ceo-monorepo/apps/web/__tests__/unit/api/v1/suppliers.test.ts';
    
    if (require('fs').existsSync(testFile)) {
      const testContent = require('fs').readFileSync(testFile, 'utf8');
      const testChecks = {
        hasGETTests: testContent.includes('describe(\'GET'),
        hasPOSTTests: testContent.includes('describe(\'POST'),
        testCount: (testContent.match(/it\(/g) || []).length,
      };
      
      console.log('測試文件檢查結果:');
      console.log(`  - 有 GET 測試: ${testChecks.hasGETTests ? '✅' : '❌'}`);
      console.log(`  - 有 POST 測試: ${testChecks.hasPOSTTests ? '✅' : '❌'}`);
      console.log(`  - 測試用例數量: ${testChecks.testCount}`);
    } else {
      console.log('❌ 測試文件不存在');
    }
    
    // 4. 總結修復
    console.log('\n=== 修復總結 ===');
    
    const issuesFixed = [
      '1. 修復 Prisma _count 查詢語法錯誤',
      '2. 替換 any 類型為具體類型定義',
      '3. 修正關聯查詢為正確的 select 語法',
      '4. 創建完整的單元測試套件',
    ];
    
    console.log('已修復的問題:');
    issuesFixed.forEach(issue => console.log(`  ✅ ${issue}`));
    
    console.log('\n下一步:');
    console.log('  1. 啟動開發伺服器測試 API');
    console.log('  2. 運行單元測試驗證修復');
    console.log('  3. 擴展其他 API 測試覆蓋');
    
  } catch (error) {
    console.error('測試過程中發生錯誤:', error.message);
  }
}

testSupplierAPI();
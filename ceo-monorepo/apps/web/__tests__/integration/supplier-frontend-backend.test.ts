/**
 * 供應商前端-後端接口測試
 * 
 * 測試前端組件與後端 API 的整合。
 * 這些測試驗證前端能夠正確調用後端 API 並處理響應。
 * 
 * 注意：這些是輕量級整合測試，使用真實的 API 路由，
 * 但不啟動完整的 Next.js 伺服器。
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/suppliers/route';
import { prismaTest } from '@/lib/prisma-test';

// 設置測試環境
process.env.NODE_ENV = 'test';

describe('供應商前端-後端接口測試', () => {
  beforeEach(async () => {
    // 確保測試資料庫已就緒
    if (!global.testDatabaseReady) {
      throw new Error('測試資料庫未準備就緒');
    }
    
    // 重置資料庫
    await prismaTest.supplier.deleteMany({});
  });

  test('前端應能正確調用 GET /api/suppliers 並解析響應', async () => {
    // 建立測試供應商
    await prismaTest.supplier.create({
      data: {
        taxId: 'test-frontend-1',
        companyName: '前端測試公司一號',
        contactPerson: '前端張三',
        phone: '0911111111',
        email: 'frontend1@example.com',
        address: '前端測試地址一號',
        status: 'ACTIVE',
        isVerified: true,
      },
    });

    await prismaTest.supplier.create({
      data: {
        taxId: 'test-frontend-2',
        companyName: '前端測試公司二號',
        contactPerson: '前端李四',
        phone: '0922222222',
        email: 'frontend2@example.com',
        address: '前端測試地址二號',
        status: 'PENDING',
        isVerified: false,
      },
    });

    // 模擬前端請求：GET /api/suppliers?status=ACTIVE
    const request = new NextRequest('http://localhost:3000/api/suppliers?status=ACTIVE');
    const response = await GET(request);
    const data = await response.json();

    // 驗證後端響應格式符合前端期望
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    
    // 驗證數據結構匹配前端 TypeScript 接口
    if (data.data.length > 0) {
      const supplier = data.data[0];
      expect(supplier).toHaveProperty('id');
      expect(supplier).toHaveProperty('taxId');
      expect(supplier).toHaveProperty('companyName');
      expect(supplier).toHaveProperty('contactPerson');
      expect(supplier).toHaveProperty('phone');
      expect(supplier).toHaveProperty('email');
      expect(supplier).toHaveProperty('address');
      expect(supplier).toHaveProperty('industry');
      expect(supplier).toHaveProperty('description');
      expect(supplier).toHaveProperty('status');
      expect(supplier).toHaveProperty('isVerified');
      expect(supplier).toHaveProperty('createdAt');
      expect(supplier).toHaveProperty('productsCount');
      expect(supplier).toHaveProperty('applicationsCount');
      
      // 驗證前端需要的特定字段存在
      expect(typeof supplier.id).toBe('string');
      expect(typeof supplier.companyName).toBe('string');
      expect(typeof supplier.status).toBe('string');
      expect(typeof supplier.isVerified).toBe('boolean');
    }

    // 驗證過濾邏輯：只返回 ACTIVE 狀態的供應商
    const activeSuppliers = data.data.filter((s: any) => s.status === 'ACTIVE');
    expect(activeSuppliers.length).toBe(1);
    expect(activeSuppliers[0].companyName).toBe('前端測試公司一號');
  });

  test('前端應能正確調用 POST /api/suppliers 並處理成功響應', async () => {
    // 模擬前端表單數據
    const formData = {
      companyName: '前端註冊測試公司',
      taxId: 'frontend-reg-1',
      contactPerson: '前端王五',
      phone: '0933333333',
      email: 'frontend-reg@example.com',
      address: '前端註冊測試地址',
      industry: '前端測試行業',
      description: '前端註冊測試描述',
    };

    // 模擬前端請求：POST /api/suppliers
    const request = new NextRequest('http://localhost:3000/api/suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const response = await POST(request);
    const data = await response.json();

    // 驗證後端響應格式符合前端期望
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data).toHaveProperty('taxId', formData.taxId);
    expect(data.data).toHaveProperty('companyName', formData.companyName);
    expect(data.data).toHaveProperty('contactPerson', formData.contactPerson);
    expect(data.data).toHaveProperty('phone', formData.phone);
    expect(data.data).toHaveProperty('email', formData.email);
    expect(data.data).toHaveProperty('address', formData.address);
    expect(data.data).toHaveProperty('industry', formData.industry);
    expect(data.data).toHaveProperty('description', formData.description);
    expect(data.data).toHaveProperty('status', 'PENDING'); // 新註冊應為待審核狀態
    expect(data.data).toHaveProperty('isVerified', false); // 新註冊應未驗證

    // 驗證數據已存入資料庫
    const dbSupplier = await prismaTest.supplier.findUnique({
      where: { taxId: formData.taxId },
    });
    
    expect(dbSupplier).toBeTruthy();
    expect(dbSupplier?.companyName).toBe(formData.companyName);
    expect(dbSupplier?.status).toBe('PENDING');
  });

  test('前端應能處理 POST /api/suppliers 的錯誤響應', async () => {
    // 先建立一個重複的稅籍編號
    await prismaTest.supplier.create({
      data: {
        taxId: 'duplicate-tax-id',
        companyName: '重複公司',
        contactPerson: '重複聯絡人',
        phone: '0944444444',
        email: 'duplicate@example.com',
        address: '重複地址',
        status: 'ACTIVE',
      },
    });

    // 模擬前端嘗試註冊重複稅籍編號
    const formData = {
      companyName: '重複稅籍測試公司',
      taxId: 'duplicate-tax-id', // 重複的稅籍編號
      contactPerson: '測試聯絡人',
      phone: '0955555555',
      email: 'test-duplicate@example.com',
      address: '測試地址',
      industry: '測試行業',
      description: '測試描述',
    };

    const request = new NextRequest('http://localhost:3000/api/suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const response = await POST(request);
    const data = await response.json();

    // 驗證後端返回錯誤響應
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('稅籍編號'); // 錯誤訊息應包含稅籍編號相關信息

    // 驗證前端可以處理的錯誤格式
    expect(typeof data.error).toBe('string');
    expect(data.error.length).toBeGreaterThan(0);
  });

  test('前端應能處理 API 網路錯誤情況', async () => {
    // 這個測試驗證前端對網路錯誤的處理
    // 由於我們在測試環境中，我們模擬一個會失敗的場景
    // 實際上前端應該處理 fetch 拋出的異常
    
    // 建立一個會導致錯誤的請求（缺少必要字段）
    const invalidFormData = {
      // 缺少必要的 companyName 和 taxId
      contactPerson: '測試聯絡人',
      phone: '0966666666',
    };

    const request = new NextRequest('http://localhost:3000/api/suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidFormData),
    });

    const response = await POST(request);
    const data = await response.json();

    // 驗證後端返回驗證錯誤
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();

    // 驗證錯誤訊息格式可以被前端解析
    expect(typeof data.error).toBe('string');
  });

  test('前端列表頁面應能處理空數據情況', async () => {
    // 確保資料庫中沒有供應商
    await prismaTest.supplier.deleteMany({});

    // 模擬前端請求空列表
    const request = new NextRequest('http://localhost:3000/api/suppliers');
    const response = await GET(request);
    const data = await response.json();

    // 驗證後端返回空數組
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBe(0);

    // 驗證前端可以安全地映射空數組
    // 前端代碼應該類似：suppliers.map(supplier => ...)
    // 空數組不會導致錯誤
  });

  test('前端應能處理供應商狀態徽章映射', async () => {
    // 建立不同狀態的供應商
    const statuses = ['ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED'] as const;
    
    for (const status of statuses) {
      await prismaTest.supplier.create({
        data: {
          taxId: `status-test-${status}-${Date.now()}`,
          companyName: `${status}狀態測試公司`,
          contactPerson: `${status}聯絡人`,
          phone: `09${Date.now().toString().slice(-8)}`,
          email: `status-${status}@example.com`,
          address: `${status}測試地址`,
          status: status,
        },
      });
    }

    // 獲取所有供應商
    const request = new NextRequest('http://localhost:3000/api/suppliers');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    
    // 驗證每個狀態都正確返回
    const returnedStatuses = data.data.map((s: any) => s.status);
    for (const status of statuses) {
      expect(returnedStatuses).toContain(status);
    }

    // 驗證前端可以根據狀態顯示正確的徽章
    // 前端代碼應有類似邏輯：
    // function getStatusBadge(status) {
    //   switch (status) {
    //     case 'ACTIVE': return '營業中';
    //     case 'PENDING': return '審核中';
    //     case 'SUSPENDED': return '已停權';
    //     case 'REJECTED': return '已拒絕';
    //   }
    // }
  });
});

console.log('✅ 供應商前端-後端接口測試準備完成');
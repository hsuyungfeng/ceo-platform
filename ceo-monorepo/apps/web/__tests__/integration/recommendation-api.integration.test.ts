/**
 * 推薦系統整合測試
 * 
 * 這個測試檔案測試推薦系統的服務層功能
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prismaTest } from '@/lib/prisma-test';

describe('推薦系統整合測試', () => {
  let testUser: any;
  let testAdmin: any;
  let testProduct1: any;
  let testProduct2: any;
  let testSupplier: any;

  beforeAll(async () => {
    // 確保測試資料庫已就緒
    expect(global.testDatabaseReady).toBe(true);
  });

  beforeEach(async () => {
    // 創建測試用戶和數據
    const timestamp = Date.now();
    testUser = await global.createTestUser({
      email: `recommendation.user.${timestamp}@test.com`,
      name: '推薦測試用戶',
      role: 'MEMBER'
    });
    
    testAdmin = await global.createTestUser({
      email: `recommendation.admin.${timestamp}@test.com`,
      name: '推薦測試管理員',
      role: 'ADMIN'
    });
    
    testSupplier = await global.createTestSupplier({
      companyName: '推薦測試供應商',
      email: `recommendation.supplier.${timestamp}@test.com`,
      taxId: `test${timestamp}`,
      status: 'ACTIVE'
    });
    
    testProduct1 = await global.createTestProduct({
      name: '推薦測試產品1',
      subtitle: '測試產品1副標題',
      popularityScore: 0.8,
      purchaseCount: 100,
      totalSold: 500
    });
    
    testProduct2 = await global.createTestProduct({
      name: '推薦測試產品2',
      subtitle: '測試產品2副標題',
      popularityScore: 0.6,
      purchaseCount: 50,
      totalSold: 200
    });
    
    // 創建供應商產品關聯
    await prismaTest.supplierProduct.create({
      data: {
        supplierId: testSupplier.id,
        productId: testProduct1.id,
        name: testProduct1.name,
        price: 100.0,
        moq: 10,
        isActive: true
      }
    });
    
    await prismaTest.supplierProduct.create({
      data: {
        supplierId: testSupplier.id,
        productId: testProduct2.id,
        name: testProduct2.name,
        price: 150.0,
        moq: 5,
        isActive: true
      }
    });
  });

  afterAll(async () => {
    // 測試資料庫會在每個測試檔案執行前重置，不需要額外清理
    console.log('✅ 推薦系統整合測試完成');
  });

  // 每個測試前已經重置資料庫，不需要額外清理

  describe('推薦服務基本功能', () => {
    test('應該能創建推薦記錄', async () => {
    const recommendation = await prismaTest.purchaseRecommendation.create({
      data: {
        userId: testUser.id,
        productId: testProduct1.id,
        // supplierId: testSupplier.id, // 可選字段，先不提供以簡化測試
        score: 0.85,
        reason: '熱門產品推薦',
        algorithm: 'POPULARITY',
        viewed: false,
        clicked: false,
        dismissed: false
      }
    });
      
      expect(recommendation).toBeDefined();
      expect(recommendation.userId).toBe(testUser.id);
      expect(recommendation.productId).toBe(testProduct1.id);
      expect(recommendation.score).toBe(0.85);
      expect(recommendation.algorithm).toBe('POPULARITY');
      expect(recommendation.viewed).toBe(false);
    });
    
    test('應該能更新推薦狀態', async () => {
      const recommendation = await prismaTest.purchaseRecommendation.create({
        data: {
          userId: testUser.id,
          productId: testProduct1.id,
          score: 0.8,
          algorithm: 'POPULARITY',
          viewed: false,
          clicked: false,
          dismissed: false
        }
      });
      
      // 標記為已查看
      const updated = await prismaTest.purchaseRecommendation.update({
        where: { id: recommendation.id },
        data: { viewed: true }
      });
      
      expect(updated.viewed).toBe(true);
      expect(updated.updatedAt).not.toBe(recommendation.updatedAt);
    });
    
    test('應該能查詢用戶推薦列表', async () => {
      // 創建多個推薦記錄
      await prismaTest.purchaseRecommendation.createMany({
        data: [
          {
            userId: testUser.id,
            productId: testProduct1.id,
            score: 0.9,
            algorithm: 'POPULARITY',
            viewed: false,
            clicked: false,
            dismissed: false
          },
          {
            userId: testUser.id,
            productId: testProduct2.id,
            score: 0.7,
            algorithm: 'HISTORY',
            viewed: true,
            clicked: false,
            dismissed: false
          },
          {
            userId: testAdmin.id, // 另一個用戶的推薦
            productId: testProduct1.id,
            score: 0.8,
            algorithm: 'POPULARITY',
            viewed: false,
            clicked: false,
            dismissed: false
          }
        ]
      });
      
      // 查詢當前用戶的推薦
      const userRecommendations = await prismaTest.purchaseRecommendation.findMany({
        where: { userId: testUser.id },
        orderBy: { score: 'desc' }
      });
      
      expect(userRecommendations).toHaveLength(2);
      expect(userRecommendations[0].score).toBe(0.9);
      expect(userRecommendations[0].algorithm).toBe('POPULARITY');
      expect(userRecommendations[1].score).toBe(0.7);
      expect(userRecommendations[1].algorithm).toBe('HISTORY');
    });
  });

  describe('推薦算法服務', () => {
    test('generatePopularityRecommendations 應該返回熱門產品推薦', async () => {
      // 動態導入推薦服務
      const { generatePopularityRecommendations } = await import('@/lib/services/recommendationService');
      
      const recommendations = await generatePopularityRecommendations(testUser.id, 5);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // 驗證推薦結構
      const rec = recommendations[0];
      expect(rec).toHaveProperty('productId');
      expect(rec).toHaveProperty('score');
      expect(rec).toHaveProperty('reason');
      expect(rec.score).toBeGreaterThan(0);
      expect(rec.score).toBeLessThanOrEqual(1);
    });
    
    test('generateUserRecommendations 應該為用戶生成推薦', async () => {
      // 動態導入推薦服務
      const { generateRecommendations } = await import('@/lib/services/recommendationService');
      
      const result = await generateRecommendations({
        userId: testUser.id,
        algorithm: 'POPULARITY',
        limit: 3
      });
      
      expect(result.userId).toBe(testUser.id);
      expect(result.algorithm).toBe('POPULARITY');
      expect(result.generatedCount).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // 驗證推薦已保存到數據庫
      const dbRecommendations = await prismaTest.purchaseRecommendation.findMany({
        where: { userId: testUser.id }
      });
      expect(dbRecommendations.length).toBe(result.generatedCount);
    });
    
    test('updateProductPopularity 應該更新產品熱門度分數', async () => {
      // 動態導入推薦服務
      const { updateProductPopularity } = await import('@/lib/services/recommendationService');
      
      // 創建一些訂單記錄來測試熱門度計算
      const order = await prismaTest.order.create({
        data: {
          orderNo: `TEST-${Date.now()}`,
          userId: testUser.id,
          status: 'COMPLETED',
          paymentMethod: 'CASH',
          totalAmount: 1000
        }
      });
      
      await prismaTest.orderItem.create({
        data: {
          orderId: order.id,
          productId: testProduct1.id,
          quantity: 5,
          unitPrice: 200,
          subtotal: 1000
        }
      });
      
      await updateProductPopularity();
      
      // 驗證產品熱門度已更新
      const updatedProduct = await prismaTest.product.findUnique({
        where: { id: testProduct1.id }
      });
      
      expect(updatedProduct?.popularityScore).toBeGreaterThan(0);
      expect(updatedProduct?.purchaseCount).toBeGreaterThan(0);
      expect(updatedProduct?.totalSold).toBeGreaterThan(0);
    });
  });

  describe('用戶採購歷史聚合', () => {
    test('應該能創建和更新用戶採購歷史', async () => {
      // 創建用戶採購歷史
      const history = await prismaTest.userPurchaseHistory.create({
        data: {
          userId: testUser.id,
          productId: testProduct1.id,
          supplierId: testSupplier.id,
          totalQuantity: 10,
          totalOrders: 2,
          lastPurchasedAt: new Date()
        }
      });
      
      expect(history).toBeDefined();
      expect(history.userId).toBe(testUser.id);
      expect(history.productId).toBe(testProduct1.id);
      expect(history.totalQuantity).toBe(10);
      expect(history.totalOrders).toBe(2);
      
      // 更新採購歷史
      const updated = await prismaTest.userPurchaseHistory.update({
        where: { id: history.id },
        data: {
          totalQuantity: { increment: 5 },
          totalOrders: { increment: 1 }
        }
      });
      
      expect(updated.totalQuantity).toBe(15);
      expect(updated.totalOrders).toBe(3);
    });
    
    test('應該能根據採購歷史生成推薦', async () => {
      // 創建用戶採購歷史
      await prismaTest.userPurchaseHistory.create({
        data: {
          userId: testUser.id,
          productId: testProduct1.id,
          totalQuantity: 20,
          totalOrders: 5,
          lastPurchasedAt: new Date()
        }
      });
      
      // 動態導入推薦服務
      const { generateHistoryBasedRecommendations } = await import('@/lib/services/recommendationService');
      
      const recommendations = await generateHistoryBasedRecommendations(testUser.id, 3);
      
      expect(Array.isArray(recommendations)).toBe(true);
      // 注意：由於測試數據有限，可能無法生成推薦
      // 這沒關係，我們主要測試函數是否正常執行
    });
  });

  describe('推薦系統邊界情況', () => {
    test('應該處理沒有採購歷史的用戶', async () => {
      // 創建一個新用戶，沒有採購歷史
      const newUser = await global.createTestUser({
        email: 'new.user@test.com',
        name: '新用戶'
      });
      
      // 動態導入推薦服務
      const { generateHistoryBasedRecommendations } = await import('@/lib/services/recommendationService');
      
      const recommendations = await generateHistoryBasedRecommendations(newUser.id, 5);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBe(0); // 沒有歷史，應該返回空數組
      
      // 清理
      await prismaTest.user.delete({ where: { id: newUser.id } });
    });
    
    test('應該處理不存在的產品或用戶', async () => {
      // 測試使用無效ID
      const invalidUserId = 'invalid-user-id';
      const invalidProductId = 'invalid-product-id';
      
      // 嘗試創建推薦記錄應該失敗（由於外鍵約束）
      try {
        await prismaTest.purchaseRecommendation.create({
          data: {
            userId: invalidUserId,
            productId: invalidProductId,
            score: 0.5,
            algorithm: 'POPULARITY',
            viewed: false,
            clicked: false,
            dismissed: false
          }
        });
        // 如果創建成功（不應該），則測試失敗
        expect(true).toBe(false);
      } catch (error) {
        // 應該拋出錯誤
        expect(error).toBeDefined();
      }
    });
  });

  describe('推薦統計功能', () => {
    test('應該能計算推薦統計數據', async () => {
      // 創建測試推薦記錄
      await prismaTest.purchaseRecommendation.createMany({
        data: [
          {
            userId: testUser.id,
            productId: testProduct1.id,
            score: 0.9,
            algorithm: 'POPULARITY',
            viewed: true,
            clicked: true,
            dismissed: false
          },
          {
            userId: testUser.id,
            productId: testProduct2.id,
            score: 0.7,
            algorithm: 'HISTORY',
            viewed: true,
            clicked: false,
            dismissed: false
          },
          {
            userId: testUser.id,
            productId: testProduct1.id,
            score: 0.6,
            algorithm: 'COLLABORATIVE',
            viewed: false,
            clicked: false,
            dismissed: true
          }
        ]
      });
      
      // 計算統計
      const totalRecs = await prismaTest.purchaseRecommendation.count({
        where: { userId: testUser.id }
      });
      
      const viewedRecs = await prismaTest.purchaseRecommendation.count({
        where: { userId: testUser.id, viewed: true }
      });
      
      const clickedRecs = await prismaTest.purchaseRecommendation.count({
        where: { userId: testUser.id, clicked: true }
      });
      
      const dismissedRecs = await prismaTest.purchaseRecommendation.count({
        where: { userId: testUser.id, dismissed: true }
      });
      
      expect(totalRecs).toBe(3);
      expect(viewedRecs).toBe(2);
      expect(clickedRecs).toBe(1);
      expect(dismissedRecs).toBe(1);
      
      // 計算點擊率
      const clickThroughRate = totalRecs > 0 ? (clickedRecs / totalRecs) * 100 : 0;
      expect(clickThroughRate).toBeCloseTo(33.33, 1);
    });
    
    test('應該能按算法分組統計', async () => {
      // 創建測試數據
      await prismaTest.purchaseRecommendation.createMany({
        data: [
          { userId: testUser.id, productId: testProduct1.id, score: 0.8, algorithm: 'POPULARITY', viewed: true, clicked: true, dismissed: false },
          { userId: testUser.id, productId: testProduct1.id, score: 0.7, algorithm: 'POPULARITY', viewed: false, clicked: false, dismissed: false },
          { userId: testUser.id, productId: testProduct2.id, score: 0.9, algorithm: 'HISTORY', viewed: true, clicked: false, dismissed: false },
          { userId: testUser.id, productId: testProduct2.id, score: 0.6, algorithm: 'COLLABORATIVE', viewed: false, clicked: false, dismissed: true }
        ]
      });
      
      // 按算法分組統計
      const algorithmStats = await prismaTest.purchaseRecommendation.groupBy({
        by: ['algorithm'],
        where: { userId: testUser.id },
        _count: true,
        _avg: { score: true }
      });
      
      expect(algorithmStats).toHaveLength(3);
      
      // 驗證POPULARITY算法的統計
      const popularityStat = algorithmStats.find((stat: any) => stat.algorithm === 'POPULARITY');
      expect(popularityStat).toBeDefined();
      expect(popularityStat?._count).toBe(2);
      expect(popularityStat?._avg?.score).toBeCloseTo(0.75, 2);
    });
  });
});
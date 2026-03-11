import { describe, test, expect, beforeAll } from '@jest/globals';
import { prismaTest } from '@/lib/prisma-test';

describe('Debug test', () => {
  test('should create test user', async () => {
    const user = await global.createTestUser({
      email: `debug.test.${Date.now()}@test.com`,
      name: 'Debug Test User'
    });
    
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toContain('debug.test');
    
    // Try to create a purchase recommendation
    const product = await global.createTestProduct({
      name: 'Debug Test Product'
    });
    
    const recommendation = await prismaTest.purchaseRecommendation.create({
      data: {
        userId: user.id,
        productId: product.id,
        score: 0.85,
        algorithm: 'POPULARITY',
        viewed: false,
        clicked: false,
        dismissed: false
      }
    });
    
    expect(recommendation).toBeDefined();
    expect(recommendation.userId).toBe(user.id);
    
    // Cleanup
    await prismaTest.purchaseRecommendation.delete({ where: { id: recommendation.id } });
    await prismaTest.product.delete({ where: { id: product.id } });
    await prismaTest.user.delete({ where: { id: user.id } });
  });
});
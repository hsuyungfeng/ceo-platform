/**
 * 訂單 API v1 單元測試
 * 測試路徑: /api/v1/orders
 */

import { GET } from '@/app/api/v1/orders/route';
import { prisma } from '@/lib/prisma';
import { getAuthData } from '@/lib/auth-helper';

// 模擬 Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// 模擬 getAuthData
jest.mock('@/lib/auth-helper', () => ({
  getAuthData: jest.fn().mockResolvedValue(null),
}));

describe('訂單 API v1', () => {
  let mockGetAuthData: jest.Mock;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthData = getAuthData as jest.Mock;
    
    mockGetAuthData.mockResolvedValue(null);
    
    const prismaModule = require('@/lib/prisma');
    mockPrisma = prismaModule.prisma;
    mockPrisma.order.findMany.mockResolvedValue([]);
    mockPrisma.order.count.mockResolvedValue(0);
  });

  describe('GET /api/v1/orders', () => {
    it('應該返回訂單列表（需要認證）', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: '測試用戶',
        role: 'MEMBER',
      };

      mockGetAuthData.mockResolvedValue({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        user: mockUser,
      });

      const mockOrders = [
        {
          id: 'order-1',
          orderNo: 'ORD-2024-001',
          userId: mockUser.id,
          supplierId: 'supplier-1',
          status: 'CONFIRMED',
          totalAmount: 1000.50,
          items: [],
          shippingAddress: '台北市',
          note: '測試訂單',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockPrisma.order.findMany.mockResolvedValue(mockOrders);
      mockPrisma.order.count.mockResolvedValue(1);

      const request = new Request('http://localhost:3000/api/v1/orders', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('應該拒絕未認證用戶', async () => {
      mockGetAuthData.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/v1/orders', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('應該支援分頁參數', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'test-user-id', role: 'MEMBER' },
      });

      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(100);

      const request = new Request('http://localhost:3000/api/v1/orders?page=2&limit=10', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 100,
        totalPages: 10,
      });
    });

    it('應該支援狀態篩選', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'test-user-id', role: 'MEMBER' },
      });

      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      const request = new Request('http://localhost:3000/api/v1/orders?status=CONFIRMED', {
        method: 'GET',
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.order.findMany).toHaveBeenCalled();
    });

    it('應該處理錯誤情況', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'test-user-id', role: 'MEMBER' },
      });

      mockPrisma.order.findMany.mockRejectedValue(new Error('資料庫錯誤'));

      const request = new Request('http://localhost:3000/api/v1/orders', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});

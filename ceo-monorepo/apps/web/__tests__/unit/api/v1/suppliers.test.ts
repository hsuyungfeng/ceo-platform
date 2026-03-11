/**
 * 供應商 API v1 單元測試
 * 測試路徑: /api/v1/suppliers
 */

import { GET } from '@/app/api/v1/suppliers/route';
import { prisma } from '@/lib/prisma';
import { getAuthData } from '@/lib/auth-helper';

// 模擬 Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    supplier: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
    supplierApplication: {
      count: jest.fn(),
    },
  },
}));

// 模擬 getAuthData
jest.mock('@/lib/auth-helper', () => ({
  getAuthData: jest.fn().mockResolvedValue(null),
}));

describe('供應商 API v1', () => {
  let mockGetAuthData: jest.Mock;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthData = getAuthData as jest.Mock;
    
    mockGetAuthData.mockResolvedValue(null);
    
    const prismaModule = require('@/lib/prisma');
    mockPrisma = prismaModule.prisma;
    mockPrisma.supplier.findMany.mockResolvedValue([]);
    mockPrisma.supplier.count.mockResolvedValue(0);
    mockPrisma.supplier.findUnique.mockResolvedValue(null);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.supplierApplication.count.mockResolvedValue(0);
  });

  describe('GET /api/v1/suppliers', () => {
    it('應該返回供應商列表', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'test-user-id', role: 'MEMBER' },
      });

      const mockSuppliers = [
        {
          id: 'supplier-1',
          companyName: '測試供應商',
          taxId: '12345678',
          contactPerson: '王小明',
          phone: '0912345678',
          email: 'supplier@test.com',
          address: '台北市',
          status: 'ACTIVE',
          isVerified: true,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockPrisma.supplier.findMany.mockResolvedValue(mockSuppliers);
      mockPrisma.supplier.count.mockResolvedValue(1);

      const request = new Request('http://localhost:3000/api/v1/suppliers', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('應該支援分頁', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'test-user-id', role: 'MEMBER' },
      });

      mockPrisma.supplier.findMany.mockResolvedValue([]);
      mockPrisma.supplier.count.mockResolvedValue(50);

      const request = new Request('http://localhost:3000/api/v1/suppliers?page=1&limit=10', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.total).toBe(50);
    });

    it('應該處理錯誤', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'test-user-id', role: 'MEMBER' },
      });

      mockPrisma.supplier.findMany.mockRejectedValue(new Error('資料庫錯誤'));

      const request = new Request('http://localhost:3000/api/v1/suppliers', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});

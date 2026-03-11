/**
 * 供應商申請 API v1 單元測試
 * 測試路徑: /api/v1/supplier-applications
 */

import { GET } from '@/app/api/v1/supplier-applications/route';
import { prisma } from '@/lib/prisma';
import { getAuthData } from '@/lib/auth-helper';

// 模擬 Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    supplierApplication: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    supplier: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

// 模擬 getAuthData
jest.mock('@/lib/auth-helper', () => ({
  getAuthData: jest.fn().mockResolvedValue(null),
}));

describe('供應商申請 API v1', () => {
  let mockGetAuthData: jest.Mock;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthData = getAuthData as jest.Mock;
    
    // 設置默認mock返回值
    mockGetAuthData.mockResolvedValue(null);
    
    const prismaModule = require('@/lib/prisma');
    mockPrisma = prismaModule.prisma;
    mockPrisma.supplierApplication.findMany.mockResolvedValue([]);
    mockPrisma.supplierApplication.count.mockResolvedValue(0);
    mockPrisma.supplierApplication.create.mockResolvedValue({});
    mockPrisma.supplier.findUnique.mockResolvedValue(null);
  });

  describe('GET /api/v1/supplier-applications', () => {
    it('應該返回供應商申請列表（需要認證）', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'test-user-id', role: 'MEMBER' },
      });

      const mockApplications = [
        {
          id: 'app-1',
          applicantId: 'test-user-id',
          supplierId: 'supplier-1',
          status: 'PENDING',
          note: '測試申請',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockPrisma.supplierApplication.findMany.mockResolvedValue(mockApplications);
      mockPrisma.supplierApplication.count.mockResolvedValue(1);

      const request = new Request('http://localhost:3000/api/v1/supplier-applications', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('應該拒絕未認證用戶', async () => {
      mockGetAuthData.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/v1/supplier-applications', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('應該支援分頁', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'test-user-id', role: 'MEMBER' },
      });

      (mockPrisma.supplierApplication.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.supplierApplication.count as jest.Mock).mockResolvedValue(20);

      const request = new Request('http://localhost:3000/api/v1/supplier-applications?page=1&limit=10', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.total).toBe(20);
      expect(data.pagination.totalPages).toBe(2);
    });

    it('應該支援狀態篩選', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'test-user-id', role: 'MEMBER' },
      });

      (mockPrisma.supplierApplication.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.supplierApplication.count as jest.Mock).mockResolvedValue(0);

      const request = new Request('http://localhost:3000/api/v1/supplier-applications?status=PENDING', {
        method: 'GET',
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('應該處理錯誤', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'test-user-id', role: 'MEMBER' },
      });

      (mockPrisma.supplierApplication.findMany as jest.Mock).mockRejectedValue(new Error('資料庫錯誤'));

      const request = new Request('http://localhost:3000/api/v1/supplier-applications', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});

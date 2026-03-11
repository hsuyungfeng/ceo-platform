// @ts-nocheck
/**
 * Phase 7 優化測試 — 供應商API單元測試
 * 
 * 測試範圍：
 * - GET /api/suppliers - 供應商列表查詢
 * - POST /api/suppliers - 供應商註冊
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { Supplier, User } from '@prisma/client';
import { SupplierStatus } from '@prisma/client';

// Mock dependencies - using jest.spyOn because jest.mock isn't working

// Mock auth
const mockAuth = jest.fn() as jest.Mock;
jest.mock('@/auth', () => ({
  auth: mockAuth,
  handlers: {},
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock NextResponse
const mockJson = jest.fn();
const mockNextResponse = {
  json: mockJson,
};
console.log('Setting up next/server mock');
jest.mock('next/server', () => {
  console.log('next/server mock factory executing');
  return {
    NextResponse: mockNextResponse,
  };
});

// Import after mocks
import { GET, POST } from '@/app/api/suppliers/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Helper to create mock NextRequest (casts Request to NextRequest to satisfy TypeScript)
const createMockNextRequest = (url: string, init?: RequestInit): any => {
  return new Request(url, init);
};

describe('Suppliers API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/suppliers', () => {
    it('應該返回供應商列表（帶分頁）', async () => {
      const mockSuppliers = [
        {
          id: 'supplier-1',
          taxId: '12345678',
          companyName: '測試供應商1',
          contactPerson: '張三',
          phone: '0912345678',
          email: 'test1@example.com',
          address: '台北市',
          industry: '醫療器材',
          description: '測試描述',
          status: SupplierStatus.ACTIVE,
          isVerified: true,
          verifiedAt: new Date('2026-03-01'),
          verifiedBy: null,
          mainAccountId: 'user-1',
          createdAt: new Date('2026-03-01'),
          updatedAt: new Date('2026-03-01'),
          mainAccount: {
            id: 'user-1',
            name: '張三',
            email: 'test1@example.com',
          },
          _count: {
            applications: 5,
            products: 12,
          },
        },
        {
          id: 'supplier-2',
          taxId: '87654321',
          companyName: '測試供應商2',
          contactPerson: '李四',
          phone: '0987654321',
          email: 'test2@example.com',
          address: '新北市',
          industry: '食品原料',
          description: '另一測試描述',
          status: SupplierStatus.ACTIVE,
          isVerified: true,
          verifiedAt: new Date('2026-03-02'),
          verifiedBy: null,
          mainAccountId: 'user-2',
          createdAt: new Date('2026-03-02'),
          updatedAt: new Date('2026-03-02'),
          mainAccount: {
            id: 'user-2',
            name: '李四',
            email: 'test2@example.com',
          },
          _count: {
            applications: 3,
            products: 8,
          },
        },
      ];

      jest.spyOn(prisma.supplier, 'findMany').mockResolvedValue(mockSuppliers);
      jest.spyOn(prisma.supplier, 'count').mockResolvedValue(50);
      
      mockJson.mockImplementation((data, options) => {
        console.log('mockJson called with:', { data, options });
        return {};
      });

      const request = createMockNextRequest('http://localhost:3000/api/suppliers?page=1&limit=20&status=ACTIVE');
      try {
        await GET(request);
      } catch (error) {
        console.error('GET threw error:', error);
        throw error;
      }

      expect(prisma.supplier.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
        },
        include: {
          mainAccount: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              applications: true,
              products: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });

      expect(prisma.supplier.count).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
        },
      });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: [
          {
            id: 'supplier-1',
            taxId: '12345678',
            companyName: '測試供應商1',
            contactPerson: '張三',
            phone: '0912345678',
            email: 'test1@example.com',
            address: '台北市',
            industry: '醫療器材',
            description: '測試描述',
            status: 'ACTIVE',
            isVerified: true,
            verifiedAt: new Date('2026-03-01'),
            createdAt: new Date('2026-03-01'),
            mainAccount: {
              id: 'user-1',
              name: '張三',
              email: 'test1@example.com',
            },
            applicationsCount: 5,
            productsCount: 12,
          },
          {
            id: 'supplier-2',
            taxId: '87654321',
            companyName: '測試供應商2',
            contactPerson: '李四',
            phone: '0987654321',
            email: 'test2@example.com',
            address: '新北市',
            industry: '食品原料',
            description: '另一測試描述',
            status: 'ACTIVE',
            isVerified: true,
            verifiedAt: new Date('2026-03-02'),
            createdAt: new Date('2026-03-02'),
            mainAccount: {
              id: 'user-2',
              name: '李四',
              email: 'test2@example.com',
            },
            applicationsCount: 3,
            productsCount: 8,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 50,
          totalPages: 3,
          hasNextPage: true,
          hasPrevPage: false,
        },
      });
    });

    it('應該支持搜索功能', async () => {
      jest.spyOn(prisma.supplier, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.supplier, 'count').mockResolvedValue(0);

      const request = createMockNextRequest('http://localhost:3000/api/suppliers?search=醫療');
      await GET(request);

      expect(prisma.supplier.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          OR: [
            { companyName: { contains: '醫療', mode: 'insensitive' } },
            { taxId: { contains: '醫療', mode: 'insensitive' } },
            { industry: { contains: '醫療', mode: 'insensitive' } },
          ],
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('應該處理伺服器錯誤', async () => {
      // @ts-ignore
      (prisma.supplier.findMany as jest.Mock).mockRejectedValue(new Error('資料庫錯誤'));

      const request = createMockNextRequest('http://localhost:3000/api/suppliers');
      await GET(request);

      expect(mockJson).toHaveBeenCalledWith(
        { success: false, error: '伺服器錯誤，請稍後再試' },
        { status: 500 }
      );
    });
  });

  describe('POST /api/suppliers', () => {
    it('應該成功註冊供應商', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          name: '測試用戶',
          email: 'user@example.com',
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      (prisma.supplier.findFirst as jest.Mock).mockResolvedValue(null);

      const mockSupplier = {
        id: 'supplier-new',
        taxId: '99998888',
        companyName: '新供應商',
        contactPerson: '王五',
        phone: '0911111111',
        email: 'new@example.com',
        address: '高雄市',
        industry: '電子零件',
        description: '新註冊供應商',
        status: 'PENDING',
        mainAccountId: 'user-123',
        createdAt: new Date(),
        mainAccount: {
          id: 'user-123',
          name: '測試用戶',
          email: 'user@example.com',
        },
      };

      (prisma.supplier.create as jest.Mock).mockResolvedValue(mockSupplier);
      (prisma.supplierAccount.create as jest.Mock).mockResolvedValue({});

      const request = createMockNextRequest('http://localhost:3000/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxId: '99998888',
          companyName: '新供應商',
          contactPerson: '王五',
          phone: '0911111111',
          email: 'new@example.com',
          address: '高雄市',
          industry: '電子零件',
          description: '新註冊供應商',
        }),
      });

      await POST(request);

      expect(mockAuth).toHaveBeenCalled();
      expect(prisma.supplier.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { taxId: '99998888' },
            { email: 'new@example.com' },
          ],
        },
      });

      expect(prisma.supplier.create).toHaveBeenCalledWith({
        data: {
          taxId: '99998888',
          companyName: '新供應商',
          contactPerson: '王五',
          phone: '0911111111',
          email: 'new@example.com',
          address: '高雄市',
          industry: '電子零件',
          description: '新註冊供應商',
          status: 'PENDING',
          mainAccountId: 'user-123',
        },
        include: {
          mainAccount: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      expect(prisma.supplierAccount.create).toHaveBeenCalledWith({
        data: {
          supplierId: 'supplier-new',
          balance: 0,
          totalSpent: 0,
          creditLimit: 0,
          billingRate: 0.001,
        },
      });

      expect(mockJson).toHaveBeenCalledWith(
        {
          success: true,
          data: {
            id: 'supplier-new',
            taxId: '99998888',
            companyName: '新供應商',
            contactPerson: '王五',
            phone: '0911111111',
            email: 'new@example.com',
            status: 'PENDING',
            createdAt: mockSupplier.createdAt,
          },
          message: '供應商註冊成功，請等待審批',
        },
        { status: 201 }
      );
    });

    it('應該返回錯誤當用戶未登入', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockNextRequest('http://localhost:3000/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxId: '99998888',
          companyName: '新供應商',
          contactPerson: '王五',
          phone: '0911111111',
          email: 'new@example.com',
        }),
      });

      await POST(request);

      expect(mockJson).toHaveBeenCalledWith(
        { success: false, error: '請先登入帳號' },
        { status: 401 }
      );
    });

    it('應該返回錯誤當統一編號或郵件已被使用', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      (prisma.supplier.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-supplier',
        taxId: '99998888',
        companyName: '現有供應商',
      });

      const request = createMockNextRequest('http://localhost:3000/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxId: '99998888',
          companyName: '新供應商',
          contactPerson: '王五',
          phone: '0911111111',
          email: 'new@example.com',
        }),
      });

      await POST(request);

      expect(mockJson).toHaveBeenCalledWith(
        { success: false, error: '統一編號或電子郵件已被使用' },
        { status: 400 }
      );
    });

    it('應該返回驗證錯誤當數據無效', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
        },
      };

      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest('http://localhost:3000/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxId: '123', // 太短
          companyName: '',
          contactPerson: '',
          phone: '',
          email: 'invalid-email',
        }),
      });

      await POST(request);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: '數據驗證失敗',
          errors: expect.any(Array),
        }),
        { status: 400 }
      );
    });

    it('應該處理伺服器錯誤', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      (prisma.supplier.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.supplier.create as jest.Mock).mockRejectedValue(new Error('資料庫錯誤'));

      const request = createMockNextRequest('http://localhost:3000/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxId: '99998888',
          companyName: '新供應商',
          contactPerson: '王五',
          phone: '0911111111',
          email: 'new@example.com',
        }),
      });

      await POST(request);

      expect(mockJson).toHaveBeenCalledWith(
        { success: false, error: '伺服器錯誤，請稍後再試' },
        { status: 500 }
      );
    });
  });
});
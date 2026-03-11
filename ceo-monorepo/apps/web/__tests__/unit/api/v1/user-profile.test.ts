/**
 * API v1 用戶個人資料端點單元測試
 */

import { GET, PUT } from '@/app/api/v1/user/profile/route';
import { prisma } from '@/lib/prisma';
import { getAuthData } from '@/lib/auth-helper';

// 模擬 Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));

// 模擬 getAuthData
jest.mock('@/lib/auth-helper', () => ({
  getAuthData: jest.fn().mockResolvedValue(null),
}));

describe('API v1 用戶個人資料端點', () => {
  let mockGetAuthData: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthData = getAuthData as jest.Mock;
  });

  describe('GET /api/v1/user/profile', () => {
    it('應拒絕未認證的請求', async () => {
      mockGetAuthData.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/v1/user/profile', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('應該返回用戶個人資料', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: '測試用戶',
        phone: '0912345678',
        company: '測試公司',
        role: 'MEMBER',
      };

      mockGetAuthData.mockResolvedValue({
        userId: mockUser.id,
        email: mockUser.email,
        role: 'MEMBER',
        user: mockUser,
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const request = new Request('http://localhost:3000/api/v1/user/profile', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(mockUser.email);
    });

    it('應該處理錯誤', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'user-1',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'user-1', role: 'MEMBER' },
      });

      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('資料庫錯誤'));

      const request = new Request('http://localhost:3000/api/v1/user/profile', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/v1/user/profile', () => {
    it('應該更新用戶個人資料', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'user-1',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'user-1', role: 'MEMBER' },
      });

      const updatedUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: '更新後的用戶',
        phone: '0912345678',
        company: '測試公司',
        role: 'MEMBER',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const request = new Request('http://localhost:3000/api/v1/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '更新後的用戶',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('應該驗證必填欄位', async () => {
      mockGetAuthData.mockResolvedValue({
        userId: 'user-1',
        email: 'test@example.com',
        role: 'MEMBER',
        user: { id: 'user-1', role: 'MEMBER' },
      });

      const request = new Request('http://localhost:3000/api/v1/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
    });
  });
});

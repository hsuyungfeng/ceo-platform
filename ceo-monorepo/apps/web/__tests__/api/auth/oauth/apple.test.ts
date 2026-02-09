import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    oAuthAccount: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    tempOAuth: {
      create: jest.fn(),
    },
  },
}));

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
}));

jest.mock('next-auth/jwt', () => ({
  encode: jest.fn(),
}));

// Mock NextResponse
const mockJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: mockJson,
  },
}));

// Import after mocks
import { POST } from '@/app/api/auth/oauth/apple/route';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { encode } from 'next-auth/jwt';

describe('Apple OAuth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error for missing identity token', async () => {
    const request = new Request('http://localhost:3000/api/auth/oauth/apple', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    await POST(request);

    expect(mockJson).toHaveBeenCalledWith(
      { error: '缺少必要的身份令牌' },
      { status: 400 }
    );
  });

  it('should return error for invalid identity token', async () => {
    (jwt.decode as jest.Mock).mockReturnValue(null);

    const request = new Request('http://localhost:3000/api/auth/oauth/apple', {
      method: 'POST',
      body: JSON.stringify({ identityToken: 'invalid-token' }),
    });

    await POST(request);

    expect(mockJson).toHaveBeenCalledWith(
      { error: '無效的身份令牌' },
      { status: 400 }
    );
  });

  it('should handle existing OAuth account', async () => {
    const mockUser = {
      id: 'user-123',
      taxId: '12345678',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: new Date(),
    };

    const mockOAuthAccount = {
      provider: 'apple',
      providerId: 'apple-123',
      userId: 'user-123',
      appleUserId: 'apple-123',
      email: 'test@example.com',
      name: 'Test User',
      identityToken: 'valid-token',
      authorizationCode: 'auth-code',
      user: mockUser,
    };

    (prisma.oAuthAccount.findUnique as jest.Mock).mockResolvedValue(mockOAuthAccount);
    (jwt.decode as jest.Mock).mockReturnValue({
      sub: 'apple-123',
      email: 'test@example.com',
    });
    (encode as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new Request('http://localhost:3000/api/auth/oauth/apple', {
      method: 'POST',
      body: JSON.stringify({
        identityToken: 'valid-token',
        authorizationCode: 'auth-code',
        user: { name: 'Test User' },
      }),
    });

    await POST(request);

    expect(mockJson).toHaveBeenCalled();
    const call = mockJson.mock.calls[0];
    expect(call[0].success).toBe(true);
    expect(call[0].token).toBe('mock-jwt-token');
    expect(call[0].user.id).toBe('user-123');
    expect(call[0].user.email).toBe('test@example.com');
  });

  it('should link Apple account to existing user', async () => {
    const mockUser = {
      id: 'user-123',
      taxId: '12345678',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: new Date(),
    };

    (prisma.oAuthAccount.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.oAuthAccount.create as jest.Mock).mockResolvedValue({
      provider: 'apple',
      providerId: 'apple-123',
      userId: 'user-123',
    });

    (jwt.decode as jest.Mock).mockReturnValue({
      sub: 'apple-123',
      email: 'test@example.com',
    });
    (encode as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new Request('http://localhost:3000/api/auth/oauth/apple', {
      method: 'POST',
      body: JSON.stringify({
        identityToken: 'valid-token',
        authorizationCode: 'auth-code',
        user: { name: 'Test User' },
      }),
    });

    await POST(request);

    expect(prisma.oAuthAccount.create).toHaveBeenCalledWith({
      data: {
        provider: 'apple',
        providerId: 'apple-123',
        userId: 'user-123',
        appleUserId: 'apple-123',
        email: 'test@example.com',
        name: 'Test User',
        identityToken: 'valid-token',
        authorizationCode: 'auth-code',
      },
    });
    
    expect(mockJson).toHaveBeenCalled();
    const call = mockJson.mock.calls[0];
    expect(call[0].success).toBe(true);
    expect(call[0].token).toBe('mock-jwt-token');
  });

  it('should create temp OAuth data for new user', async () => {
    (prisma.oAuthAccount.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.tempOAuth.create as jest.Mock).mockResolvedValue({
      id: 'temp-123',
      provider: 'apple',
      providerId: 'apple-123',
      email: 'new@example.com',
      name: 'New User',
    });

    (jwt.decode as jest.Mock).mockReturnValue({
      sub: 'apple-123',
      email: 'new@example.com',
    });

    const request = new Request('http://localhost:3000/api/auth/oauth/apple', {
      method: 'POST',
      body: JSON.stringify({
        identityToken: 'valid-token',
        authorizationCode: 'auth-code',
        user: { name: 'New User' },
      }),
    });

    await POST(request);

    expect(mockJson).toHaveBeenCalled();
    const call = mockJson.mock.calls[0];
    expect(call[0].success).toBe(true);
    expect(call[0].requiresRegistration).toBe(true);
    expect(call[0].tempOAuthId).toBe('temp-123');
    expect(call[0].email).toBe('new@example.com');
    expect(call[0].name).toBe('New User');
  });

  it('should handle server error when NEXTAUTH_SECRET is missing', async () => {
    const mockUser = {
      id: 'user-123',
      taxId: '12345678',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: new Date(),
    };

    const mockOAuthAccount = {
      provider: 'apple',
      providerId: 'apple-123',
      userId: 'user-123',
      appleUserId: 'apple-123',
      email: 'test@example.com',
      name: 'Test User',
      identityToken: 'valid-token',
      authorizationCode: 'auth-code',
      user: mockUser,
    };

    (prisma.oAuthAccount.findUnique as jest.Mock).mockResolvedValue(mockOAuthAccount);
    (jwt.decode as jest.Mock).mockReturnValue({
      sub: 'apple-123',
      email: 'test@example.com',
    });

    const originalSecret = process.env.NEXTAUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;

    const request = new Request('http://localhost:3000/api/auth/oauth/apple', {
      method: 'POST',
      body: JSON.stringify({
        identityToken: 'valid-token',
        authorizationCode: 'auth-code',
        user: { name: 'Test User' },
      }),
    });

    await POST(request);

    expect(mockJson).toHaveBeenCalledWith(
      { error: '伺服器設定錯誤，請聯絡管理員' },
      { status: 500 }
    );

    if (originalSecret) {
      process.env.NEXTAUTH_SECRET = originalSecret;
    }
  });

  it('should handle general errors', async () => {
    (jwt.decode as jest.Mock).mockImplementation(() => {
      throw new Error('Decoding error');
    });

    const request = new Request('http://localhost:3000/api/auth/oauth/apple', {
      method: 'POST',
      body: JSON.stringify({
        identityToken: 'invalid-token',
      }),
    });

    await POST(request);

    expect(mockJson).toHaveBeenCalledWith(
      { error: 'Apple 登入失敗，請稍後再試' },
      { status: 500 }
    );
  });
});
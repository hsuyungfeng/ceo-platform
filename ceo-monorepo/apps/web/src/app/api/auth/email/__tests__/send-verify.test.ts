import { describe, it, expect, beforeEach } from '@jest/globals';
import { POST } from '../send-verify/route';
import { NextRequest } from 'next/server';
import { emailRateLimiter } from '@/lib/rate-limiter';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('@/lib/prisma');
jest.mock('@/lib/email/service');
jest.mock('@/lib/logger');

describe('POST /api/auth/email/send-verify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset rate limiter by creating a new instance for each test
    emailRateLimiter.reset('send-verify:127.0.0.1');
  });

  it('should send verification code to valid email', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
    (prisma.emailVerification.deleteMany as jest.Mock).mockResolvedValueOnce({ count: 0 });
    (prisma.emailVerification.create as jest.Mock).mockResolvedValueOnce({
      id: 'verify-123',
      email: 'test@example.com',
      token: 'token123',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      purpose: 'VERIFY_EMAIL',
      userId: 'user-123',
      createdAt: new Date(),
    });

    const req = new NextRequest('http://localhost:3000/api/auth/email/send-verify', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toContain('驗證郵件已發送');
    expect(data.expiresAt).toBeDefined();
  });

  it('should reject invalid email format', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/email/send-verify', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('should enforce rate limiting (5 per 15 minutes)', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.emailVerification.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.emailVerification.create as jest.Mock).mockResolvedValue({
      id: 'verify-123',
      email: 'test@example.com',
      token: 'token123',
      expiresAt: new Date(),
      purpose: 'VERIFY_EMAIL',
      userId: 'user-123',
      createdAt: new Date(),
    });

    const ip = '192.168.1.100';
    const createRequest = () =>
      new NextRequest('http://localhost:3000/api/auth/email/send-verify', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
        headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      });

    // Reset rate limiter for this IP
    emailRateLimiter.reset(`send-verify:${ip}`);

    // Send 5 requests (should all succeed)
    for (let i = 0; i < 5; i++) {
      const res = await POST(createRequest());
      expect(res.status).toBe(200);
    }

    // 6th request should be rate limited
    const res = await POST(createRequest());
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain('發送過於頻繁');
    expect(data.retryAfter).toBeDefined();
    expect(typeof data.retryAfter).toBe('number');
  });

  it('should handle missing purpose with default VERIFY_EMAIL', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
    (prisma.emailVerification.deleteMany as jest.Mock).mockResolvedValueOnce({ count: 0 });
    (prisma.emailVerification.create as jest.Mock).mockResolvedValueOnce({
      id: 'verify-123',
      email: 'test@example.com',
      token: 'token123',
      expiresAt: new Date(),
      purpose: 'VERIFY_EMAIL',
      userId: 'user-123',
      createdAt: new Date(),
    });

    const req = new NextRequest('http://localhost:3000/api/auth/email/send-verify', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verify the call used VERIFY_EMAIL as default
    const callArgs = (prisma.emailVerification.create as jest.Mock).mock.calls[0];
    expect(callArgs[0].data.purpose).toBe('VERIFY_EMAIL');
  });

  it('should return 404 for non-existent user on VERIFY_EMAIL', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/api/auth/email/send-verify', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        purpose: 'VERIFY_EMAIL',
      }),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain('找不到');
  });

  it('should allow RESET_PASSWORD for non-existent user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.emailVerification.deleteMany as jest.Mock).mockResolvedValueOnce({ count: 0 });
    (prisma.emailVerification.create as jest.Mock).mockResolvedValueOnce({
      id: 'verify-123',
      email: 'test@example.com',
      token: 'token123',
      expiresAt: new Date(),
      purpose: 'RESET_PASSWORD',
      userId: null,
      createdAt: new Date(),
    });

    const req = new NextRequest('http://localhost:3000/api/auth/email/send-verify', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        purpose: 'RESET_PASSWORD',
      }),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

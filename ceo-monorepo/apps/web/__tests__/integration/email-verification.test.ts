// apps/web/__tests__/integration/email-verification.test.ts
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';

// Mock the email service before imports
jest.mock('@/lib/email/service', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
    sendResetPasswordEmail: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
    sendTwoFactorCode: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
  },
}));

// Mock Resend to avoid API key issues
jest.mock('@/lib/email/config', () => ({
  resend: {
    emails: {
      send: jest.fn().mockResolvedValue({ data: { id: 'mock-email-id' }, error: null }),
    },
  },
  EMAIL_CONFIG: {
    from: 'test@example.com',
    replyTo: 'reply@example.com',
    companyName: 'CEO團購平台',
  },
  EMAIL_TEMPLATES: {
    VERIFY_EMAIL: 'verify-email',
    RESET_PASSWORD: 'reset-password',
    TWO_FACTOR_AUTH: 'two-factor-auth',
    WELCOME: 'welcome',
    ORDER_CONFIRMATION: 'order-confirmation',
  },
}));

import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// Set environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000';

describe('Email Verification System Integration Tests', () => {
  beforeAll(async () => {
    // 清理測試資料
    await prisma.emailVerification.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-email-' } },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should register user with email verification', async () => {
    // 測試用戶註冊
    const testEmail = `test-email-${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: await hash('password123', 10),
        name: 'Test User',
        taxId: `test${Date.now()}`,
        emailVerified: false,
      },
    });

    expect(user).toBeDefined();
    expect(user.emailVerified).toBe(false);
    expect(user.email).toBe(testEmail);
  });

  it('should send verification email', async () => {
    const testEmail = `test-email-${Date.now()}@example.com`;
    
    // 先創建用戶
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: await hash('password123', 10),
        name: 'Test User',
        taxId: `test${Date.now()}`,
        emailVerified: false,
      },
    });

    // 測試發送驗證郵件API
    const response = await fetch('http://localhost:3000/api/auth/email/send-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        purpose: 'VERIFY_EMAIL',
      }),
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.message).toBe('驗證郵件已發送');
    expect(result.expiresAt).toBeDefined();

    // 驗證資料庫中有驗證記錄
    const verification = await prisma.emailVerification.findFirst({
      where: { email: testEmail },
    });

    expect(verification).toBeDefined();
    expect(verification?.purpose).toBe('VERIFY_EMAIL');
    expect(verification?.userId).toBe(user.id);
  });

  it('should verify email with valid token', async () => {
    const testEmail = `test-email-${Date.now()}@example.com`;
    
    // 創建用戶
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: await hash('password123', 10),
        name: 'Test User',
        taxId: `test${Date.now()}`,
        emailVerified: false,
      },
    });

    // 創建驗證記錄
    const verification = await prisma.emailVerification.create({
      data: {
        email: testEmail,
        token: 'test-verification-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小時後
        purpose: 'VERIFY_EMAIL',
        userId: user.id,
      },
    });

    // 測試驗證郵件API
    const response = await fetch('http://localhost:3000/api/auth/email/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'test-verification-token',
      }),
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.message).toBe('郵件驗證成功');
    expect(result.purpose).toBe('VERIFY_EMAIL');
    expect(result.userId).toBe(user.id);

    // 驗證用戶郵件驗證狀態已更新
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser?.emailVerified).toBe(true);

    // 驗證驗證記錄已刪除
    const deletedVerification = await prisma.emailVerification.findUnique({
      where: { id: verification.id },
    });

    expect(deletedVerification).toBeNull();
  });

  it('should handle two-factor authentication via email', async () => {
    const testEmail = `test-email-${Date.now()}@example.com`;
    const taxId = `test${Date.now()}`;
    
    // 創建已驗證郵件的用戶
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: await hash('password123', 10),
        name: 'Test User',
        taxId: taxId,
        emailVerified: true,
        twoFactorEnabled: true,
        twoFactorMethod: 'EMAIL',
      },
    });

    // 創建2FA驗證記錄
    const verification = await prisma.emailVerification.create({
      data: {
        email: testEmail,
        token: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10分鐘後
        purpose: 'TWO_FACTOR_AUTH',
        userId: user.id,
      },
    });

    expect(verification).toBeDefined();
    expect(verification.token).toBe('123456');
    expect(verification.purpose).toBe('TWO_FACTOR_AUTH');
    expect(verification.userId).toBe(user.id);
  });

  it('should handle forgot password flow', async () => {
    const testEmail = `test-email-${Date.now()}@example.com`;
    
    // 創建用戶
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: await hash('oldpassword', 10),
        name: 'Test User',
        taxId: `test${Date.now()}`,
        emailVerified: true,
      },
    });

    // 測試忘記密碼API
    const response = await fetch('http://localhost:3000/api/auth/email/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
      }),
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.message).toContain('重設密碼連結');

    // 驗證重設密碼記錄已創建
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email: testEmail,
        purpose: 'RESET_PASSWORD',
      },
    });

    expect(verification).toBeDefined();
    expect(verification?.userId).toBe(user.id);
  });
});
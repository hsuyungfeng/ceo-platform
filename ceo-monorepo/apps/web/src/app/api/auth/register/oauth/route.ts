import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// 註冊資料驗證 schema
const registerSchema = z.object({
  tempOAuthId: z.string().min(1, '暫存 ID 不能為空'),
  companyName: z.string().min(1, '公司名稱不能為空'),
  taxId: z.string().length(8, '統一編號必須是8位數字').regex(/^\d+$/, '統一編號必須是數字'),
  contactPerson: z.string().min(1, '聯絡人不能為空'),
  phone: z.string().min(1, '電話不能為空'),
  fax: z.string().optional(),
  address: z.string().min(1, '地址不能為空'),
  email: z.string().email('請輸入有效的電子郵件'),
  name: z.string().min(1, '姓名不能為空'),
  password: z.string().min(8, '密碼長度至少8位'),
  confirmPassword: z.string().min(1, '請確認密碼'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼與確認密碼不符',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 驗證輸入資料
    const validatedData = registerSchema.safeParse(body);
    if (!validatedData.success) {
      const errors = validatedData.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      
      return NextResponse.json(
        { error: '驗證失敗', errors },
        { status: 400 }
      );
    }

    const {
      tempOAuthId,
      companyName,
      taxId,
      contactPerson,
      phone,
      fax,
      address,
      email,
      name,
      password,
    } = validatedData.data;

    // 檢查暫存 OAuth 資料
    const tempOAuth = await prisma.tempOAuth.findUnique({
      where: { id: tempOAuthId },
    });

    if (!tempOAuth) {
      return NextResponse.json(
        { error: '暫存資料不存在或已過期' },
        { status: 404 }
      );
    }

    // 檢查是否過期
    if (tempOAuth.expiresAt < new Date()) {
      await prisma.tempOAuth.delete({
        where: { id: tempOAuthId },
      });
      
      return NextResponse.json(
        { error: '暫存資料已過期，請重新嘗試' },
        { status: 410 }
      );
    }

    // 檢查 email 是否已被使用
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: '此電子郵件已被使用' },
        { status: 400 }
      );
    }

    // 檢查統一編號是否已被使用
    const existingUserByTaxId = await prisma.user.findUnique({
      where: { taxId },
    });

    if (existingUserByTaxId) {
      return NextResponse.json(
        { error: '此統一編號已被使用' },
        { status: 400 }
      );
    }

    // 開始交易
    const result = await prisma.$transaction(async (tx) => {
      // 建立使用者
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: companyName, // 使用公司名稱作為使用者名稱
          taxId,
          phone,
          fax,
          address,
          contactPerson,
          emailVerified: true, // OAuth 註冊預設已驗證郵件
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      });

      // 建立會員資料
      const member = await tx.member.create({
        data: {
          userId: user.id,
          points: 0,
          totalSpent: 0,
        },
      });

      // 建立 OAuth 帳戶連結
      const oauthAccount = await tx.oAuthAccount.create({
        data: {
          provider: tempOAuth.provider,
          providerId: tempOAuth.providerId,
          userId: user.id,
          email: tempOAuth.email,
          name: tempOAuth.name,
          picture: tempOAuth.picture,
          accessToken: tempOAuth.accessToken,
          refreshToken: tempOAuth.refreshToken,
          expiresAt: tempOAuth.tokenExpiresAt,
        },
      });

      // 刪除暫存資料
      await tx.tempOAuth.delete({
        where: { id: tempOAuthId },
      });

      return { user, member, oauthAccount };
    });

    // 建立 JWT token（模仿 NextAuth 的登入流程）
    const tokenData = {
      id: result.user.id,
      taxId: result.user.taxId,
      role: result.user.role,
      status: result.user.status,
      emailVerified: result.user.emailVerified,
    };

    // 這裡可以選擇性地建立 session 或直接回傳 token
    // 為了與現有系統兼容，我們回傳與登入 API 相同的格式
    return NextResponse.json({
      message: '註冊成功',
      user: {
        id: result.user.id,
        name: result.user.name,
        taxId: result.user.taxId,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        status: result.user.status,
        emailVerified: result.user.emailVerified,
        createdAt: result.user.createdAt,
        member: {
          id: result.member.id,
          userId: result.member.userId,
          points: result.member.points,
          totalSpent: result.member.totalSpent,
        },
      },
      // 為了 Mobile App 兼容性，也回傳 token
      token: Buffer.from(JSON.stringify(tokenData)).toString('base64'),
    });

  } catch (error) {
    console.error('OAuth 註冊錯誤:', error);
    
    // 處理唯一性約束錯誤
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: '此電子郵件已被使用' },
          { status: 400 }
        );
      }
      if (error.message.includes('taxId')) {
        return NextResponse.json(
          { error: '此統一編號已被使用' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
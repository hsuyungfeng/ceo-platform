// apps/web/src/app/api/auth/email/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string().min(1, '驗證碼不能為空'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifySchema.parse(body);

    // 查找驗證記錄
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json(
        { error: '無效的驗證連結' },
        { status: 400 }
      );
    }

    // 檢查是否過期
    if (verification.expiresAt < new Date()) {
      await prisma.emailVerification.delete({
        where: { id: verification.id },
      });
      return NextResponse.json(
        { error: '驗證連結已過期' },
        { status: 400 }
      );
    }

    // 根據用途處理
    switch (verification.purpose) {
      case 'VERIFY_EMAIL':
        if (verification.user) {
          // 更新用戶郵件驗證狀態
          await prisma.user.update({
            where: { id: verification.user.id },
            data: { emailVerified: true },
          });
        }
        break;

      case 'RESET_PASSWORD':
        // 重設密碼流程需要額外步驟
        break;

      default:
        break;
    }

    // 刪除已使用的驗證記錄
    await prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return NextResponse.json({
      message: '郵件驗證成功',
      purpose: verification.purpose,
      userId: verification.userId,
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: '郵件驗證失敗' },
      { status: 500 }
    );
  }
}
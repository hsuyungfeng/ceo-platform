// apps/web/src/app/api/auth/email/send-verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email/service';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const sendVerifySchema = z.object({
  email: z.string().email('請輸入有效的電子郵件'),
  purpose: z.enum(['VERIFY_EMAIL', 'RESET_PASSWORD', 'CHANGE_EMAIL', 'TWO_FACTOR_AUTH']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, purpose = 'VERIFY_EMAIL' } = sendVerifySchema.parse(body);

    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 如果是驗證郵件但用戶不存在，返回錯誤
    if (purpose === 'VERIFY_EMAIL' && !user) {
      return NextResponse.json(
        { error: '找不到使用此郵件的用戶' },
        { status: 404 }
      );
    }

    // 生成驗證Token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24小時有效

    // 刪除舊的驗證記錄
    await prisma.emailVerification.deleteMany({
      where: { email },
    });

    // 創建新的驗證記錄
    const verification = await prisma.emailVerification.create({
      data: {
        email,
        token,
        expiresAt,
        purpose,
        userId: user?.id,
      },
    });

    // 發送郵件
    if (purpose === 'VERIFY_EMAIL' && user) {
      await emailService.sendVerificationEmail(email, token, user.name);
    } else if (purpose === 'RESET_PASSWORD') {
      await emailService.sendResetPasswordEmail(email, token, user?.name);
    }

    return NextResponse.json({
      message: '驗證郵件已發送',
      expiresAt: verification.expiresAt,
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: '發送驗證郵件失敗' },
      { status: 500 }
    );
  }
}
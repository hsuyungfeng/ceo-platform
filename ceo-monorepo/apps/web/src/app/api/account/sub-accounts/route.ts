import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const CreateSubAccountSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件'),
  name: z.string().min(1, '姓名必填'),
  phone: z.string().optional(),
  role: z.enum(['MEMBER', 'ADMIN']).default('MEMBER'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '請先登入帳號' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subAccounts: {
          where: {
            status: { not: 'DELETED' },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用戶不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.subAccounts.map(a => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        role: a.role,
        status: a.status,
        createdAt: a.createdAt,
        lastLoginAt: a.lastLoginAt,
      })),
    });

  } catch (error) {
    console.error('取得附屬帳號列表錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '請先登入帳號' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: '請求體格式錯誤' },
        { status: 400 }
      );
    }

    const validationResult = CreateSubAccountSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json(
        { success: false, error: '數據驗證失敗', errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '此電子郵件已被使用' },
        { status: 400 }
      );
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const subAccount = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        password: hashedPassword,
        role: data.role,
        status: 'ACTIVE',
        mainAccountId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: subAccount.id,
          email: subAccount.email,
          name: subAccount.name,
          phone: subAccount.phone,
          role: subAccount.role,
          status: subAccount.status,
          createdAt: subAccount.createdAt,
          tempPassword,
        },
        message: '附屬帳號建立成功，請將臨時密碼提供給使用者',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('建立附屬帳號錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

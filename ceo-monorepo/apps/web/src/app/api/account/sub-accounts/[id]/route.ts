import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const UpdateSubAccountSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(['MEMBER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '請先登入帳號' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const subAccount = await prisma.user.findFirst({
      where: {
        id,
        mainAccountId: session.user.id,
      },
    });

    if (!subAccount) {
      return NextResponse.json(
        { success: false, error: '附屬帳號不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: subAccount.id,
        name: subAccount.name,
        email: subAccount.email,
        phone: subAccount.phone,
        role: subAccount.role,
        status: subAccount.status,
        createdAt: subAccount.createdAt,
        lastLoginAt: subAccount.lastLoginAt,
      },
    });

  } catch (error) {
    console.error('取得附屬帳號詳情錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '請先登入帳號' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const subAccount = await prisma.user.findFirst({
      where: {
        id,
        mainAccountId: session.user.id,
      },
    });

    if (!subAccount) {
      return NextResponse.json(
        { success: false, error: '附屬帳號不存在' },
        { status: 404 }
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

    const validationResult = UpdateSubAccountSchema.safeParse(body);
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

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        role: data.role,
        status: data.status,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
      message: '附屬帳號更新成功',
    });

  } catch (error) {
    console.error('更新附屬帳號錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '請先登入帳號' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const subAccount = await prisma.user.findFirst({
      where: {
        id,
        mainAccountId: session.user.id,
      },
    });

    if (!subAccount) {
      return NextResponse.json(
        { success: false, error: '附屬帳號不存在' },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id },
      data: {
        status: 'DELETED',
        email: `${subAccount.email}_deleted_${Date.now()}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: '附屬帳號已刪除',
    });

  } catch (error) {
    console.error('刪除附屬帳號錯誤:', error);
    return NextResponse.json(
      { success: false, error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

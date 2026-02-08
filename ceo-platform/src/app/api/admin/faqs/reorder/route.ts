import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { ApiResponse, ReorderFaqSchema } from '@/types/admin';

export async function POST(request: NextRequest) {
  try {
    // 驗證管理員權限
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) {
      return adminCheck.error;
    }

    // 解析請求體
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: '請求體格式錯誤，必須是有效的 JSON',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // 驗證請求數據
    const validationResult = ReorderFaqSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      
      return NextResponse.json(
        {
          success: false,
          error: '數據驗證失敗',
          errors,
        } as ApiResponse,
        { status: 400 }
      );
    }

    const { items } = validationResult.data;

    // 檢查所有 FAQ ID 是否存在
    const faqIds = items.map(item => item.id);
    const existingFaqs = await prisma.faq.findMany({
      where: {
        id: { in: faqIds },
      },
      select: { id: true },
    });

    const existingIds = new Set(existingFaqs.map(faq => faq.id));
    const missingIds = faqIds.filter(id => !existingIds.has(id));

    if (missingIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `以下 FAQ 不存在: ${missingIds.join(', ')}`,
        } as ApiResponse,
        { status: 404 }
      );
    }

    // 檢查排序值是否唯一
    const sortOrders = items.map(item => item.sortOrder);
    const uniqueSortOrders = new Set(sortOrders);
    if (uniqueSortOrders.size !== sortOrders.length) {
      return NextResponse.json(
        {
          success: false,
          error: '排序值必須是唯一的',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // 使用事務更新所有 FAQ 的排序
    const updateOperations = items.map(item =>
      prisma.faq.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    );

    await prisma.$transaction(updateOperations);

    return NextResponse.json({
      success: true,
      message: 'FAQ 重新排序成功',
      data: { updatedCount: items.length },
    } as ApiResponse);

  } catch (error) {
    console.error('重新排序 FAQ 錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: '伺服器錯誤，請稍後再試',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
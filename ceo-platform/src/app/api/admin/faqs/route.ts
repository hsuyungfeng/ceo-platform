import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { ApiResponse } from '@/types/admin';
import { faqQuerySchema } from './schema';

// 錯誤訊息常數
const ERROR_MESSAGES = {
  VALIDATION_FAILED: '查詢參數驗證失敗',
  SERVER_ERROR: '伺服器錯誤，請稍後再試',
} as const;

export async function GET(request: NextRequest) {
  try {
    // 驗證管理員權限
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) {
      return adminCheck.error;
    }

    const { searchParams } = new URL(request.url);
    
    // 解析和驗證查詢參數
    const queryParams = faqQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search') || undefined,
      isActive: searchParams.get('isActive') || undefined,
    });

    if (!queryParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.VALIDATION_FAILED,
          errors: queryParams.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        } as ApiResponse,
        { status: 400 }
      );
    }
    
    const { page, limit, search, isActive } = queryParams.data;
    const skip = (page - 1) * limit;

    // 建立查詢條件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // 搜尋條件
    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 狀態條件
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 查詢 FAQ
    const [faqs, total] = await Promise.all([
      prisma.faq.findMany({
        where,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.faq.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: faqs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    } as ApiResponse);

  } catch (error) {
    console.error('取得 FAQ 列表錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
      } as ApiResponse,
      { status: 500 }
    );
  }
}
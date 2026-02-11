import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 搜尋查詢參數驗證 schema
const searchQuerySchema = z.object({
  q: z.string().min(1, '搜尋關鍵字不能為空'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析和驗證查詢參數
    const queryParams = {
      q: searchParams.get('q'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      categoryId: searchParams.get('categoryId') || undefined, // 將null轉換為undefined
    };

    const validationResult = searchQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '無效的搜尋參數', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { q: searchQuery, page, limit, categoryId } = validationResult.data;
    const skip = (page - 1) * limit;

    // 建立搜尋條件
    const where: any = {
      isActive: true,
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { subtitle: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ],
    };

    // 分類篩選
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 執行查詢
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          firm: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          priceTiers: {
            orderBy: {
              minQty: 'asc',
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // 格式化回應數據
    const formattedProducts = products.map(product => {
      const lowestPrice = product.priceTiers[0]?.price || 0;
      
      return {
        id: product.id,
        name: product.name,
        subtitle: product.subtitle,
        image: product.image,
        unit: product.unit,
        isFeatured: product.isFeatured,
        startDate: product.startDate,
        endDate: product.endDate,
        totalSold: product.totalSold,
        price: lowestPrice,
        firm: product.firm?.name || '未知廠商',
        category: product.category?.name || '未分類',
      };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      searchQuery,
    });
  } catch (error) {
    console.error('搜尋商品時發生錯誤:', error);
    return NextResponse.json(
      { error: '搜尋失敗' },
      { status: 500 }
    );
  }
}
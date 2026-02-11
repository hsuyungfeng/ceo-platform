import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 並行獲取所有首頁需要的數據
    const [featuredProducts, categories, latestProducts] = await Promise.all([
      // 獲取熱門商品（最多4個）
      prisma.product.findMany({
        where: {
          isActive: true,
          isFeatured: true,
          endDate: {
            gt: new Date(), // 只取未結束的團購
          },
        },
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
        take: 4,
      }),
      // 獲取分類（只取頂級分類）
      prisma.category.findMany({
        where: {
          level: 1,
          isActive: true,
        },
        include: {
          _count: {
            select: {
              products: {
                where: {
                  isActive: true,
                },
              },
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
        take: 6,
      }),
      // 獲取最新商品（最多4個）
      prisma.product.findMany({
        where: {
          isActive: true,
          endDate: {
            gt: new Date(),
          },
        },
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
        take: 4,
      }),
    ]);

    // 格式化熱門商品
    const formattedFeaturedProducts = featuredProducts.map(product => {
      const lowestPrice = product.priceTiers[0]?.price || 0;
      const endDate = new Date(product.endDate!);
      const now = new Date();
      const timeLeftMs = endDate.getTime() - now.getTime();
      
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
        timeLeft: {
          days: Math.floor(timeLeftMs / (1000 * 60 * 60 * 24)),
          hours: Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        },
      };
    });

    // 格式化分類
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      level: category.level,
      sortOrder: category.sortOrder,
      productCount: category._count.products,
    }));

    // 格式化最新商品
    const formattedLatestProducts = latestProducts.map(product => {
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

    return NextResponse.json({
      featuredProducts: formattedFeaturedProducts,
      categories: formattedCategories,
      latestProducts: formattedLatestProducts,
      stats: {
        totalProducts: await prisma.product.count({ where: { isActive: true } }),
        totalCategories: await prisma.category.count({ where: { isActive: true } }),
        activeGroupBuys: await prisma.product.count({
          where: {
            isActive: true,
            endDate: {
              gt: new Date(),
            },
          },
        }),
      },
    });
  } catch (error) {
    console.error('獲取首頁數據時發生錯誤:', error);
    return NextResponse.json(
      { error: '獲取首頁數據失敗' },
      { status: 500 }
    );
  }
}
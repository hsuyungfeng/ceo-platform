import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 獲取最新的10個商品
    const latestProducts = await prisma.product.findMany({
      where: {
        isActive: true,
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
          take: 1, // 只取第一個價格階梯（最低數量）
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // 格式化回應數據
    const formattedProducts = latestProducts.map(product => {
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

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('獲取最新商品時發生錯誤:', error);
    return NextResponse.json(
      { error: '獲取商品失敗' },
      { status: 500 }
    );
  }
}
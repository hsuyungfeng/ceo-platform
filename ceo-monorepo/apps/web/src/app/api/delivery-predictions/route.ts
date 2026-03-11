import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/delivery-predictions - 獲取交貨時間預測
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登入才能查看交貨預測' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const productId = searchParams.get('productId');
    const limit = searchParams.get('limit') || '10';

    // 如果有供應商ID，查詢該供應商的歷史交貨表現
    if (supplierId) {
      const deliveryHistory = await prisma.deliveryPerformance.findMany({
        where: { supplierId },
        orderBy: { recordedAt: 'desc' },
        take: parseInt(limit),
        include: {
          supplier: {
            select: {
              id: true,
              companyName: true,
              onTimeDeliveryRate: true,
              totalDeliveries: true
            }
          }
        }
      });

      // 計算平均交貨時間和準確率
      const totalDeliveries = deliveryHistory.length;
      const totalEstimatedDays = deliveryHistory.reduce((sum, record) => sum + (record.estimatedDays || 0), 0);
      const totalActualDays = deliveryHistory.reduce((sum, record) => sum + record.actualDays, 0);
      const totalAccuracy = deliveryHistory.reduce((sum, record) => sum + (record.accuracy || 0), 0);

      const averageEstimatedDays = totalDeliveries > 0 ? totalEstimatedDays / totalDeliveries : 0;
      const averageActualDays = totalDeliveries > 0 ? totalActualDays / totalDeliveries : 0;
      const averageAccuracy = totalDeliveries > 0 ? totalAccuracy / totalDeliveries : 0;

      // 預測未來交貨時間（基於歷史平均）
      const prediction = {
        supplierId,
        estimatedDays: Math.round(averageEstimatedDays * 10) / 10,
        confidence: totalDeliveries >= 10 ? '高' : totalDeliveries >= 5 ? '中' : '低',
        historicalData: {
          totalDeliveries,
          averageEstimatedDays: Math.round(averageEstimatedDays * 10) / 10,
          averageActualDays: Math.round(averageActualDays * 10) / 10,
          averageAccuracy: Math.round(averageAccuracy * 10) / 10,
          onTimeDeliveryRate: deliveryHistory[0]?.supplier?.onTimeDeliveryRate || 0
        },
        recentDeliveries: deliveryHistory.slice(0, 5).map(record => ({
          id: record.id,
          estimatedDays: record.estimatedDays || 0,
          actualDays: record.actualDays,
          accuracy: record.accuracy || 0,
          recordedAt: record.recordedAt || record.createdAt
        }))
      };

      return NextResponse.json({
        success: true,
        data: prediction,
        history: deliveryHistory,
        message: '交貨時間預測獲取成功'
      });
    }

    // 如果沒有供應商ID，返回通用交貨時間統計
    const allSuppliers = await prisma.supplier.findMany({
      where: {
        totalDeliveries: { gt: 0 }
      },
      select: {
        id: true,
        companyName: true,
        avgRating: true,
        totalRatings: true,
        onTimeDeliveryRate: true,
        totalDeliveries: true
      },
      orderBy: { onTimeDeliveryRate: 'desc' },
      take: 20
    });

    // 計算整體統計
    const overallStats = {
      totalSuppliers: allSuppliers.length,
      averageOnTimeDeliveryRate: allSuppliers.reduce((sum, s) => sum + s.onTimeDeliveryRate, 0) / allSuppliers.length,
      bestPerformingSuppliers: allSuppliers.slice(0, 5),
      worstPerformingSuppliers: allSuppliers.slice(-5).reverse()
    };

    return NextResponse.json({
      success: true,
      data: allSuppliers,
      stats: overallStats,
      message: '供應商交貨表現統計獲取成功'
    });
    
  } catch (error) {
    console.error('獲取交貨預測失敗:', error);
    return NextResponse.json(
      { error: '獲取交貨預測失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
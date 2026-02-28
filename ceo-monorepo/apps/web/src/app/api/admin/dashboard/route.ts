import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { ApiResponse } from '@/types/admin';

// Simplified dashboard response
interface SimplifiedDashboardData {
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
}

// GET: 獲取簡化儀表板統計數據 (3 個關鍵指標)
export async function GET(request: NextRequest) {
  try {
    // 驗證管理員權限
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) {
      return adminCheck.error;
    }

    // 獲取查詢參數（時間範圍）
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today'; // today, week, month, year

    // 計算時間範圍
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'today':
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // 並行獲取 3 個關鍵統計數據
    const [
      totalOrders,
      totalRevenue,
      activeUsers,
    ] = await Promise.all([
      // 1. 總訂單數
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),

      // 2. 總營業額
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // 3. 活躍會員數
      prisma.user.count({
        where: {
          role: 'MEMBER',
          createdAt: { gte: startDate },
        },
      }),
    ]);

    // 返回簡化的儀表板數據（只有 3 個關鍵指標）
    const data: SimplifiedDashboardData = {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      activeUsers,
    };

    return NextResponse.json({
      success: true,
      data,
    } as ApiResponse);

  } catch (error) {
    console.error('獲取儀表板統計數據錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: '伺服器錯誤，請稍後再試',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
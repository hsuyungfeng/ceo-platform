import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthData } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 取得訂單詳情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 使用統一的認證 helper
    const authData = await getAuthData(request);
    
    if (!authData) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const { userId } = authData;
    const { id } = await params;

    // 查詢訂單
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                unit: true,
                spec: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            taxId: true,
            phone: true,
            address: true,
            contactPerson: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: '訂單不存在' },
        { status: 404 }
      );
    }

    // 格式化回應資料
    const formattedOrder = {
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      totalAmount: order.totalAmount,
      note: order.note,
      pointsEarned: order.pointsEarned,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.image,
        productUnit: item.product.unit,
        productSpec: item.product.spec,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    };

    return NextResponse.json(formattedOrder);

  } catch (error) {
    console.error('取得訂單詳情錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

// 取消訂單
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // 使用統一的認證 helper
    const authData = await getAuthData(request);
    
    if (!authData) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const { userId } = authData;
    const { id } = await params;

    // 查詢訂單
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: '訂單不存在' },
        { status: 404 }
      );
    }

    // 檢查訂單狀態是否可以取消
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: '只有待確認的訂單可以取消' },
        { status: 400 }
      );
    }

    // 使用事務取消訂單
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // 更新訂單狀態
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // 回補商品銷售量
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            totalSold: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 回扣會員點數和消費總額（如果會員資料存在）
      const existingMember = await tx.member.findUnique({
        where: { userId },
      });

      if (existingMember) {
        await tx.member.update({
          where: { userId },
          data: {
            points: { decrement: order.pointsEarned },
            totalSpent: { decrement: order.totalAmount },
          },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json({
      message: '訂單已取消',
      order: {
        id: cancelledOrder.id,
        orderNo: cancelledOrder.orderNo,
        status: cancelledOrder.status,
        updatedAt: cancelledOrder.updatedAt,
      },
    });

  } catch (error) {
    console.error('取消訂單錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
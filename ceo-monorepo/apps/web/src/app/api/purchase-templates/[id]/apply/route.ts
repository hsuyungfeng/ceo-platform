import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// POST /api/purchase-templates/[id]/apply - 將模板應用到購物車或創建訂單
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登入' },
        { status: 401 }
      );
    }
    
    const templateId = id;
    const userId = session.user.id;
    
    const body = await request.json();
    
    const schema = z.object({
      action: z.enum(['CART', 'ORDER']).default('CART'),
      notes: z.string().optional()
    });
    
    const validationResult = schema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '輸入資料無效', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const { action, notes } = validationResult.data;
    
    // 獲取模板詳情
    const template = await prisma.purchaseTemplate.findUnique({
      where: { id: templateId },
      include: {
        items: {
          include: {
            product: {
              include: {
                priceTiers: {
                  orderBy: { minQty: 'asc' },
                  take: 1
                }
              }
            },
            supplier: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    if (!template) {
      return NextResponse.json(
        { error: '模板不存在' },
        { status: 404 }
      );
    }
    
    // 檢查權限（只能使用自己的模板或公開模板）
    if (template.userId !== userId && !template.isPublic) {
      return NextResponse.json(
        { error: '權限不足' },
        { status: 403 }
      );
    }
    
    // 更新模板使用次數
    await prisma.purchaseTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } }
    });
    
    // 根據操作類型處理
    if (action === 'CART') {
      // 應用到購物車（這裡返回模板項目，由前端添加到購物車）
      // 實際購物車添加應在前端完成
      
      const cartItems = template.items.map(item => {
        const price = Number(item.product.priceTiers[0]?.price) || 0;
        return {
          productId: item.productId,
          productName: item.product.name,
          supplierId: item.supplierId,
          quantity: item.quantity,
          unitPrice: price,
          subtotal: price * item.quantity,
          notes: item.notes
        };
      });
      
      return NextResponse.json({
        success: true,
        data: {
          templateId: template.id,
          templateName: template.name,
          items: cartItems
        },
        message: '模板已準備好添加到購物車'
      });
      
    } else if (action === 'ORDER') {
      // 直接創建訂單
      // 計算總金額
      let totalAmount = 0;
      const orderItems = template.items.map(item => {
        const price = Number(item.product.priceTiers[0]?.price) || 0;
        const subtotal = price * item.quantity;
        totalAmount += subtotal;
        
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: price,
          subtotal
        };
      });
      
      // 創建訂單
      const order = await prisma.order.create({
        data: {
          orderNo: `TMP-${Date.now()}`,
          userId,
          status: 'PENDING',
          paymentMethod: 'CASH',
          totalAmount,
          note: notes || `使用模板 "${template.name}" 創建`,
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        data: order,
        message: '訂單創建成功'
      }, { status: 201 });
    }
    
    return NextResponse.json(
      { error: '無效的操作類型' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('應用模板失敗:', error);
    return NextResponse.json(
      { error: '應用模板失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/purchase-templates - 獲取當前用戶的採購模板
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登入才能獲取模板' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // 獲取查詢參數
    const { searchParams } = new URL(request.url);
    const includeItems = searchParams.get('includeItems') === 'true';
    const isPublic = searchParams.get('isPublic') === 'true' ? true :
                    searchParams.get('isPublic') === 'false' ? false : undefined;
    
    // 查詢模板記錄
    const templates = await prisma.purchaseTemplate.findMany({
      where: {
        OR: [
          { userId }, // 用戶自己的模板
          { isPublic: true } // 公開模板
        ],
        ...(isPublic !== undefined && { isPublic })
      },
      include: {
        items: includeItems ? {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                unit: true,
                spec: true,
                priceTiers: {
                  orderBy: { minQty: 'asc' },
                  take: 1
                }
              }
            },
            supplier: {
              select: {
                id: true,
                companyName: true,
                contactPerson: true
              }
            }
          }
        } : false,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isPublic: 'desc' },
        { usageCount: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length
    });
    
  } catch (error) {
    console.error('獲取採購模板失敗:', error);
    return NextResponse.json(
      { error: '獲取採購模板失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

// POST /api/purchase-templates - 創建新的採購模板
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登入才能創建模板' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    
    const schema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      isPublic: z.boolean().default(false),
      items: z.array(z.object({
        productId: z.string().cuid(),
        supplierId: z.string().cuid().optional(),
        quantity: z.number().min(1),
        notes: z.string().optional()
      })).min(1).max(50) // 限制最大項目數量
    });
    
    const validationResult = schema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '輸入資料無效', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // 檢查所有產品是否存在
    const productIds = data.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    });
    
    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: '部分產品不存在' },
        { status: 400 }
      );
    }
    
    // 如果有供應商ID，檢查供應商是否存在
    const supplierIds = data.items.map(item => item.supplierId).filter(Boolean) as string[];
    if (supplierIds.length > 0) {
      const suppliers = await prisma.supplier.findMany({
        where: { id: { in: supplierIds } },
        select: { id: true }
      });
      
      if (suppliers.length !== supplierIds.length) {
        return NextResponse.json(
          { error: '部分供應商不存在' },
          { status: 400 }
        );
      }
    }
    
    // 創建模板記錄
    const template = await prisma.purchaseTemplate.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        isPublic: data.isPublic,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            supplierId: item.supplierId,
            quantity: item.quantity,
            notes: item.notes,
            sortOrder: data.items.indexOf(item) // 保持原始順序
          }))
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
            },
            supplier: {
              select: {
                id: true,
                companyName: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: template,
      message: '採購模板創建成功'
    }, { status: 201 });
    
  } catch (error) {
    console.error('創建採購模板失敗:', error);
    return NextResponse.json(
      { error: '創建採購模板失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
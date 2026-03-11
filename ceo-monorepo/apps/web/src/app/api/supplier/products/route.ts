'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { auth } from '@/auth'

const createProductSchema = z.object({
  name: z.string().min(1, '產品名稱必填'),
  SKU: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  price: z.number().positive('價格必須為正數'),
  moq: z.number().int().positive().optional().default(1),
  leadTime: z.number().int().positive().optional(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  stock: z.number().int().min(0).optional().default(0),
})

const updateProductSchema = createProductSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get('supplierId')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!supplierId) {
      return NextResponse.json({ error: '缺少供應商ID' }, { status: 400 })
    }

    const where: any = {
      supplierId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { SKU: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.supplierProduct.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supplierProduct.count({ where }),
    ])

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error('取得供應商產品錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createProductSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '驗證失敗', errors: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const userSupplier = await prisma.userSupplier.findFirst({
      where: {
        userId: session.user.id,
        role: 'MAIN_ACCOUNT',
      },
      include: {
        supplier: true,
      },
    })

    if (!userSupplier) {
      return NextResponse.json({ error: '您不是供應商帳號' }, { status: 403 })
    }

    if (userSupplier.supplier.status !== 'ACTIVE') {
      return NextResponse.json({ error: '供應商帳號非active狀態' }, { status: 403 })
    }

    if (data.SKU) {
      const existing = await prisma.supplierProduct.findUnique({
        where: {
          supplierId_SKU: {
            supplierId: userSupplier.supplierId,
            SKU: data.SKU,
          },
        },
      })

      if (existing) {
        return NextResponse.json({ error: 'SKU 已存在' }, { status: 400 })
      }
    }

    const product = await prisma.supplierProduct.create({
      data: {
        supplierId: userSupplier.supplierId,
        name: data.name,
        SKU: data.SKU,
        description: data.description,
        category: data.category,
        unit: data.unit,
        imageUrl: data.imageUrl || null,
        price: data.price,
        moq: data.moq || 1,
        leadTime: data.leadTime,
        length: data.length,
        width: data.width,
        height: data.height,
        weight: data.weight,
        stock: data.stock || 0,
      },
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('建立供應商產品錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

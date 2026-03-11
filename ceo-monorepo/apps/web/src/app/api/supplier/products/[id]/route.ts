'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { id } = await params

    const product = await prisma.supplierProduct.findUnique({
      where: { id },
      include: {
        supplier: {
          include: {
            userSuppliers: {
              where: { userId: session.user.id },
            },
          },
        },
        product: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: '產品不存在' }, { status: 404 })
    }

    if (product.supplier.userSuppliers.length === 0) {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('取得供應商產品錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const product = await prisma.supplierProduct.findUnique({
      where: { id },
      include: {
        supplier: {
          include: {
            userSuppliers: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: '產品不存在' }, { status: 404 })
    }

    if (product.supplier.userSuppliers.length === 0) {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }

    const allowedFields = [
      'name', 'SKU', 'description', 'category', 'unit', 'imageUrl',
      'price', 'moq', 'leadTime', 'length', 'width', 'height', 'weight', 'stock', 'isActive'
    ]

    const updateData: any = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '沒有要更新的欄位' }, { status: 400 })
    }

    const updated = await prisma.supplierProduct.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('更新供應商產品錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { id } = await params

    const product = await prisma.supplierProduct.findUnique({
      where: { id },
      include: {
        supplier: {
          include: {
            userSuppliers: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: '產品不存在' }, { status: 404 })
    }

    if (product.supplier.userSuppliers.length === 0) {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }

    await prisma.supplierProduct.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('刪除供應商產品錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

/**
 * Phase 4.5 Task 4 — Join Group Buying API
 *
 * POST /api/groups/[id]/join  → 成員加入現有團購（需登入）
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthData } from '@/lib/auth-helper'
import { getGroupDiscount, GROUP_DISCOUNT_TIERS } from '@/lib/group-buying'

// ─── Zod Schema ────────────────────────────────────────────────────────────────
const joinGroupSchema = z.object({
  quantity: z.number().int().positive('數量必須是正整數'),
  note:     z.string().max(500, '備註不超過 500 字').optional(),
})

// ─── POST /api/groups/[id]/join ────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認證
    const authData = await getAuthData(request)
    if (!authData) {
      return NextResponse.json({ error: '未授權，請先登入' }, { status: 401 })
    }
    const { userId } = authData

    // 2. 取得 groupId
    const { id: groupId } = await params

    // 3. 查詢團購（找到團長訂單）
    const leaderOrder = await prisma.order.findFirst({
      where: {
        groupId,
        isGroupLeader: true,
        groupStatus:   'GROUPED',
        groupDeadline: { gt: new Date() }, // 截止時間未到
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                priceTiers: {
                  take: 1,
                  orderBy: { minQty: 'asc' },
                  select: { price: true },
                },
              },
            },
          },
        },
      },
    })

    if (!leaderOrder) {
      return NextResponse.json(
        { error: '找不到此團購，或團購已截止/結束' },
        { status: 404 }
      )
    }

    // 4. 防止團長再次加入自己的團購
    if (leaderOrder.userId === userId) {
      return NextResponse.json(
        { error: '您已是此團購的發起人，無需再次加入' },
        { status: 409 }
      )
    }

    // 5. 防止重複加入（同一 user + groupId 只能有一筆成員訂單）
    const existingMember = await prisma.order.findFirst({
      where: { groupId, userId, isGroupLeader: false },
    })
    if (existingMember) {
      return NextResponse.json(
        { error: '您已加入此團購，如需修改數量請聯繫管理員' },
        { status: 409 }
      )
    }

    // 6. 解析 body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 })
    }

    const parsed = joinGroupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '輸入資料有誤', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { quantity, note } = parsed.data

    // 7. 商品資訊（繼承團長訂單的商品）
    const leaderProduct = leaderOrder.items[0]?.product
    if (!leaderProduct) {
      return NextResponse.json({ error: '團購商品資訊不完整' }, { status: 500 })
    }

    // 8. 計算金額（以最低單價為準，折扣於結算時處理）
    const priceTier = leaderProduct.priceTiers[0]
    if (!priceTier) {
      return NextResponse.json({ error: '商品尚未設定價格，請聯繫管理員' }, { status: 422 })
    }
    const unitPrice = priceTier.price
    const subtotal  = unitPrice.mul(quantity)

    // 9. 建立成員訂單
    const orderNo = `GRP-MBR-${Date.now()}-${groupId.slice(0, 6).toUpperCase()}`

    const memberOrder = await prisma.order.create({
      data: {
        orderNo,
        userId,
        status:         'PENDING',
        paymentMethod:  'MONTHLY_BILLING',
        totalAmount:    subtotal,
        pointsEarned:   0,
        note:           note ?? null,
        // Group buying fields
        groupId,
        groupStatus:    'GROUPED',
        isGroupLeader:  false,
        groupDeadline:  leaderOrder.groupDeadline,
        groupTotalItems: quantity,
        groupRefund:    0,
        items: {
          create: {
            productId: leaderProduct.id,
            quantity,
            unitPrice,
            subtotal,
          },
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, unit: true } },
          },
        },
      },
    })

    // 10. 計算加入後的統計數字
    const memberAgg = await prisma.order.aggregate({
      where: { groupId, isGroupLeader: false },
      _sum:  { groupTotalItems: true },
      _count: { id: true },
    })
    const leaderQty   = leaderOrder.items.reduce((s, i) => s + i.quantity, 0)
    const memberQty   = memberAgg._sum.groupTotalItems ?? 0
    const totalQty    = leaderQty + memberQty
    const newDiscount = getGroupDiscount(totalQty)

    return NextResponse.json(
      {
        success: true,
        message: '成功加入團購',
        data: {
          groupId,
          memberOrderId:  memberOrder.id,
          orderNo:        memberOrder.orderNo,
          product:        { id: leaderProduct.id, name: leaderProduct.name, unit: leaderProduct.unit },
          qty:            quantity,
          unitPrice:      unitPrice.toNumber(),
          subtotal:       subtotal.toNumber(),
          deadline:       leaderOrder.groupDeadline,
          // 最新整體統計
          groupStats: {
            memberCount:        memberAgg._count.id,
            totalQty,
            currentDiscount:    newDiscount,
            currentDiscountPct: `${(newDiscount * 100).toFixed(0)}%`,
            discountTiers:      GROUP_DISCOUNT_TIERS,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/groups/[id]/join error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

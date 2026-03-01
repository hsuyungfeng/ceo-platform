/**
 * Phase 4.5 Task 4 — Group Orders API
 *
 * GET /api/groups/[id]/orders  → 列出某團購的所有訂單（需登入）
 *   - 一般用戶：僅能看到自己的訂單
 *   - 管理員：可看到所有訂單（完整資料）
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthData } from '@/lib/auth-helper'
import { getGroupDiscount } from '@/lib/group-buying'

export async function GET(
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
    const userRole = authData.user?.role
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'

    // 2. 取得 groupId
    const { id: groupId } = await params

    // 3. 確認團購存在
    const leaderOrder = await prisma.order.findFirst({
      where: { groupId, isGroupLeader: true },
      select: {
        id:             true,
        orderNo:        true,
        userId:         true,
        groupDeadline:  true,
        groupTotalItems: true,
        status:         true,
        groupStatus:    true,
        note:           true,
        items: {
          select: {
            quantity: true,
            product:  {
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
        user: { select: { id: true, name: true } },
      },
    })

    if (!leaderOrder) {
      return NextResponse.json({ error: '找不到此團購' }, { status: 404 })
    }

    // 4. 查詢成員訂單
    //    - 管理員 → 全部
    //    - 普通用戶 → 只顯示自己
    const memberWhere = isAdmin
      ? { groupId, isGroupLeader: false }
      : { groupId, isGroupLeader: false, userId }

    const memberOrders = await prisma.order.findMany({
      where: memberWhere,
      select: {
        id:             true,
        orderNo:        true,
        userId:         true,
        groupTotalItems: true,
        totalAmount:    true,
        groupRefund:    true,
        status:         true,
        createdAt:      true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // 5. 統計
    const leaderQty  = leaderOrder.items.reduce((s, i) => s + i.quantity, 0)
    const memberQty  = memberOrders.reduce((s, o) => s + (o.groupTotalItems ?? 0), 0)
    const totalQty   = leaderQty + memberQty
    const discount   = getGroupDiscount(totalQty)
    const isActive   = leaderOrder.groupDeadline
      ? leaderOrder.groupDeadline > new Date()
      : false

    // 6. 是否包含當前用戶的訂單
    const myMemberOrder = memberOrders.find(o => o.userId === userId)
    const myRole = leaderOrder.userId === userId
      ? 'leader'
      : myMemberOrder
        ? 'member'
        : 'none'

    // 格式化商品（含價格）
    const rawProduct = leaderOrder.items[0]?.product ?? null
    const product = rawProduct
      ? {
          id:    rawProduct.id,
          name:  rawProduct.name,
          unit:  rawProduct.unit,
          price: rawProduct.priceTiers[0]?.price ?? null,
        }
      : null

    return NextResponse.json({
      success: true,
      data: {
        groupId,
        isActive,
        deadline: leaderOrder.groupDeadline,
        title:    leaderOrder.note?.split('\n')[0] ?? '團購活動',
        product,

        // 團長訂單摘要
        leader: {
          orderId:  leaderOrder.id,
          orderNo:  leaderOrder.orderNo,
          company:  leaderOrder.user?.name ?? '',
          qty:      leaderQty,
          status:   leaderOrder.status,
        },

        // 成員訂單列表
        members: memberOrders.map(o => ({
          orderId: o.id,
          orderNo: o.orderNo,
          company: o.user?.name ?? '',
          qty:     o.groupTotalItems ?? 0,
          amount:  o.totalAmount,
          refund:  o.groupRefund,
          status:  o.status,
          joinedAt: o.createdAt,
          // 管理員才顯示 email
          ...(isAdmin && { email: o.user?.email }),
        })),

        // 當前用戶在此團購的角色
        myRole,

        // 統計
        stats: {
          memberCount:        memberOrders.length,
          totalQty,
          currentDiscount:    discount,
          currentDiscountPct: `${(discount * 100).toFixed(0)}%`,
        },
      },
    })
  } catch (error) {
    console.error('GET /api/groups/[id]/orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

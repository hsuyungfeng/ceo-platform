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
    const { userId, role } = authData
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

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
        orderItems: {
          select: {
            quantity: true,
            product:  { select: { id: true, name: true, unit: true, price: true } },
          },
        },
        user: { select: { id: true, name: true, firmName: true } },
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
        groupTotalItems: true,
        totalAmount:    true,
        groupRefund:    true,
        status:         true,
        createdAt:      true,
        user: {
          select: isAdmin
            ? { id: true, name: true, firmName: true, email: true }
            : { id: true, name: true, firmName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // 5. 統計
    const leaderQty  = leaderOrder.orderItems.reduce((s, i) => s + i.quantity, 0)
    const memberQty  = memberOrders.reduce((s, o) => s + (o.groupTotalItems ?? 0), 0)
    const totalQty   = leaderQty + memberQty
    const discount   = getGroupDiscount(totalQty)
    const isActive   = leaderOrder.groupDeadline
      ? leaderOrder.groupDeadline > new Date()
      : false

    // 6. 是否包含當前用戶的訂單
    const myOrder = memberOrders.find(o => o.user.id === userId)
      ?? (leaderOrder.userId === userId
          ? { role: 'leader', orderId: leaderOrder.id, qty: leaderQty }
          : null)

    return NextResponse.json({
      success: true,
      data: {
        groupId,
        isActive,
        deadline: leaderOrder.groupDeadline,
        title:    leaderOrder.note?.split('\n')[0] ?? '團購活動',
        product:  leaderOrder.orderItems[0]?.product ?? null,

        // 團長訂單摘要
        leader: {
          orderId:  leaderOrder.id,
          orderNo:  leaderOrder.orderNo,
          company:  leaderOrder.user.firmName ?? leaderOrder.user.name,
          qty:      leaderQty,
          status:   leaderOrder.status,
        },

        // 成員訂單列表
        members: memberOrders.map(o => ({
          orderId: o.id,
          orderNo: o.orderNo,
          company: o.user.firmName ?? o.user.name,
          qty:     o.groupTotalItems ?? 0,
          amount:  o.totalAmount,
          refund:  o.groupRefund,
          status:  o.status,
          joinedAt: o.createdAt,
          ...(isAdmin && { email: (o.user as { email?: string }).email }),
        })),

        // 當前用戶在此團購的角色
        myRole: leaderOrder.userId === userId
          ? 'leader'
          : myOrder && 'orderId' in myOrder
            ? 'member'
            : 'none',

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

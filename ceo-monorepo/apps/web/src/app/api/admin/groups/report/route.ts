/**
 * Phase 4.5 Task 5 — Admin Group Report API
 *
 * GET /api/admin/groups/report  → 列出所有團購的統計報表（僅管理員）
 *
 * Query params:
 *   status: 'active' | 'expired' | 'all' (default: all)
 *   page:   number (default: 1)
 *   limit:  number (default: 20, max: 100)
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getGroupDiscount, getQtyToNextTier } from '@/lib/group-buying'

const querySchema = z.object({
  status: z.enum(['active', 'expired', 'all']).default('all'),
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
})

export async function GET(request: NextRequest) {
  // 1. 管理員驗證
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) return adminCheck.error

  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.safeParse({
      status: searchParams.get('status'),
      page:   searchParams.get('page'),
      limit:  searchParams.get('limit'),
    })
    if (!query.success) {
      return NextResponse.json(
        { error: '查詢參數錯誤', details: query.error.issues },
        { status: 400 }
      )
    }

    const { status, page, limit } = query.data
    const skip = (page - 1) * limit
    const now  = new Date()

    // 2. 組合 where 條件
    const deadlineFilter =
      status === 'active'  ? { groupDeadline: { gt: now } } :
      status === 'expired' ? { groupDeadline: { lte: now } } :
      {}

    const baseWhere = {
      isGroupLeader: true,
      groupStatus:   'GROUPED' as const,
      ...deadlineFilter,
    }

    // 3. 查詢團長訂單（每個 groupId 只有一筆）
    const [leaderOrders, total] = await Promise.all([
      prisma.order.findMany({
        where: baseWhere,
        select: {
          id:             true,
          groupId:        true,
          groupDeadline:  true,
          groupTotalItems: true,
          note:           true,
          status:         true,
          createdAt:      true,
          user: { select: { id: true, name: true, email: true } },
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: baseWhere }),
    ])

    // 4. 為每個團購附加成員統計
    const reportRows = await Promise.all(
      leaderOrders.map(async (lo) => {
        const memberAgg = await prisma.order.aggregate({
          where: { groupId: lo.groupId!, isGroupLeader: false },
          _sum:   { groupTotalItems: true, totalAmount: true, groupRefund: true },
          _count: { id: true },
        })

        const leaderQty  = lo.items.reduce((s, i) => s + i.quantity, 0)
        const memberQty  = memberAgg._sum.groupTotalItems ?? 0
        const totalQty   = leaderQty + memberQty
        const discount   = getGroupDiscount(totalQty)
        const isActive   = lo.groupDeadline ? lo.groupDeadline > now : false

        // 計算已派發返利總額（成員返利 + 團長返利估算）
        const memberRebatePaid = Number(memberAgg._sum.groupRefund ?? 0)
        const leaderRebateEst  = leaderQty * Number(lo.items[0]?.product?.priceTiers[0]?.price ?? 0) * discount
        const totalRebatePaid  = memberRebatePaid + leaderRebateEst

        // 檢查返利發票是否已發送
        const rebateInvoiceCount = await prisma.invoice.count({
          where: { groupId: lo.groupId!, isGroupInvoice: true },
        })

        // 格式化商品（含價格）
        const rawProduct = lo.items[0]?.product ?? null
        const product = rawProduct
          ? {
              id:    rawProduct.id,
              name:  rawProduct.name,
              unit:  rawProduct.unit,
              price: rawProduct.priceTiers[0]?.price ?? null,
            }
          : null

        return {
          groupId:         lo.groupId,
          leaderOrderId:   lo.id,
          title:           lo.note?.split('\n')[0] ?? '團購活動',
          company:         lo.user?.name ?? '',
          leaderEmail:     lo.user?.email ?? '',
          isActive,
          deadline:        lo.groupDeadline,
          product,
          leaderQty,
          memberCount:     memberAgg._count.id,
          totalQty,
          currentDiscount: discount,
          discountPct:     `${(discount * 100).toFixed(0)}%`,
          qtyToNextTier:   getQtyToNextTier(totalQty),
          totalOrderAmount: Number(memberAgg._sum.totalAmount ?? 0),
          totalRebatePaid,
          rebateInvoicesSent: rebateInvoiceCount,
          createdAt:       lo.createdAt,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: reportRows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: {
        totalGroups:  total,
        activeGroups: reportRows.filter(r => r.isActive).length,
      },
    })
  } catch (error) {
    console.error('GET /api/admin/groups/report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

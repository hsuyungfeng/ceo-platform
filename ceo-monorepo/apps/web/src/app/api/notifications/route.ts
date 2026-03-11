// GET /api/notifications - 獲取用戶通知列表
import { NextRequest, NextResponse } from 'next/server'
import { getAuthData } from '@/lib/auth-helper'
import { NotificationService } from '@/lib/notification-service'
import { NotificationType, NotificationStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const authData = await getAuthData(request)
    if (!authData) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as NotificationType | null
    const status = searchParams.get('status') as NotificationStatus | null
    const isRead = searchParams.get('isRead') ? searchParams.get('isRead') === 'true' : undefined
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const filter = {
      userId: authData.user.id,
      type,
      status,
      isRead,
      startDate,
      endDate,
      limit,
      offset,
    }

    const result = await NotificationService.getUserNotifications(filter)

    return NextResponse.json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: result.hasMore,
      },
    })
  } catch (error) {
    console.error('獲取通知列表失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '獲取通知列表失敗' 
      },
      { status: 500 }
    )
  }
}
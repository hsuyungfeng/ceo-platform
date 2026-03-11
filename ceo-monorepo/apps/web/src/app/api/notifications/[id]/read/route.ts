// PATCH /api/notifications/[id]/read - 標記通知為已讀
import { NextRequest, NextResponse } from 'next/server'
import { getAuthData } from '@/lib/auth-helper'
import { NotificationService } from '@/lib/notification-service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authData = await getAuthData(request)
    if (!authData) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const notificationId = params.id
    const notification = await NotificationService.markAsRead(notificationId, authData.user.id)

    return NextResponse.json({
      success: true,
      data: notification,
    })
  } catch (error) {
    console.error('標記通知為已讀失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '標記通知為已讀失敗' 
      },
      { status: error instanceof Error && error.message.includes('不存在') ? 404 : 500 }
    )
  }
}
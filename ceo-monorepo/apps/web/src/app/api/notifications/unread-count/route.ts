// GET /api/notifications/unread-count - 獲取未讀通知數量
import { NextRequest, NextResponse } from 'next/server'
import { getAuthData } from '@/lib/auth-helper'
import { NotificationService } from '@/lib/notification-service'

export async function GET(request: NextRequest) {
  try {
    const authData = await getAuthData(request)
    if (!authData) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const count = await NotificationService.getUnreadCount(authData.user.id)

    return NextResponse.json({
      success: true,
      data: {
        count,
      },
    })
  } catch (error) {
    console.error('獲取未讀通知數量失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '獲取未讀通知數量失敗' 
      },
      { status: 500 }
    )
  }
}
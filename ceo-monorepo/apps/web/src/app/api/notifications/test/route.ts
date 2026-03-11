// POST /api/notifications/test - 測試通知系統
import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notification-service'
import { NotificationType, NotificationChannel } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { userId, type, title, content, data } = body
    
    if (!userId || !type || !title || !content) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      )
    }

    // 驗證通知類型
    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { error: '無效的通知類型' },
        { status: 400 }
      )
    }

    // 創建測試通知
    const notification = await NotificationService.createNotification({
      userId,
      type: type as NotificationType,
      title: `[測試] ${title}`,
      content: `[測試通知] ${content}`,
      data,
      channels: [NotificationChannel.IN_APP], // 測試時只使用站內通知
    })

    if (!notification) {
      return NextResponse.json({
        success: false,
        error: '通知創建失敗（可能是用戶偏好設定禁用此類型通知）',
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        notificationId: notification.id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        createdAt: notification.createdAt,
        isSent: notification.isSent,
      },
      message: '測試通知已發送',
    })
  } catch (error) {
    console.error('測試通知失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '測試通知失敗' 
      },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { pushNotificationService } from '@/lib/push-notification-service'

export async function GET() {
  try {
    const vapidPublicKey = pushNotificationService.getVapidPublicKey()

    if (!vapidPublicKey) {
      return NextResponse.json(
        { success: false, error: 'VAPID 公鑰未設置' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        vapidPublicKey
      }
    })

  } catch (error) {
    console.error('獲取 VAPID 公鑰失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取 VAPID 公鑰失敗' },
      { status: 500 }
    )
  }
}
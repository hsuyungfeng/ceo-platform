// 推播通知服務 - 支援 Web Push、FCM 等
import { prisma } from './prisma'
import { NotificationChannel } from '@prisma/client'

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
  vibrate?: number[]
}

export class PushNotificationService {
  private vapidPublicKey: string | null = null
  private vapidPrivateKey: string | null = null

  constructor() {
    // 從環境變數獲取 VAPID 金鑰
    this.vapidPublicKey = process.env.VAPID_PUBLIC_KEY || null
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || null
  }

  /**
   * 註冊裝置推播訂閱
   */
  async registerDeviceSubscription(
    userId: string,
    subscription: PushSubscription,
    userAgent?: string,
    deviceName?: string
  ) {
    try {
      // 檢查是否已存在相同的訂閱
      const existingSubscription = await prisma.deviceToken.findFirst({
        where: {
          userId,
          token: subscription.endpoint,
          type: 'WEB_PUSH'
        }
      })

      if (existingSubscription) {
        // 更新現有訂閱
        return await prisma.deviceToken.update({
          where: { id: existingSubscription.id },
          data: {
            metadata: JSON.stringify(subscription),
            userAgent,
            deviceName,
            lastUsedAt: new Date(),
            isActive: true
          }
        })
      }

      // 創建新訂閱
      return await prisma.deviceToken.create({
        data: {
          userId,
          token: subscription.endpoint,
          type: 'WEB_PUSH',
          metadata: JSON.stringify(subscription),
          userAgent,
          deviceName,
          lastUsedAt: new Date(),
          isActive: true
        }
      })
    } catch (error) {
      console.error('註冊裝置推播訂閱失敗:', error)
      throw error
    }
  }

  /**
   * 取消註冊裝置推播訂閱
   */
  async unregisterDeviceSubscription(userId: string, endpoint: string) {
    try {
      const subscription = await prisma.deviceToken.findFirst({
        where: {
          userId,
          token: endpoint,
          type: 'WEB_PUSH'
        }
      })

      if (subscription) {
        await prisma.deviceToken.update({
          where: { id: subscription.id },
          data: { isActive: false, unsubscribedAt: new Date() }
        })
      }

      return true
    } catch (error) {
      console.error('取消註冊裝置推播訂閱失敗:', error)
      throw error
    }
  }

  /**
   * 獲取用戶的所有有效推播訂閱
   */
  async getUserPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      const subscriptions = await prisma.deviceToken.findMany({
        where: {
          userId,
          type: 'WEB_PUSH',
          isActive: true
        }
      })

      return subscriptions
        .map(sub => {
          try {
            const metadata = JSON.parse(sub.metadata || '{}')
            return {
              endpoint: sub.token,
              keys: {
                p256dh: metadata.keys?.p256dh || '',
                auth: metadata.keys?.auth || ''
              }
            } as PushSubscription
          } catch {
            return null
          }
        })
        .filter((sub): sub is PushSubscription => sub !== null)
    } catch (error) {
      console.error('獲取用戶推播訂閱失敗:', error)
      return []
    }
  }

  /**
   * 發送推播通知到單個訂閱
   */
  async sendPushToSubscription(
    subscription: PushSubscription,
    payload: PushNotificationPayload
  ): Promise<boolean> {
    try {
      // 檢查訂閱是否有效
      if (!subscription.endpoint || !subscription.keys) {
        return false
      }

      // 準備推播訊息
      const pushPayload = {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/badge.png',
        image: payload.image,
        tag: payload.tag || 'ceo-notification',
        data: payload.data || {},
        actions: payload.actions || [],
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        timestamp: payload.timestamp || Date.now(),
        vibrate: payload.vibrate || [200, 100, 200]
      }

      // 發送推播通知
      const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TTL': '86400' // 24小時
        },
        body: JSON.stringify(pushPayload)
      })

      if (!response.ok) {
        console.error('推播通知發送失敗:', response.status, response.statusText)
        
        // 如果訂閱無效，標記為非活躍
        if (response.status === 404 || response.status === 410) {
          await this.markSubscriptionAsInactive(subscription.endpoint)
        }
        
        return false
      }

      return true
    } catch (error) {
      console.error('發送推播通知時發生錯誤:', error)
      return false
    }
  }

  /**
   * 發送推播通知到用戶的所有裝置
   */
  async sendPushToUser(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<number> {
    try {
      const subscriptions = await this.getUserPushSubscriptions(userId)
      let successCount = 0

      for (const subscription of subscriptions) {
        const success = await this.sendPushToSubscription(subscription, payload)
        if (success) {
          successCount++
        }
      }

      console.log(`推播通知已發送給用戶 ${userId}，成功: ${successCount}/${subscriptions.length}`)
      return successCount
    } catch (error) {
      console.error('發送用戶推播通知失敗:', error)
      return 0
    }
  }

  /**
   * 發送推播通知到多個用戶
   */
  async sendPushToUsers(
    userIds: string[],
    payload: PushNotificationPayload
  ): Promise<number> {
    let totalSuccess = 0

    for (const userId of userIds) {
      const successCount = await this.sendPushToUser(userId, payload)
      totalSuccess += successCount
    }

    return totalSuccess
  }

  /**
   * 標記訂閱為非活躍
   */
  private async markSubscriptionAsInactive(endpoint: string): Promise<void> {
    try {
      await prisma.deviceToken.updateMany({
        where: {
          token: endpoint,
          type: 'WEB_PUSH'
        },
        data: {
          isActive: false,
          unsubscribedAt: new Date()
        }
      })
    } catch (error) {
      console.error('標記訂閱為非活躍失敗:', error)
    }
  }

  /**
   * 清理過期的推播訂閱
   */
  async cleanupExpiredSubscriptions(days: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const result = await prisma.deviceToken.deleteMany({
        where: {
          type: 'WEB_PUSH',
          OR: [
            { isActive: false },
            {
              lastUsedAt: { lt: cutoffDate }
            }
          ]
        }
      })

      console.log(`已清理 ${result.count} 個過期推播訂閱`)
      return result.count
    } catch (error) {
      console.error('清理過期推播訂閱失敗:', error)
      return 0
    }
  }

  /**
   * 獲取 VAPID 公鑰（用於前端訂閱）
   */
  getVapidPublicKey(): string | null {
    return this.vapidPublicKey
  }

  /**
   * 生成推播通知負載
   */
  createNotificationPayload(
    title: string,
    body: string,
    options?: Partial<PushNotificationPayload>
  ): PushNotificationPayload {
    return {
      title,
      body,
      icon: '/favicon.ico',
      badge: '/badge.png',
      tag: 'ceo-notification',
      data: {},
      actions: [],
      requireInteraction: false,
      silent: false,
      timestamp: Date.now(),
      vibrate: [200, 100, 200],
      ...options
    }
  }
}

// 單例實例
export const pushNotificationService = new PushNotificationService()
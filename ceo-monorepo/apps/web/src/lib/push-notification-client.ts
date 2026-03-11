// 前端推播通知客戶端
import { pushNotificationService } from './push-notification-service'

interface PushSubscriptionOptions {
  userVisibleOnly?: boolean
  applicationServerKey?: string
}

export class PushNotificationClient {
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null
  private isSupported: boolean = false
  private permission: NotificationPermission = 'default'

  constructor() {
    this.checkSupport()
    this.checkPermission()
  }

  /**
   * 檢查瀏覽器是否支持推播通知
   */
  private checkSupport(): void {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
    console.log('推播通知支持狀態:', this.isSupported)
  }

  /**
   * 檢查通知權限
   */
  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission
    }
  }

  /**
   * 請求通知權限
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    try {
      this.permission = await Notification.requestPermission()
      console.log('通知權限:', this.permission)
      return this.permission
    } catch (error) {
      console.error('請求通知權限失敗:', error)
      return 'denied'
    }
  }

  /**
   * 註冊 Service Worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.warn('瀏覽器不支持 Service Worker')
      return null
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'all'
      })

      console.log('Service Worker 註冊成功:', this.registration)
      
      // 監聽 Service Worker 更新
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('Service Worker 狀態變化:', newWorker.state)
          })
        }
      })

      return this.registration
    } catch (error) {
      console.error('Service Worker 註冊失敗:', error)
      return null
    }
  }

  /**
   * 訂閱推播通知
   */
  async subscribeToPushNotifications(
    userId: string,
    options?: PushSubscriptionOptions
  ): Promise<PushSubscription | null> {
    if (!this.isSupported || !this.registration) {
      console.warn('瀏覽器不支持推播通知或 Service Worker 未註冊')
      return null
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission()
      if (permission !== 'granted') {
        console.warn('用戶未授予通知權限')
        return null
      }
    }

    try {
      // 獲取 VAPID 公鑰
      const vapidPublicKey = pushNotificationService.getVapidPublicKey()
      if (!vapidPublicKey) {
        console.warn('VAPID 公鑰未設置')
        return null
      }

      // 轉換 VAPID 公鑰
      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey)

      // 訂閱推播
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: options?.userVisibleOnly ?? true,
        applicationServerKey
      })

      console.log('推播訂閱成功:', this.subscription)

      // 發送訂閱到伺服器
      await this.sendSubscriptionToServer(userId, this.subscription)

      return this.subscription
    } catch (error) {
      console.error('推播訂閱失敗:', error)
      return null
    }
  }

  /**
   * 取消訂閱推播通知
   */
  async unsubscribeFromPushNotifications(userId: string): Promise<boolean> {
    if (!this.subscription) {
      console.warn('沒有有效的推播訂閱')
      return false
    }

    try {
      // 取消訂閱
      const success = await this.subscription.unsubscribe()
      if (success) {
        console.log('推播取消訂閱成功')

        // 通知伺服器取消訂閱
        await this.sendUnsubscriptionToServer(userId, this.subscription.endpoint)

        this.subscription = null
        return true
      }
      return false
    } catch (error) {
      console.error('推播取消訂閱失敗:', error)
      return false
    }
  }

  /**
   * 檢查當前訂閱狀態
   */
  async checkSubscriptionStatus(): Promise<{
    isSubscribed: boolean
    endpoint?: string
  }> {
    if (!this.isSupported || !this.registration) {
      return { isSubscribed: false }
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      return {
        isSubscribed: !!subscription,
        endpoint: subscription?.endpoint
      }
    } catch (error) {
      console.error('檢查訂閱狀態失敗:', error)
      return { isSubscribed: false }
    }
  }

  /**
   * 發送訂閱到伺服器
   */
  private async sendSubscriptionToServer(
    userId: string,
    subscription: PushSubscription
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          deviceName: this.getDeviceName()
        })
      })

      if (response.ok) {
        console.log('訂閱已發送到伺服器')
        return true
      } else {
        console.error('發送訂閱到伺服器失敗:', response.status)
        return false
      }
    } catch (error) {
      console.error('發送訂閱到伺服器時發生錯誤:', error)
      return false
    }
  }

  /**
   * 發送取消訂閱到伺服器
   */
  private async sendUnsubscriptionToServer(
    userId: string,
    endpoint: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          endpoint
        })
      })

      if (response.ok) {
        console.log('取消訂閱已發送到伺服器')
        return true
      } else {
        console.error('發送取消訂閱到伺服器失敗:', response.status)
        return false
      }
    } catch (error) {
      console.error('發送取消訂閱到伺服器時發生錯誤:', error)
      return false
    }
  }

  /**
   * 獲取裝置名稱
   */
  private getDeviceName(): string {
    const userAgent = navigator.userAgent
    let deviceName = '未知裝置'

    if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      deviceName = '行動裝置'
    } else if (/Windows/i.test(userAgent)) {
      deviceName = 'Windows 電腦'
    } else if (/Mac/i.test(userAgent)) {
      deviceName = 'Mac 電腦'
    } else if (/Linux/i.test(userAgent)) {
      deviceName = 'Linux 電腦'
    }

    return deviceName
  }

  /**
   * 工具函數：將 base64 字串轉換為 Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')
    
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }

  /**
   * 顯示本地通知（用於測試）
   */
  async showLocalNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<boolean> {
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission()
      if (permission !== 'granted') {
        return false
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/badge.png',
        tag: 'ceo-local-notification',
        ...options
      })

      notification.onclick = () => {
        console.log('本地通知被點擊')
        window.focus()
        notification.close()
      }

      return true
    } catch (error) {
      console.error('顯示本地通知失敗:', error)
      return false
    }
  }

  /**
   * 初始化推播通知系統
   */
  async initialize(userId: string): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('瀏覽器不支持推播通知')
      return false
    }

    try {
      // 註冊 Service Worker
      await this.registerServiceWorker()

      // 檢查現有訂閱
      const { isSubscribed } = await this.checkSubscriptionStatus()

      if (!isSubscribed) {
        // 請求權限並訂閱
        await this.requestPermission()
        await this.subscribeToPushNotifications(userId)
      }

      return true
    } catch (error) {
      console.error('初始化推播通知系統失敗:', error)
      return false
    }
  }

  /**
   * 獲取支持狀態
   */
  getIsSupported(): boolean {
    return this.isSupported
  }

  /**
   * 獲取權限狀態
   */
  getPermission(): NotificationPermission {
    return this.permission
  }

  /**
   * 獲取 Service Worker 註冊
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }

  /**
   * 獲取當前訂閱
   */
  getSubscription(): PushSubscription | null {
    return this.subscription
  }
}

// 單例實例
export const pushNotificationClient = new PushNotificationClient()
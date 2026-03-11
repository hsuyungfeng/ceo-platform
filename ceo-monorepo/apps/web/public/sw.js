// Service Worker for CEO Platform Push Notifications

const CACHE_NAME = 'ceo-platform-v1'
const NOTIFICATION_ICON = '/favicon.ico'
const NOTIFICATION_BADGE = '/badge.png'

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker 安裝中...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('快取已開啟')
        return cache.addAll([
          '/',
          '/favicon.ico',
          '/badge.png',
          '/manifest.json'
        ])
      })
      .then(() => {
        console.log('Service Worker 安裝完成')
        return self.skipWaiting()
      })
  )
})

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('刪除舊快取:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker 激活完成')
      return self.clients.claim()
    })
  )
})

// 攔截 fetch 請求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果有快取版本，返回快取
        if (response) {
          return response
        }
        
        // 否則從網路獲取
        return fetch(event.request)
          .then((response) => {
            // 檢查是否為有效回應
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // 複製回應以進行快取
            const responseToCache = response.clone()
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })
            
            return response
          })
      })
  )
})

// 處理推播通知
self.addEventListener('push', (event) => {
  console.log('收到推播通知:', event)
  
  if (!event.data) {
    console.warn('推播通知沒有資料')
    return
  }
  
  let notificationData
  try {
    notificationData = event.data.json()
  } catch (error) {
    console.error('解析推播通知資料失敗:', error)
    notificationData = {
      title: 'CEO 團購平台',
      body: event.data.text() || '您有新的通知',
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_BADGE
    }
  }
  
  const options = {
    body: notificationData.body || '您有新的通知',
    icon: notificationData.icon || NOTIFICATION_ICON,
    badge: notificationData.badge || NOTIFICATION_BADGE,
    image: notificationData.image,
    tag: notificationData.tag || 'ceo-notification',
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false,
    timestamp: notificationData.timestamp || Date.now(),
    vibrate: notificationData.vibrate || [200, 100, 200]
  }
  
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'CEO 團購平台',
      options
    )
  )
})

// 處理通知點擊
self.addEventListener('notificationclick', (event) => {
  console.log('通知被點擊:', event.notification)
  
  event.notification.close()
  
  const notificationData = event.notification.data || {}
  let urlToOpen = '/'
  
  // 根據通知類型決定要打開的頁面
  if (notificationData.url) {
    urlToOpen = notificationData.url
  } else if (notificationData.type === 'ORDER_STATUS' && notificationData.orderId) {
    urlToOpen = `/orders/${notificationData.orderId}`
  } else if (notificationData.type === 'PAYMENT_REMINDER' && notificationData.invoiceId) {
    urlToOpen = `/invoices/${notificationData.invoiceId}`
  } else if (notificationData.type === 'SUPPLIER_APPLICATION' && notificationData.applicationId) {
    urlToOpen = `/supplier-applications/${notificationData.applicationId}`
  } else {
    urlToOpen = '/notifications'
  }
  
  // 處理動作按鈕點擊
  if (event.action) {
    console.log('動作按鈕被點擊:', event.action)
    
    switch (event.action) {
      case 'view':
        urlToOpen = '/notifications'
        break
      case 'mark-read':
        // 標記通知為已讀
        if (notificationData.notificationId) {
          fetch(`/api/notifications/${notificationData.notificationId}/read`, {
            method: 'PATCH'
          }).catch(console.error)
        }
        return
      default:
        // 其他自定義動作
        if (notificationData.actions) {
          const action = notificationData.actions.find(a => a.action === event.action)
          if (action && action.url) {
            urlToOpen = action.url
          }
        }
    }
  }
  
  // 打開頁面
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // 檢查是否有已打開的窗口
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      
      // 如果沒有，打開新窗口
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// 處理通知關閉
self.addEventListener('notificationclose', (event) => {
  console.log('通知被關閉:', event.notification)
  
  const notificationData = event.notification.data || {}
  
  // 可以在此處記錄通知關閉事件
  if (notificationData.notificationId) {
    // 可以發送分析事件或記錄
    console.log(`通知 ${notificationData.notificationId} 被關閉`)
  }
})

// 處理推播訂閱變化
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('推播訂閱發生變化:', event)
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || '')
    })
    .then((subscription) => {
      console.log('重新訂閱成功:', subscription)
      
      // 發送新的訂閱到伺服器
      return fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })
    })
    .catch((error) => {
      console.error('重新訂閱失敗:', error)
    })
  )
})

// 工具函數：將 base64 字串轉換為 Uint8Array
function urlBase64ToUint8Array(base64String) {
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

// 處理後台同步
self.addEventListener('sync', (event) => {
  console.log('後台同步事件:', event.tag)
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

// 同步通知
async function syncNotifications() {
  try {
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log('通知同步成功')
    } else {
      console.error('通知同步失敗:', response.status)
    }
  } catch (error) {
    console.error('通知同步錯誤:', error)
  }
}

// 處理定期背景更新
self.addEventListener('periodicsync', (event) => {
  console.log('定期背景同步:', event.tag)
  
  if (event.tag === 'update-notifications') {
    event.waitUntil(updateNotifications())
  }
})

// 更新通知
async function updateNotifications() {
  try {
    const response = await fetch('/api/notifications/check-updates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('通知更新檢查完成:', data)
    } else {
      console.error('通知更新檢查失敗:', response.status)
    }
  } catch (error) {
    console.error('通知更新檢查錯誤:', error)
  }
}
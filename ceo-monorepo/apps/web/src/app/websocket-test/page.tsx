'use client'

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/contexts/websocket-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Wifi, WifiOff, RefreshCw, Send } from 'lucide-react'

export default function WebSocketTestPage() {
  const { isConnected, unreadCount, notifications, connect, disconnect, markAsRead, clearNotifications } = useWebSocket()
  const [testMessage, setTestMessage] = useState('')
  const [connectionLog, setConnectionLog] = useState<string[]>([])
  const [notificationLog, setNotificationLog] = useState<string[]>([])

  const addLog = (log: string, type: 'connection' | 'notification') => {
    const timestamp = new Date().toLocaleTimeString()
    const message = `[${timestamp}] ${log}`
    
    if (type === 'connection') {
      setConnectionLog(prev => [message, ...prev].slice(0, 10))
    } else {
      setNotificationLog(prev => [message, ...prev].slice(0, 10))
    }
  }

  useEffect(() => {
    if (isConnected) {
      addLog('已連接到 WebSocket 伺服器', 'connection')
    } else {
      addLog('已斷開 WebSocket 連接', 'connection')
    }
  }, [isConnected])

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0]
      addLog(`收到新通知: ${latest.title}`, 'notification')
    }
  }, [notifications])

  const handleSendTestNotification = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '測試通知',
          message: testMessage || '這是一個測試通知訊息',
          type: 'SYSTEM_ANNOUNCEMENT'
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        addLog(`測試通知已發送: ${data.data.title}`, 'notification')
        setTestMessage('')
      } else {
        addLog(`發送測試通知失敗: ${data.error}`, 'notification')
      }
    } catch (error) {
      addLog(`發送測試通知時發生錯誤: ${error}`, 'notification')
    }
  }

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markAsRead(notification.id)
      }
    })
    addLog('已標記所有通知為已讀', 'notification')
  }

  const handleTestConnection = () => {
    if (isConnected) {
      disconnect()
      addLog('手動斷開連接', 'connection')
    } else {
      connect()
      addLog('手動嘗試連接', 'connection')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WebSocket 測試頁面</h1>
        <p className="text-gray-600">測試即時通知系統的 WebSocket 功能</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 連接狀態卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-500" />
                  <span>已連接</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-500" />
                  <span>未連接</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              WebSocket 伺服器連接狀態
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">連接狀態</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={isConnected ? "default" : "destructive"}>
                      {isConnected ? '已連接' : '未連接'}
                    </Badge>
                    {isConnected && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        即時
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleTestConnection}
                  variant={isConnected ? "outline" : "default"}
                >
                  {isConnected ? '斷開連接' : '連接'}
                </Button>
              </div>

              <div>
                <p className="text-sm text-gray-500">未讀通知</p>
                <div className="flex items-center gap-2 mt-1">
                  <Bell className="h-4 w-4" />
                  <span className="text-2xl font-bold">{unreadCount}</span>
                  <span className="text-gray-500">個未讀</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">總通知數</p>
                <p className="text-lg font-semibold">{notifications.length} 個通知</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 測試通知卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              <span>發送測試通知</span>
            </CardTitle>
            <CardDescription>
              發送測試通知到當前用戶
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="testMessage" className="block text-sm font-medium mb-2">
                  通知訊息
                </label>
                <textarea
                  id="testMessage"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="輸入測試通知訊息..."
                  className="w-full p-3 border rounded-md min-h-[100px]"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendTestNotification}
                  disabled={!isConnected}
                  className="flex-1"
                >
                  發送測試通知
                </Button>
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  disabled={unreadCount === 0}
                >
                  標記全部已讀
                </Button>
                <Button
                  onClick={clearNotifications}
                  variant="outline"
                  disabled={notifications.length === 0}
                >
                  清空列表
                </Button>
              </div>

              {!isConnected && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    請先連接 WebSocket 伺服器以接收即時通知
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 連接日誌 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              <span>連接日誌</span>
            </CardTitle>
            <CardDescription>
              WebSocket 連接狀態變化記錄
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {connectionLog.length > 0 ? (
                connectionLog.map((log, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-md text-sm font-mono"
                  >
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  暫無連接日誌
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 通知日誌 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <span>通知日誌</span>
            </CardTitle>
            <CardDescription>
              收到的通知記錄
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {notificationLog.length > 0 ? (
                notificationLog.map((log, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-md text-sm font-mono"
                  >
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  暫無通知日誌
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 當前通知列表 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>當前通知列表</CardTitle>
          <CardDescription>
            即時收到的通知（最新 {notifications.length} 個）
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            未讀
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>類型: {notification.type}</span>
                        <span>時間: {new Date(notification.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                      >
                        標記已讀
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暫無通知，請發送測試通知或等待系統通知
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">測試說明</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>點擊「連接」按鈕建立 WebSocket 連接</li>
          <li>在「通知訊息」框中輸入內容，點擊「發送測試通知」</li>
          <li>觀察「連接日誌」和「通知日誌」的變化</li>
          <li>即時通知會顯示在「當前通知列表」中</li>
          <li>點擊「標記已讀」按鈕可以將通知標記為已讀</li>
          <li>未讀通知計數會實時更新在頁面右上角的鈴鐺圖標</li>
        </ul>
      </div>
    </div>
  )
}
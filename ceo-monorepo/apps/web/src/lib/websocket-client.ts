import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketMessageBase {
  type: string
}

interface NotificationMessage extends WebSocketMessageBase {
  type: 'notification'
  data: NotificationData
}

interface UnreadCountMessage extends WebSocketMessageBase {
  type: 'unread_count'
  count: number
}

interface AuthSuccessMessage extends WebSocketMessageBase {
  type: 'auth_success'
  clientId: string
  userId: string
}

interface AuthErrorMessage extends WebSocketMessageBase {
  type: 'auth_error'
  error: string
  message: string
}

interface HeartbeatAckMessage extends WebSocketMessageBase {
  type: 'heartbeat_ack'
}

interface ConnectedMessage extends WebSocketMessageBase {
  type: 'connected'
  clientId: string
}

interface DisconnectedMessage extends WebSocketMessageBase {
  type: 'disconnected'
}

type WebSocketMessage = 
  | NotificationMessage 
  | UnreadCountMessage 
  | AuthSuccessMessage 
  | AuthErrorMessage 
  | HeartbeatAckMessage
  | ConnectedMessage
  | DisconnectedMessage
  | { type: string; [key: string]: unknown }

interface NotificationData {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  read: boolean
}

interface UseWebSocketOptions {
  onNotification?: (notification: NotificationData) => void
  onUnreadCountUpdate?: (count: number) => void
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: Error) => void
  autoReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onNotification,
    onUnreadCountUpdate,
    onConnected,
    onDisconnected,
    onError,
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10
  } = options

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)

  const connect = useCallback((authToken: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket 已經連接')
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`
    
    console.log('正在連接到 WebSocket:', wsUrl)
    
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket 連接已建立')
        setIsConnected(true)
        onConnected?.()
        
        startHeartbeat()
        
        ws.send(JSON.stringify({
          type: 'auth',
          token: authToken
        }))
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          switch (message.type) {
            case 'connected':
              setClientId(message.clientId)
              console.log('WebSocket 客戶端 ID:', message.clientId)
              break
              
            case 'auth_success':
              console.log('WebSocket 驗證成功，用戶 ID:', message.userId)
              reconnectAttemptsRef.current = 0
              break
              
            case 'auth_error':
              console.error('WebSocket 驗證失敗:', message.message)
              onError?.(new Error(message.message))
              disconnect()
              break
              
            case 'notification':
              if (onNotification && typeof message === 'object' && message !== null && 'data' in message) {
                onNotification((message as { data: NotificationData }).data)
              }
              break
              
            case 'unread_count':
              if (onUnreadCountUpdate && typeof message.count === 'number') {
                onUnreadCountUpdate(message.count)
              }
              break
              
            case 'heartbeat_ack':
              break
              
            case 'error':
              console.error('WebSocket 錯誤:', message.message)
              onError?.(new Error(String(message.message)))
              break
              
            default:
              console.warn('未知的 WebSocket 訊息類型:', message.type)
          }
        } catch (error) {
          console.error('解析 WebSocket 訊息時發生錯誤:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket 連接已關閉', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
        
        setIsConnected(false)
        setClientId(null)
        stopHeartbeat()
        onDisconnected?.()
        
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect(authToken)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket 錯誤:', error)
        onError?.(new Error('WebSocket 連接錯誤'))
      }

    } catch (error) {
      console.error('建立 WebSocket 連接時發生錯誤:', error)
      onError?.(error as Error)
      
      if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        scheduleReconnect(authToken)
      }
    }
  }, [autoReconnect, maxReconnectAttempts, onConnected, onDisconnected, onError, onNotification, onUnreadCountUpdate])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      console.log('正在關閉 WebSocket 連接')
      wsRef.current.close(1000, '用戶主動斷開連接')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setClientId(null)
    stopHeartbeat()
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    reconnectAttemptsRef.current = 0
  }, [])

  const scheduleReconnect = useCallback((authToken: string) => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    reconnectAttemptsRef.current++
    const delay = Math.min(reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1), 30000)
    
    console.log(`計劃在 ${delay}ms 後重新連接 (嘗試 ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect(authToken)
    }, delay)
  }, [connect, reconnectInterval, maxReconnectAttempts])

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'heartbeat'
        }))
      }
    }, 10000) // 每10秒發送一次心跳
  }, [])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected,
    clientId
  }
}

export class WebSocketManager {
  private static instance: WebSocketManager
  private ws: WebSocket | null = null
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map()
  private authToken: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectInterval = 5000
  private heartbeatInterval: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket 已經連接')
      return
    }

    this.authToken = token
    this.reconnectAttempts = 0
    
    this.internalConnect()
  }

  private internalConnect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`
    
    console.log('正在連接到 WebSocket:', wsUrl)
    
    try {
      this.ws = new WebSocket(wsUrl)
      this.setupEventListeners()
    } catch (error) {
      console.error('建立 WebSocket 連接時發生錯誤:', error)
      this.scheduleReconnect()
    }
  }

  private setupEventListeners() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket 連接已建立')
      this.reconnectAttempts = 0
      this.startHeartbeat()
      
      if (this.authToken) {
        this.ws?.send(JSON.stringify({
          type: 'auth',
          token: this.authToken
        }))
      }
      
      this.emit('connected', {})
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('解析 WebSocket 訊息時發生錯誤:', error)
      }
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket 連接已關閉', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      })
      
      this.stopHeartbeat()
      this.emit('disconnected', {})
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket 錯誤:', error)
      this.emit('error', { error })
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const { type } = message
    
    switch (type) {
      case 'notification':
        if ('data' in message) {
          this.emit('notification', (message as NotificationMessage).data)
        }
        break
      case 'unread_count':
        if ('count' in message) {
          this.emit('unread_count', (message as UnreadCountMessage).count)
        }
        break
      case 'auth_success':
        this.emit('auth_success', message)
        break
      case 'auth_error':
        this.emit('auth_error', message)
        break
      case 'heartbeat_ack':
        break
      default:
        this.emit(type, message)
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'heartbeat'
        }))
      }
    }, 10000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++
    const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1), 30000)
    
    console.log(`計劃在 ${delay}ms 後重新連接 (嘗試 ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.internalConnect()
    }, delay)
  }

  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(callback)
    
    return () => {
      this.off(event, callback)
    }
  }

  off(event: string, callback: (data: unknown) => void) {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`執行 ${event} 事件監聽器時發生錯誤:`, error)
      }
    })
  }

  send(message: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
      return true
    }
    return false
  }

  disconnect() {
    if (this.ws) {
      console.log('正在關閉 WebSocket 連接')
      this.ws.close(1000, '用戶主動斷開連接')
      this.ws = null
    }
    
    this.stopHeartbeat()
    this.reconnectAttempts = 0
    this.authToken = null
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
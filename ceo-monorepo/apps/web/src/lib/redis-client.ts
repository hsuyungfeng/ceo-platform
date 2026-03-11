/**
 * Redis 客戶端單例
 * 提供 Redis 連接管理和錯誤處理
 */

import Redis from 'ioredis'
import { logger } from '@/lib/logger'

export interface RedisConfig {
  url?: string
  host?: string
  port?: number
  password?: string
  db?: number
  keyPrefix?: string
  retryStrategy?: (times: number) => number | null | void
  maxRetriesPerRequest?: number
  enableReadyCheck?: boolean
  connectTimeout?: number
}

/**
 * Redis 客戶端單例類別
 */
export class RedisClient {
  private static instance: RedisClient
  private client: Redis | null = null
  private config: RedisConfig
  private isConnected = false
  private connectionAttempts = 0
  private maxConnectionAttempts = 3

  private constructor(config: RedisConfig = {}) {
    this.config = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      keyPrefix: 'ceo:',
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 10000,
      ...config,
    }

    // 自動連接
    this.connect()
  }

  /**
   * 獲取 Redis 客戶端單例
   */
  public static getInstance(config?: RedisConfig): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient(config)
    }
    return RedisClient.instance
  }

  /**
   * 連接到 Redis
   */
  private connect(): void {
    if (this.client && this.isConnected) {
      return
    }

    try {
      if (this.config.url) {
        this.client = new Redis(this.config.url, {
          maxRetriesPerRequest: this.config.maxRetriesPerRequest,
          enableReadyCheck: this.config.enableReadyCheck,
          connectTimeout: this.config.connectTimeout,
          retryStrategy: (times) => {
            if (times > this.maxConnectionAttempts) {
              logger.warn(`Redis 連接重試次數超過限制 (${times} 次)`)
              return null
            }
            return Math.min(times * 100, 3000)
          },
        })
      } else {
        this.client = new Redis({
          host: this.config.host || 'localhost',
          port: this.config.port || 6379,
          password: this.config.password,
          db: this.config.db || 0,
          maxRetriesPerRequest: this.config.maxRetriesPerRequest,
          enableReadyCheck: this.config.enableReadyCheck,
          connectTimeout: this.config.connectTimeout,
          retryStrategy: (times) => {
            if (times > this.maxConnectionAttempts) {
              logger.warn(`Redis 連接重試次數超過限制 (${times} 次)`)
              return null
            }
            return Math.min(times * 100, 3000)
          },
        })
      }

      this.setupEventListeners()
      this.connectionAttempts++
    } catch (error) {
      logger.error('Redis 連接初始化失敗:', error)
      this.client = null
      this.isConnected = false
    }
  }

  /**
   * 設置事件監聽器
   */
  private setupEventListeners(): void {
    if (!this.client) return

    this.client.on('connect', () => {
      logger.info('Redis 連接成功')
      this.isConnected = true
      this.connectionAttempts = 0
    })

    this.client.on('ready', () => {
      logger.info('Redis 準備就緒')
    })

    this.client.on('error', (error) => {
      logger.error('Redis 錯誤:', error)
      this.isConnected = false
    })

    this.client.on('close', () => {
      logger.warn('Redis 連接關閉')
      this.isConnected = false
    })

    this.client.on('reconnecting', (delay: number) => {
      logger.info(`Redis 重新連接中，延遲 ${delay}ms`)
    })

    this.client.on('end', () => {
      logger.warn('Redis 連接結束')
      this.isConnected = false
    })
  }

  /**
   * 檢查 Redis 是否已連接
   */
  public isReady(): boolean {
    return this.isConnected && this.client !== null
  }

  /**
   * 獲取 Redis 客戶端實例
   */
  public getClient(): Redis | null {
    if (!this.isReady()) {
      this.connect()
    }
    return this.client
  }

  /**
   * 設置鍵值對（帶過期時間）
   */
  public async set(
    key: string,
    value: string | Buffer | number,
    options?: {
      ex?: number // 秒
      px?: number // 毫秒
      exat?: number // UNIX 時間戳（秒）
      pxat?: number // UNIX 時間戳（毫秒）
      nx?: boolean // 僅當鍵不存在時設置
      xx?: boolean // 僅當鍵存在時設置
      keepttl?: boolean // 保持現有 TTL
    }
  ): Promise<boolean> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法設置鍵值')
      return false
    }

    try {
      const fullKey = `${this.config.keyPrefix || ''}${key}`
      let result: 'OK' | null

      if (options) {
        const args: (string | number)[] = [fullKey, value]
        
        if (options.ex) args.push('EX', options.ex)
        if (options.px) args.push('PX', options.px)
        if (options.exat) args.push('EXAT', options.exat)
        if (options.pxat) args.push('PXAT', options.pxat)
        if (options.nx) args.push('NX')
        if (options.xx) args.push('XX')
        if (options.keepttl) args.push('KEEPTTL')

        result = await client.set(...args)
      } else {
        result = await client.set(fullKey, value)
      }

      return result === 'OK'
    } catch (error) {
      logger.error('Redis 設置鍵值失敗:', error)
      return false
    }
  }

  /**
   * 獲取值
   */
  public async get(key: string): Promise<string | null> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法獲取值')
      return null
    }

    try {
      const fullKey = `${this.config.keyPrefix || ''}${key}`
      return await client.get(fullKey)
    } catch (error) {
      logger.error('Redis 獲取值失敗:', error)
      return null
    }
  }

  /**
   * 刪除鍵
   */
  public async del(key: string | string[]): Promise<number> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法刪除鍵')
      return 0
    }

    try {
      const keys = Array.isArray(key) 
        ? key.map(k => `${this.config.keyPrefix || ''}${k}`)
        : [`${this.config.keyPrefix || ''}${key}`]
      
      return await client.del(...keys)
    } catch (error) {
      logger.error('Redis 刪除鍵失敗:', error)
      return 0
    }
  }

  /**
   * 檢查鍵是否存在
   */
  public async exists(key: string | string[]): Promise<number> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法檢查鍵是否存在')
      return 0
    }

    try {
      const keys = Array.isArray(key)
        ? key.map(k => `${this.config.keyPrefix || ''}${k}`)
        : [`${this.config.keyPrefix || ''}${key}`]
      
      return await client.exists(...keys)
    } catch (error) {
      logger.error('Redis 檢查鍵是否存在失敗:', error)
      return 0
    }
  }

  /**
   * 設置過期時間
   */
  public async expire(key: string, seconds: number): Promise<boolean> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法設置過期時間')
      return false
    }

    try {
      const fullKey = `${this.config.keyPrefix || ''}${key}`
      const result = await client.expire(fullKey, seconds)
      return result === 1
    } catch (error) {
      logger.error('Redis 設置過期時間失敗:', error)
      return false
    }
  }

  /**
   * 獲取剩餘生存時間（秒）
   */
  public async ttl(key: string): Promise<number> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法獲取 TTL')
      return -2 // Redis 中鍵不存在的返回值
    }

    try {
      const fullKey = `${this.config.keyPrefix || ''}${key}`
      return await client.ttl(fullKey)
    } catch (error) {
      logger.error('Redis 獲取 TTL 失敗:', error)
      return -2
    }
  }

  /**
   * 遞增計數器
   */
  public async incr(key: string): Promise<number | null> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法遞增計數器')
      return null
    }

    try {
      const fullKey = `${this.config.keyPrefix || ''}${key}`
      return await client.incr(fullKey)
    } catch (error) {
      logger.error('Redis 遞增計數器失敗:', error)
      return null
    }
  }

  /**
   * 遞減計數器
   */
  public async decr(key: string): Promise<number | null> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法遞減計數器')
      return null
    }

    try {
      const fullKey = `${this.config.keyPrefix || ''}${key}`
      return await client.decr(fullKey)
    } catch (error) {
      logger.error('Redis 遞減計數器失敗:', error)
      return null
    }
  }

  /**
   * 哈希表設置字段值
   */
  public async hset(key: string, field: string, value: string): Promise<boolean> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法設置哈希字段')
      return false
    }

    try {
      const fullKey = `${this.config.keyPrefix || ''}${key}`
      const result = await client.hset(fullKey, field, value)
      return result === 1 || result === 0
    } catch (error) {
      logger.error('Redis 設置哈希字段失敗:', error)
      return false
    }
  }

  /**
   * 哈希表獲取字段值
   */
  public async hget(key: string, field: string): Promise<string | null> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法獲取哈希字段')
      return null
    }

    try {
      const fullKey = `${this.config.keyPrefix || ''}${key}`
      return await client.hget(fullKey, field)
    } catch (error) {
      logger.error('Redis 獲取哈希字段失敗:', error)
      return null
    }
  }

  /**
   * 哈希表獲取所有字段值
   */
  public async hgetall(key: string): Promise<Record<string, string> | null> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法獲取哈希表')
      return null
    }

    try {
      const fullKey = `${this.config.keyPrefix || ''}${key}`
      return await client.hgetall(fullKey)
    } catch (error) {
      logger.error('Redis 獲取哈希表失敗:', error)
      return null
    }
  }

  /**
   * 發布消息到頻道
   */
  public async publish(channel: string, message: string): Promise<number> {
    const client = this.getClient()
    if (!client) {
      logger.warn('Redis 未連接，無法發布消息')
      return 0
    }

    try {
      const fullChannel = `${this.config.keyPrefix || ''}${channel}`
      return await client.publish(fullChannel, message)
    } catch (error) {
      logger.error('Redis 發布消息失敗:', error)
      return 0
    }
  }

  /**
   * 關閉 Redis 連接
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit()
        logger.info('Redis 連接已關閉')
      } catch (error) {
        logger.error('Redis 關閉連接失敗:', error)
      } finally {
        this.client = null
        this.isConnected = false
      }
    }
  }

  /**
   * 健康檢查
   */
  public async healthCheck(): Promise<{
    healthy: boolean
    latency?: number
    error?: string
  }> {
    const client = this.getClient()
    if (!client) {
      return {
        healthy: false,
        error: 'Redis 客戶端未初始化',
      }
    }

    try {
      const startTime = Date.now()
      await client.ping()
      const latency = Date.now() - startTime

      return {
        healthy: true,
        latency,
      }
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * 獲取連接狀態
   */
  public getStatus(): {
    connected: boolean
    connectionAttempts: number
    config: RedisConfig
  } {
    return {
      connected: this.isConnected,
      connectionAttempts: this.connectionAttempts,
      config: this.config,
    }
  }
}

/**
 * 導出 Redis 客戶端單例
 */
export const redisClient = RedisClient.getInstance()

/**
 * 工廠函數：創建 Redis 客戶端（用於測試或特殊配置）
 */
export function createRedisClient(config?: RedisConfig): RedisClient {
  return RedisClient.getInstance(config)
}
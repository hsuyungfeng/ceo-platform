/**
 * 全域速率限制中介軟體
 * 使用 Redis 實現分散式速率限制，支援水平擴展
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { redisClient } from '@/lib/redis-client';

interface RateLimitConfig {
  windowMs: number; // 時間窗口（毫秒）
  maxRequests: number; // 每個窗口最大請求數
  keyPrefix?: string; // Redis 鍵前綴
  skipPaths?: string[]; // 跳過速率限制的路徑
  skipMethods?: string[]; // 跳過速率限制的 HTTP 方法
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
  retryAfter?: number;
}

/**
 * 全域速率限制器
 */
export class GlobalRateLimiter {
  private config: Required<RateLimitConfig>;
  private redisAvailable: boolean = false;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: 'global:ratelimit:',
      skipPaths: ['/api/health', '/api/auth/login', '/api/auth/register'],
      skipMethods: ['GET', 'HEAD', 'OPTIONS'],
      ...config,
    };

    this.redisAvailable = redisClient.isReady();
    
    if (!this.redisAvailable) {
      logger.warn('Redis 不可用，全域速率限制將使用記憶體存儲（不支援水平擴展）');
    }
  }

  /**
   * 生成速率限制鍵
   */
  private generateKey(identifier: string): string {
    const now = Math.floor(Date.now() / this.config.windowMs);
    return `${this.config.keyPrefix}${identifier}:${now}`;
  }

  /**
   * 檢查是否應該跳過速率限制
   */
  private shouldSkip(request: NextRequest): boolean {
    const pathname = new URL(request.url).pathname;
    const method = request.method.toUpperCase();

    // 檢查路徑是否在跳過列表中
    if (this.config.skipPaths.some(skipPath => pathname.startsWith(skipPath))) {
      return true;
    }

    // 檢查方法是否在跳過列表中
    if (this.config.skipMethods.includes(method)) {
      return true;
    }

    return false;
  }

  /**
   * 獲取請求標識符
   */
  private getIdentifier(request: NextRequest): string {
    // 優先使用 IP 地址
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // 對於 API 請求，可以結合用戶 ID
    const userId = request.headers.get('x-user-id') || 'anonymous';

    return `${ip}:${userId}`;
  }

  /**
   * 執行速率限制檢查
   */
  async checkRateLimit(request: NextRequest): Promise<RateLimitResult> {
    // 檢查是否應該跳過
    if (this.shouldSkip(request)) {
      return {
        success: true,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
        limit: this.config.maxRequests,
      };
    }

    const identifier = this.getIdentifier(request);
    const key = this.generateKey(identifier);
    const now = Date.now();
    const resetTime = Math.ceil(now / this.config.windowMs) * this.config.windowMs;

    try {
      if (this.redisAvailable) {
        // 使用 Redis 進行分散式速率限制
        return await this.checkWithRedis(key, identifier);
      } else {
        // 使用記憶體存儲（僅單一伺服器）
        return this.checkWithMemory(key, identifier);
      }
    } catch (error) {
      logger.error('速率限制檢查失敗:', error);
      
      // 在錯誤情況下允許請求通過
      return {
        success: true,
        remaining: this.config.maxRequests,
        resetTime,
        limit: this.config.maxRequests,
      };
    }
  }

  /**
   * 使用 Redis 檢查速率限制
   */
  private async checkWithRedis(key: string, identifier: string): Promise<RateLimitResult> {
    const pipeline = redisClient.pipeline();
    
    // 增加計數器並設置過期時間
    pipeline.incr(key);
    pipeline.expire(key, Math.ceil(this.config.windowMs / 1000));
    
    const results = await pipeline.exec();
    
    if (!results || results.length < 2) {
      throw new Error('Redis pipeline 執行失敗');
    }

    const currentCount = results[0][1] as number;
    const remaining = Math.max(0, this.config.maxRequests - currentCount);
    const resetTime = Date.now() + this.config.windowMs;

    if (currentCount > this.config.maxRequests) {
      logger.warn({
        identifier,
        currentCount,
        limit: this.config.maxRequests,
      }, '請求超過速率限制');

      return {
        success: false,
        remaining: 0,
        resetTime,
        limit: this.config.maxRequests,
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      };
    }

    return {
      success: true,
      remaining,
      resetTime,
      limit: this.config.maxRequests,
    };
  }

  /**
   * 使用記憶體檢查速率限制
   */
  private checkWithMemory(key: string, identifier: string): RateLimitResult {
    // 簡單的記憶體存儲實現
    // 注意：這不支援水平擴展，僅用於開發或單一伺服器環境
    const memoryStore = (global as any).__rateLimitMemoryStore = 
      (global as any).__rateLimitMemoryStore || new Map();

    const now = Date.now();
    const entry = memoryStore.get(key);

    if (!entry || entry.resetTime < now) {
      // 新窗口或窗口已重置
      memoryStore.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
    } else {
      // 增加現有窗口計數
      entry.count++;
      memoryStore.set(key, entry);
    }

    const currentEntry = memoryStore.get(key);
    const remaining = Math.max(0, this.config.maxRequests - currentEntry.count);
    const resetTime = currentEntry.resetTime;

    if (currentEntry.count > this.config.maxRequests) {
      logger.warn({
        identifier,
        currentCount: currentEntry.count,
        limit: this.config.maxRequests,
      }, '請求超過速率限制');

      return {
        success: false,
        remaining: 0,
        resetTime,
        limit: this.config.maxRequests,
        retryAfter: Math.ceil((resetTime - now) / 1000),
      };
    }

    return {
      success: true,
      remaining,
      resetTime,
      limit: this.config.maxRequests,
    };
  }

  /**
   * 清理過期的記憶體存儲條目
   */
  cleanupMemoryStore(): void {
    if (!(global as any).__rateLimitMemoryStore) {
      return;
    }

    const memoryStore = (global as any).__rateLimitMemoryStore;
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of memoryStore.entries()) {
      if (entry.resetTime < now) {
        memoryStore.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`清理了 ${cleanedCount} 個過期速率限制條目`);
    }
  }

  /**
   * 健康檢查
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    storageMode: 'redis' | 'memory';
    error?: string;
  }> {
    try {
      if (this.redisAvailable) {
        const redisHealth = await redisClient.healthCheck();
        return {
          healthy: redisHealth.healthy,
          storageMode: 'redis',
          error: redisHealth.error,
        };
      } else {
        return {
          healthy: true,
          storageMode: 'memory',
        };
      }
    } catch (error) {
      return {
        healthy: false,
        storageMode: this.redisAvailable ? 'redis' : 'memory',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

/**
 * 全域速率限制中介軟體
 */
export async function globalRateLimitMiddleware(
  request: NextRequest,
  rateLimiter: GlobalRateLimiter
): Promise<NextResponse | null> {
  const result = await rateLimiter.checkRateLimit(request);

  if (!result.success) {
    logger.warn({
      path: request.url,
      identifier: rateLimiter['getIdentifier'](request),
      limit: result.limit,
      retryAfter: result.retryAfter,
    }, '請求被速率限制阻擋');

    return NextResponse.json(
      {
        error: '請求過於頻繁',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: result.retryAfter,
        limit: result.limit,
        resetTime: new Date(result.resetTime).toISOString(),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
          'Retry-After': result.retryAfter?.toString() || '60',
        },
      }
    );
  }

  // 添加速率限制頭部資訊
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());

  return null;
}

/**
 * 預設全域速率限制器實例
 */
export const defaultGlobalRateLimiter = new GlobalRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分鐘
  maxRequests: 100, // 每個 IP+用戶 100 次請求
  keyPrefix: 'global:ratelimit:',
  skipPaths: [
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/logout',
  ],
  skipMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// 定期清理記憶體存儲
if (typeof global !== 'undefined') {
  setInterval(() => {
    defaultGlobalRateLimiter.cleanupMemoryStore();
  }, 5 * 60 * 1000); // 每5分鐘清理一次
}
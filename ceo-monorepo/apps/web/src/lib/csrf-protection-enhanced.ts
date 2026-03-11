/**
 * 增強版 CSRF 保護系統
 * 使用環境變數中的密鑰進行令牌簽名和驗證
 * 支援 Redis 存儲以實現水平擴展
 */

import { createHmac, randomBytes } from 'crypto';
import { logger } from '@/lib/logger';
import { redisClient } from '@/lib/redis-client';

interface CSRFTokenData {
  token: string;
  signature: string;
  sessionId: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * 增強版 CSRF 保護
 * 使用 HMAC 簽名確保令牌完整性，支援 Redis 存儲
 */
export class EnhancedCSRFProtection {
  private tokenLength: number = 32;
  private maxAge: number = 3600; // 1 hour
  private cleanupInterval: NodeJS.Timeout | null = null;
  private secret: string;
  private useRedis: boolean = false;
  private redisKeyPrefix: string = 'csrf:';
  private memoryTokens: Map<string, CSRFTokenData> = new Map();

  constructor(secret: string, options?: { 
    tokenLength?: number; 
    maxAge?: number;
    useRedis?: boolean;
    redisKeyPrefix?: string;
  }) {
    if (!secret || secret.trim() === '') {
      throw new Error('CSRF_SECRET 環境變數必須設定且非空');
    }

    if (secret.length < 32) {
      logger.warn(`CSRF_SECRET 長度過短 (${secret.length} 字元)，建議至少 32 字元`);
    }

    this.secret = secret;
    this.tokenLength = options?.tokenLength || 32;
    this.maxAge = options?.maxAge || 3600;
    this.useRedis = options?.useRedis ?? true;
    this.redisKeyPrefix = options?.redisKeyPrefix || 'csrf:';

    // 檢查 Redis 可用性
    if (this.useRedis && !redisClient.isReady()) {
      logger.warn('Redis 未連接，CSRF 保護將使用記憶體存儲');
      this.useRedis = false;
    }

    // 啟動清理間隔（僅記憶體模式需要）
    if (!this.useRedis) {
      this.startCleanup();
    }
  }

  /**
   * 生成 HMAC 簽名
   */
  private generateSignature(data: string): string {
    const hmac = createHmac('sha256', this.secret);
    hmac.update(data);
    return hmac.digest('hex');
  }

  /**
   * 驗證簽名
   */
  private verifySignature(data: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(data);
    return expectedSignature === signature;
  }

  /**
   * 生成隨機令牌
   */
  private generateToken(): string {
    return randomBytes(this.tokenLength).toString('hex');
  }

  /**
   * 獲取 Redis 鍵名
   */
  private getRedisKey(token: string): string {
    return `${this.redisKeyPrefix}${token}`;
  }

  /**
   * 存儲令牌到 Redis
   */
  private async storeTokenInRedis(tokenData: CSRFTokenData): Promise<boolean> {
    if (!this.useRedis) return false;

    try {
      const key = this.getRedisKey(tokenData.token);
      const value = JSON.stringify(tokenData);
      await redisClient.set(key, value, { EX: this.maxAge });
      return true;
    } catch (error) {
      logger.error('存儲 CSRF 令牌到 Redis 失敗:', error);
      return false;
    }
  }

  /**
   * 從 Redis 獲取令牌
   */
  private async getTokenFromRedis(token: string): Promise<CSRFTokenData | null> {
    if (!this.useRedis) return null;

    try {
      const key = this.getRedisKey(token);
      const value = await redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value) as CSRFTokenData;
    } catch (error) {
      logger.error('從 Redis 獲取 CSRF 令牌失敗:', error);
      return null;
    }
  }

  /**
   * 從 Redis 刪除令牌
   */
  private async deleteTokenFromRedis(token: string): Promise<boolean> {
    if (!this.useRedis) return false;

    try {
      const key = this.getRedisKey(token);
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('從 Redis 刪除 CSRF 令牌失敗:', error);
      return false;
    }
  }

  /**
   * 啟動清理過期令牌的間隔
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // 每 5 分鐘清理一次過期令牌
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 5 * 60 * 1000);
  }

  /**
   * 清理過期令牌
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    
    if (this.useRedis) {
      // Redis 會自動過期，不需要手動清理
      return;
    }

    // 清理記憶體中的過期令牌
    let expiredCount = 0;
    const entries = Array.from(this.memoryTokens.entries());
    for (const [key, tokenData] of entries) {
      if (tokenData.expiresAt < now) {
        this.memoryTokens.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logger.info(`清理了 ${expiredCount} 個過期 CSRF 令牌`);
    }
  }

  /**
   * 生成 CSRF 令牌
   */
  async generateCSRFToken(sessionId: string): Promise<string> {
    const token = this.generateToken();
    const now = Date.now();
    const expiresAt = now + this.maxAge * 1000;

    // 生成簽名
    const dataToSign = `${token}:${sessionId}:${now}`;
    const signature = this.generateSignature(dataToSign);

    const tokenData: CSRFTokenData = {
      token,
      signature,
      sessionId,
      createdAt: now,
      expiresAt,
    };

    if (this.useRedis) {
      await this.storeTokenInRedis(tokenData);
    } else {
      this.memoryTokens.set(token, tokenData);
    }

    logger.info({ sessionId: sessionId.substring(0, 8) }, 'CSRF 令牌已生成');
    return token;
  }

  /**
   * 驗證 CSRF 令牌
   */
  async verifyCSRFToken(sessionId: string, token: string): Promise<boolean> {
    if (!token || !sessionId) {
      return false;
    }

    let tokenData: CSRFTokenData | null = null;

    if (this.useRedis) {
      tokenData = await this.getTokenFromRedis(token);
    } else {
      tokenData = this.memoryTokens.get(token) || null;
    }

    if (!tokenData) {
      logger.warn({ token: token.substring(0, 8) }, 'CSRF 令牌不存在');
      return false;
    }

    // 檢查是否過期
    if (tokenData.expiresAt < Date.now()) {
      logger.warn({ token: token.substring(0, 8) }, 'CSRF 令牌已過期');
      await this.deleteToken(token);
      return false;
    }

    // 檢查 sessionId 是否匹配
    if (tokenData.sessionId !== sessionId) {
      logger.warn({ token: token.substring(0, 8) }, 'CSRF 令牌 sessionId 不匹配');
      return false;
    }

    // 驗證簽名
    const dataToVerify = `${token}:${sessionId}:${tokenData.createdAt}`;
    if (!this.verifySignature(dataToVerify, tokenData.signature)) {
      logger.warn({ token: token.substring(0, 8) }, 'CSRF 令牌簽名驗證失敗');
      await this.deleteToken(token);
      return false;
    }

    return true;
  }

  /**
   * 刪除 CSRF 令牌
   */
  async deleteToken(token: string): Promise<boolean> {
    if (this.useRedis) {
      return await this.deleteTokenFromRedis(token);
    } else {
      return this.memoryTokens.delete(token);
    }
  }

  /**
   * 獲取存儲模式
   */
  getStorageMode(): 'redis' | 'memory' {
    return this.useRedis ? 'redis' : 'memory';
  }

  /**
   * 獲取活躍令牌數量
   */
  async getActiveTokenCount(): Promise<number> {
    if (this.useRedis) {
      try {
        // 使用 SCAN 命令獲取所有 CSRF 令牌
        const pattern = `${this.redisKeyPrefix}*`;
        const keys = await redisClient.keys(pattern);
        return keys.length;
      } catch (error) {
        logger.error('獲取 Redis CSRF 令牌數量失敗:', error);
        return 0;
      }
    } else {
      return this.memoryTokens.size;
    }
  }

  /**
   * 健康檢查
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    storageMode: 'redis' | 'memory';
    tokenCount?: number;
    error?: string;
  }> {
    try {
      const storageMode = this.getStorageMode();
      
      if (storageMode === 'redis') {
        const redisHealth = await redisClient.healthCheck();
        return {
          healthy: redisHealth.healthy,
          storageMode,
          error: redisHealth.error,
        };
      } else {
        const tokenCount = await this.getActiveTokenCount();
        return {
          healthy: true,
          storageMode,
          tokenCount,
        };
      }
    } catch (error) {
      return {
        healthy: false,
        storageMode: this.getStorageMode(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 停止清理間隔
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 銷毀實例
   */
  destroy(): void {
    this.stopCleanup();
    this.memoryTokens.clear();
  }
}

/**
 * 導出單例實例
 */
const csrfSecret = process.env.CSRF_SECRET;
if (!csrfSecret || csrfSecret.trim() === '') {
  logger.error('CSRF_SECRET 環境變數未設定，CSRF 保護可能無法正常運作');
}

// 檢查 Redis 可用性
const redisAvailable = redisClient.isReady();
if (redisAvailable) {
  logger.info('CSRF 保護將使用 Redis 存儲');
} else {
  logger.warn('Redis 不可用，CSRF 保護將使用記憶體存儲');
}

export const enhancedCSRFProtection = csrfSecret 
  ? new EnhancedCSRFProtection(csrfSecret, {
      tokenLength: 32,
      maxAge: 3600, // 1小時
      useRedis: redisAvailable,
      redisKeyPrefix: 'csrf:',
    })
  : null;

// 健康檢查
if (enhancedCSRFProtection) {
  // 延遲執行健康檢查，避免啟動時阻塞
  setTimeout(async () => {
    try {
      const health = await enhancedCSRFProtection.healthCheck();
      if (health.healthy) {
        logger.info(`CSRF 保護健康檢查通過，存儲模式: ${health.storageMode}`);
      } else {
        logger.warn(`CSRF 保護健康檢查失敗: ${health.error}`);
      }
    } catch (error) {
      logger.error('CSRF 保護健康檢查錯誤:', error);
    }
  }, 5000); // 5秒後執行
}
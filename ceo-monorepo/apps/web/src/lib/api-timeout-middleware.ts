/**
 * API 超時中介軟體
 * 防止長時間運行的 API 請求阻塞伺服器
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface TimeoutConfig {
  defaultTimeout: number; // 預設超時時間（毫秒）
  endpointTimeouts: Record<string, number>; // 端點特定超時時間
  skipPaths: string[]; // 跳過超時檢查的路徑
}

/**
 * API 超時中介軟體
 */
export class APITimeoutMiddleware {
  private config: Required<TimeoutConfig>;

  constructor(config?: Partial<TimeoutConfig>) {
    this.config = {
      defaultTimeout: 30000, // 30 秒
      endpointTimeouts: {
        '/api/reports/generate': 120000, // 報表生成：2 分鐘
        '/api/export': 180000, // 資料匯出：3 分鐘
        '/api/import': 240000, // 資料匯入：4 分鐘
        '/api/batch': 60000, // 批次處理：1 分鐘
      },
      skipPaths: [
        '/api/health',
        '/api/websocket',
        '/api/notifications/stream',
      ],
      ...config,
    };
  }

  /**
   * 檢查是否應該跳過超時檢查
   */
  private shouldSkip(request: NextRequest): boolean {
    const pathname = new URL(request.url).pathname;
    
    // 檢查路徑是否在跳過列表中
    if (this.config.skipPaths.some(skipPath => pathname.startsWith(skipPath))) {
      return true;
    }

    return false;
  }

  /**
   * 獲取端點超時時間
   */
  private getTimeoutForEndpoint(pathname: string): number {
    // 檢查是否有端點特定的超時配置
    for (const [endpoint, timeout] of Object.entries(this.config.endpointTimeouts)) {
      if (pathname.startsWith(endpoint)) {
        return timeout;
      }
    }

    return this.config.defaultTimeout;
  }

  /**
   * 執行帶有超時的 API 處理
   */
  async withTimeout<T>(
    request: NextRequest,
    handler: () => Promise<T>,
    customTimeout?: number
  ): Promise<T> {
    // 檢查是否應該跳過
    if (this.shouldSkip(request)) {
      return await handler();
    }

    const pathname = new URL(request.url).pathname;
    const timeout = customTimeout || this.getTimeoutForEndpoint(pathname);
    const startTime = Date.now();

    // 創建超時 Promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`API 請求超時 (${timeout}ms): ${pathname}`));
      }, timeout);
    });

    try {
      // 執行處理器，帶有超時限制
      const result = await Promise.race([
        handler(),
        timeoutPromise,
      ]);

      const duration = Date.now() - startTime;
      
      // 記錄慢 API 請求
      if (duration > 5000) { // 超過 5 秒的請求
        logger.warn({
          path: pathname,
          method: request.method,
          duration,
          timeout,
        }, '慢 API 請求警告');
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof Error && error.message.includes('API 請求超時')) {
        logger.error({
          path: pathname,
          method: request.method,
          duration,
          timeout,
        }, 'API 請求超時');
        
        // 拋出自定義錯誤
        throw new Error(`API 請求超時: ${pathname} (${duration}ms)`);
      }
      
      logger.error({
        path: pathname,
        method: request.method,
        duration,
        error: error instanceof Error ? error.message : String(error),
      }, 'API 請求錯誤');
      
      throw error;
    }
  }

  /**
   * 中介軟體函數，用於包裝 API 路由處理器
   */
  middleware(handler: (request: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        const response = await this.withTimeout(
          request,
          () => handler(request)
        );

        // 添加超時相關頭部資訊
        const pathname = new URL(request.url).pathname;
        const timeout = this.getTimeoutForEndpoint(pathname);
        response.headers.set('X-API-Timeout', timeout.toString());
        response.headers.set('X-API-Timeout-Unit', 'milliseconds');

        return response;
      } catch (error) {
        if (error instanceof Error && error.message.includes('API 請求超時')) {
          return NextResponse.json(
            {
              error: '請求處理超時',
              code: 'REQUEST_TIMEOUT',
              message: '伺服器處理請求時間過長，請稍後再試',
            },
            {
              status: 504, // Gateway Timeout
              headers: {
                'Retry-After': '60', // 60 秒後重試
              },
            }
          );
        }

        // 重新拋出其他錯誤
        throw error;
      }
    };
  }

  /**
   * 健康檢查
   */
  healthCheck() {
    return {
      healthy: true,
      config: {
        defaultTimeout: this.config.defaultTimeout,
        endpointCount: Object.keys(this.config.endpointTimeouts).length,
        skipPathCount: this.config.skipPaths.length,
      },
    };
  }
}

/**
 * 預設 API 超時中介軟體實例
 */
export const defaultAPITimeoutMiddleware = new APITimeoutMiddleware();

/**
 * 簡化中介軟體包裝函數
 */
export function withTimeout(handler: (request: NextRequest) => Promise<NextResponse>) {
  return defaultAPITimeoutMiddleware.middleware(handler);
}

/**
 * 創建帶有超時的 API 路由處理器
 */
export function createTimeoutHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  customTimeout?: number
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const response = await defaultAPITimeoutMiddleware.withTimeout(
        request,
        () => handler(request),
        customTimeout
      );

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('API 請求超時')) {
        return NextResponse.json(
          {
            error: '請求處理超時',
            code: 'REQUEST_TIMEOUT',
          },
          { status: 504 }
        );
      }

      throw error;
    }
  };
}
/**
 * Sentry 集成示例 API
 * 
 * 展示如何在 API 路由中集成 Sentry 進行錯誤監控和性能跟踪
 */

import { NextRequest, NextResponse } from 'next/server';
import { withSentry } from '@sentry/nextjs';
import { 
  captureApiError,
  captureMessage,
  startPerformanceTrace,
  setRequestContext
} from '@/lib/sentry-helper';

// 使用 Sentry 包裹的 GET 處理函數
export const GET = withSentry(async function GET(request: NextRequest) {
  try {
    // 設置請求上下文
    const requestId = Math.random().toString(36).substr(2, 9);
    setRequestContext(requestId, '/api/v1/health/sentry-example', 'GET');
    
    // 開始性能跟踪
    const transaction = startPerformanceTrace(
      'sentry-example-api',
      'http.server'
    );
    
    // 模擬一些處理邏輯
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 發送一個自定義消息到 Sentry
    captureMessage('Sentry 示例 API 被訪問', 'info', {
      endpoint: '/api/v1/health/sentry-example',
      method: 'GET',
      timestamp: new Date().toISOString(),
    });
    
    // 模擬可選的錯誤測試
    const testError = request.nextUrl.searchParams.get('test_error');
    if (testError === 'true') {
      // 故意拋出錯誤以測試 Sentry 捕獲
      throw new Error('這是測試 Sentry 錯誤捕獲的示例錯誤');
    }
    
    // 完成性能跟踪
    transaction.finish();
    
    return NextResponse.json({
      success: true,
      message: 'Sentry 集成示例 API',
      data: {
        sentry_initialized: true,
        request_id: requestId,
        timestamp: new Date().toISOString(),
        features: [
          '錯誤監控',
          '性能跟踪',
          '用戶會話跟踪',
          '發布跟踪',
          '源映射支持'
        ],
        endpoints: {
          health: '/api/v1/health',
          user_profile: '/api/v1/user/profile',
          suppliers: '/api/v1/suppliers',
          orders: '/api/v1/orders',
        }
      }
    }, {
      status: 200,
      headers: {
        'X-API-Version': 'v1',
        'X-Request-ID': requestId,
      }
    });
    
  } catch (error) {
    // 捕獲並報告 API 錯誤
    captureApiError(
      error,
      '/api/v1/health/sentry-example',
      'GET'
    );
    
    // 返回錯誤響應
    return NextResponse.json({
      success: false,
      error: {
        code: 'SENTRY_TEST_ERROR',
        message: 'Sentry 測試錯誤',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : '錯誤已記錄到監控系統'
      }
    }, {
      status: 500,
      headers: {
        'X-API-Version': 'v1',
      }
    });
  }
});

// 使用 Sentry 包裹的 POST 處理函數
export const POST = withSentry(async function POST(request: NextRequest) {
  try {
    // 設置請求上下文
    const requestId = Math.random().toString(36).substr(2, 9);
    setRequestContext(requestId, '/api/v1/health/sentry-example', 'POST');
    
    // 開始性能跟踪
    const transaction = startPerformanceTrace(
      'sentry-example-api-post',
      'http.server'
    );
    
    // 解析請求體
    const body = await request.json().catch(() => ({}));
    
    // 發送自定義消息
    captureMessage('Sentry 示例 POST API 被訪問', 'info', {
      endpoint: '/api/v1/health/sentry-example',
      method: 'POST',
      body_type: typeof body,
      timestamp: new Date().toISOString(),
    });
    
    // 模擬處理時間
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // 完成性能跟踪
    transaction.finish();
    
    return NextResponse.json({
      success: true,
      message: 'Sentry POST 示例成功',
      data: {
        request_id: requestId,
        received_body: body,
        sentry_integration: 'active',
        performance_monitoring: 'enabled',
        error_tracking: 'enabled',
      }
    }, {
      status: 201,
      headers: {
        'X-API-Version': 'v1',
        'X-Request-ID': requestId,
      }
    });
    
  } catch (error) {
    // 捕獲並報告 API 錯誤
    captureApiError(
      error,
      '/api/v1/health/sentry-example',
      'POST'
    );
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'SENTRY_POST_ERROR',
        message: 'POST 請求處理失敗',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : '錯誤已記錄到監控系統'
      }
    }, {
      status: 500,
      headers: {
        'X-API-Version': 'v1',
      }
    });
  }
});

// 健康檢查端點（用於 Sentry 監控）
export async function GETHealth(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    sentry: 'integrated',
    timestamp: new Date().toISOString(),
  });
}
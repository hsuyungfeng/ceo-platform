// Sentry 服務器配置
// 這個文件配置 Sentry 用於服務器端錯誤監控

import * as Sentry from "@sentry/nextjs";
import { safeInitSentry, getSentryInitOptions } from './src/lib/sentry-init';

// 安全地初始化 Sentry
safeInitSentry((options) => {
  Sentry.init({
  ...options,
  
  // 服務器特定配置
  enableTracing: true,
  
  // 集成配置
  integrations: [
    // 添加 HTTP 集成以監控 API 請求
    new Sentry.Integrations.Http({ tracing: true }),
    
    // 添加 Postgres 集成（如果使用）
    // new Sentry.Integrations.Postgres(),
  ],
  
  // 忽略的錯誤類型
  ignoreErrors: [
    // 預期業務錯誤
    /ValidationError/,
    /NotFoundError/,
    /UnauthorizedError/,
    
    // 數據庫連接錯誤（在健康檢查中處理）
    /database connection/,
    /connection refused/,
    
    // 第三方 API 錯誤
    /third-party-api/,
  ],
  
  // 在發送前修改事件
  beforeSend(event, hint) {
    // 檢查是否為預期錯誤
    const error = hint.originalException;
    
    // 忽略特定業務錯誤
    if (error && error.message) {
      // 忽略驗證錯誤（由 API 中間件處理）
      if (error.message.includes('驗證失敗') || 
          error.message.includes('Validation failed')) {
        return null;
      }
      
      // 忽略資源未找到錯誤
      if (error.message.includes('未找到') || 
          error.message.includes('Not found')) {
        return null;
      }
    }
    
    // 匿名化敏感數據
    if (event.request) {
      // 移除敏感 headers
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
      
      // 匿名化請求體中的敏感數據
      if (event.request.data) {
        try {
          const data = JSON.parse(event.request.data);
          if (data.password) data.password = '***';
          if (data.token) data.token = '***';
          if (data.apiKey) data.apiKey = '***';
          event.request.data = JSON.stringify(data);
        } catch (e) {
          // 忽略解析錯誤
        }
      }
    }
    
    // 添加自定義標籤
    event.tags = {
      ...event.tags,
      platform: 'nextjs',
      app: 'ceo-platform',
      phase: '10.4', // 當前開發階段
    };
    
    return event;
  },
  
  // 發布跟踪配置
  release: process.env.npm_package_version || '1.0.0',
  
  // 設置用戶信息（從請求中提取）
  sendDefaultPii: false, // 不發送默認 PII
  
  // 性能監控配置
  _experiments: {
    // 啟用更詳細的 SQL 查詢跟踪
    // sqlCapture: true,
  });
});
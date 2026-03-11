// Sentry Edge 運行時配置
// 這個文件配置 Sentry 用於 Edge 運行時（Middleware, Edge Functions）

import * as Sentry from "@sentry/nextjs";
import { safeInitSentry, getSentryInitOptions } from './src/lib/sentry-init';

// 安全地初始化 Sentry
safeInitSentry((options) => {
  Sentry.init({
  ...options,
  
  // Edge 運行時特定配置
  // Edge 運行時採樣率較低以節省資源
  sampleRate: options.environment === 'production' ? 0.05 : 0.5,
  
  // Edge 運行時性能監控採樣率
  tracesSampleRate: options.environment === 'production' ? 0.05 : 0.5,
  
  // 忽略的錯誤類型（Edge 特定）
  ignoreErrors: [
    // Edge 運行時特定錯誤
    /edge-runtime/,
    /middleware/,
    
    // 預期錯誤
    /aborted/,
    /cancelled/,
  ],
  
  // 在發送前修改事件
  beforeSend(event, hint) {
    // Edge 運行時特定過濾
    const error = hint.originalException;
    
    // 忽略 Edge 運行時預期錯誤
    if (error && error.message) {
      if (error.message.includes('Middleware') && 
          error.message.includes('timeout')) {
        return null;
      }
    }
    
    // 匿名化敏感數據
    if (event.request) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    
    return event;
  },
  
  // 發布信息
  release: process.env.npm_package_version || '1.0.0',
  
  // 不發送個人身份信息
  sendDefaultPii: false,
  });
});
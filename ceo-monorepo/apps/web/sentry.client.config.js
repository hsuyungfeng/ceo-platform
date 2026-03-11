// Sentry 客戶端配置
// 這個文件配置 Sentry 用於瀏覽器端錯誤監控

import * as Sentry from "@sentry/nextjs";
import { safeInitSentry, getSentryInitOptions } from './src/lib/sentry-init';

// 安全地初始化 Sentry
safeInitSentry((options) => {
  Sentry.init({
  ...options,
  
  // 客戶端特定配置
  enableTracing: true,
  
  // 啟用會話重放（僅在生產環境）
  replaysOnErrorSampleRate: options.environment === 'production' ? 0.1 : 0,
  
  // 啟用會話重放採樣率
  replaysSessionSampleRate: options.environment === 'production' ? 0.1 : 0,
  
  // 忽略的錯誤類型
  ignoreErrors: [
    // 網絡錯誤
    'NetworkError',
    'Failed to fetch',
    'Network request failed',
    
    // 瀏覽器擴展錯誤
    /ExtensionContext/,
    
    // 第三方腳本錯誤
    /chat-widget/,
  ],
  
  // 在發送前修改事件
  beforeSend(event, hint) {
    // 檢查是否為預期錯誤
    const error = hint.originalException;
    
    // 忽略特定錯誤
    if (error && error.message && error.message.includes('ResizeObserver')) {
      return null;
    }
    
    // 匿名化敏感數據
    if (event.request) {
      // 移除敏感 headers
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
      
      // 匿名化 URL 參數
      if (event.request.url) {
        event.request.url = event.request.url.replace(/token=[^&]*/, 'token=***');
        event.request.url = event.request.url.replace(/password=[^&]*/, 'password=***');
      }
    }
    
    return event;
  },
  
  // 在發送前修改會話重放
  beforeSendReplay(event) {
    // 匿名化敏感數據
    if (event.urls) {
      event.urls = event.urls.map(url => 
        url.replace(/token=[^&]*/, 'token=***')
           .replace(/password=[^&]*/, 'password=***')
      );
    }
    
    // 屏蔽敏感元素
    event.maskAllText = false;
    event.maskAllInputs = true;
    
    // 屏蔽特定選擇器
    event.blockSelector = '[data-sentry-block], input[type="password"], input[type="creditcard"]';
    
    return event;
  });
});
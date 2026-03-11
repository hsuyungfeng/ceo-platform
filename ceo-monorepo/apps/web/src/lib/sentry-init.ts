/**
 * Sentry 初始化配置
 * 
 * 集中管理 Sentry 配置，避免在各個配置文件中重複
 */

// Sentry 配置類型
export interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
  debug: boolean;
  tracesSampleRate: number;
  profilesSampleRate: number;
  errorSampleRate: number;
}

/**
 * 獲取 Sentry 配置
 */
export function getSentryConfig(): SentryConfig {
  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || `v1.0.0-${Date.now()}`,
    debug: process.env.SENTRY_DEBUG === 'true',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
    errorSampleRate: parseFloat(process.env.SENTRY_ERROR_SAMPLE_RATE || '1.0'),
  };
}

/**
 * 檢查 Sentry 是否已配置
 */
export function isSentryConfigured(): boolean {
  const config = getSentryConfig();
  return !!config.dsn;
}

/**
 * 獲取 Sentry 初始化選項
 */
export function getSentryInitOptions() {
  const config = getSentryConfig();
  
  return {
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    debug: config.debug,
    
    // 性能監控
    integrations: [],
    tracesSampleRate: config.tracesSampleRate,
    profilesSampleRate: config.profilesSampleRate,
    
    // 錯誤報告
    sampleRate: config.errorSampleRate,
    
    // 忽略的錯誤
    ignoreErrors: [
      // 網絡錯誤
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      'TypeError: Failed to fetch',
      'TypeError: NetworkError when attempting to fetch resource',
      
      // 瀏覽器特定錯誤
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      
      // Next.js 特定錯誤
      'NEXT_NOT_FOUND',
      'NEXT_REDIRECT',
      
      // 已知的第三方庫錯誤
      'Non-Error promise rejection captured',
      'Non-Error exception captured',
    ],
    
    // 忽略的事務
    denyUrls: [
      // 瀏覽器擴展
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      
      // 瀏覽器內部
      /^resource:\/\//i,
      
      // 本地文件
      /^file:\/\//i,
    ],
    
    // 啟用自動會話跟踪
    autoSessionTracking: true,
    
    // 啟用錯誤邊界
    attachStacktrace: true,
    
    // 啟用源映射上傳
    _experiments: {
      // 啟用源映射上傳
      sourcemaps: {
        deleteFilesAfterUpload: true,
      },
    },
  };
}

/**
 * 安全地初始化 Sentry
 * 如果未配置 DSN，則返回 false
 */
export function safeInitSentry(callback: (options: any) => void): boolean {
  if (!isSentryConfigured()) {
    console.warn('Sentry 未配置，跳過初始化。請設置 NEXT_PUBLIC_SENTRY_DSN 環境變數。');
    return false;
  }
  
  try {
    const options = getSentryInitOptions();
    callback(options);
    console.log(`Sentry 初始化成功，環境: ${options.environment}, 版本: ${options.release}`);
    return true;
  } catch (error) {
    console.error('Sentry 初始化失敗:', error);
    return false;
  }
}
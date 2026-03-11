/**
 * 系統常數集中管理 - Phase 10.4 代碼品質提升
 * 
 * 集中管理所有硬編碼常數，提高代碼可維護性
 */

// ==================== 系統配置常數 ====================

/**
 * 分頁配置
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_PAGE: 1,
} as const;

/**
 * 快取配置
 */
export const CACHE = {
  DEFAULT_TTL: 300, // 5 分鐘
  LONG_TTL: 3600, // 1 小時
  SHORT_TTL: 60, // 1 分鐘
} as const;

/**
 * 速率限制配置
 */
export const RATE_LIMIT = {
  DEFAULT_WINDOW: 60, // 1 分鐘
  DEFAULT_MAX_REQUESTS: 100,
  STRICT_WINDOW: 300, // 5 分鐘
  STRICT_MAX_REQUESTS: 50,
} as const;

// ==================== 業務規則常數 ====================

/**
 * 供應商相關常數
 */
export const SUPPLIER = {
  MIN_TAX_ID_LENGTH: 8,
  MAX_TAX_ID_LENGTH: 10,
  LOW_BALANCE_THRESHOLD: 1000, // NT$ 1,000
  SUSPENSION_DAYS: 28, // 28 天後停權
  BILLING_RATE_MIN: 0.001, // 0.1%
  BILLING_RATE_MAX: 0.003, // 0.3%
  DEFAULT_BILLING_RATE: 0.002, // 0.2%
} as const;

/**
 * 產品相關常數
 */
export const PRODUCT = {
  MAX_NAME_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_PRICE: 0,
  MAX_PRICE: 1000000, // NT$ 1,000,000
  MAX_QUANTITY: 10000,
  MIN_QUANTITY: 1,
} as const;

/**
 * 訂單相關常數
 */
export const ORDER = {
  MAX_ITEMS: 100,
  MIN_ITEMS: 1,
  MAX_QUANTITY_PER_ITEM: 1000,
  MIN_QUANTITY_PER_ITEM: 1,
} as const;

/**
 * 發票相關常數
 */
export const INVOICE = {
  PAYMENT_DAYS: 30, // 30 天付款期限
  REMINDER_DAYS: [7, 14, 21, 28], // 提醒天數
  MAX_AMOUNT: 10000000, // NT$ 10,000,000
  MIN_AMOUNT: 1,
} as const;

// ==================== 錯誤訊息常數 ====================

/**
 * 認證錯誤訊息
 */
export const AUTH_ERRORS = {
  UNAUTHORIZED: '未授權，請先登入',
  FORBIDDEN: '權限不足',
  INVALID_TOKEN: '無效的認證令牌',
  EXPIRED_TOKEN: '認證令牌已過期',
  INVALID_CREDENTIALS: '帳號或密碼錯誤',
  ACCOUNT_DISABLED: '帳號已停用',
  ACCOUNT_LOCKED: '帳號已鎖定',
} as const;

/**
 * 驗證錯誤訊息
 */
export const VALIDATION_ERRORS = {
  REQUIRED: '此欄位為必填',
  INVALID_EMAIL: '請輸入有效的電子郵件',
  INVALID_PHONE: '請輸入有效的電話號碼',
  INVALID_TAX_ID: '請輸入有效的統一編號',
  INVALID_DATE: '請輸入有效的日期',
  INVALID_NUMBER: '請輸入有效的數字',
  INVALID_JSON: '請求體必須是有效的 JSON',
  MIN_LENGTH: '長度至少為 {min} 個字元',
  MAX_LENGTH: '長度不能超過 {max} 個字元',
  MIN_VALUE: '值不能小於 {min}',
  MAX_VALUE: '值不能大於 {max}',
  PATTERN_MISMATCH: '格式不符合要求',
} as const;

/**
 * 業務錯誤訊息
 */
export const BUSINESS_ERRORS = {
  INSUFFICIENT_BALANCE: '餘額不足',
  PRODUCT_NOT_FOUND: '產品不存在',
  SUPPLIER_NOT_FOUND: '供應商不存在',
  ORDER_NOT_FOUND: '訂單不存在',
  INVOICE_NOT_FOUND: '發票不存在',
  USER_NOT_FOUND: '用戶不存在',
  DUPLICATE_ENTRY: '資料已存在',
  INVALID_STATUS: '狀態無效',
  OPERATION_NOT_ALLOWED: '操作不被允許',
  OUT_OF_STOCK: '庫存不足',
} as const;

/**
 * 系統錯誤訊息
 */
export const SYSTEM_ERRORS = {
  INTERNAL_ERROR: '伺服器內部錯誤',
  SERVICE_UNAVAILABLE: '服務暫時不可用',
  DATABASE_ERROR: '資料庫錯誤',
  NETWORK_ERROR: '網路錯誤',
  TIMEOUT: '請求超時',
} as const;

// ==================== 狀態訊息常數 ====================

/**
 * 成功訊息
 */
export const SUCCESS_MESSAGES = {
  CREATED: '創建成功',
  UPDATED: '更新成功',
  DELETED: '刪除成功',
  SAVED: '保存成功',
  SUBMITTED: '提交成功',
  APPROVED: '核准成功',
  REJECTED: '拒絕成功',
  PAID: '付款成功',
  SENT: '發送成功',
} as const;

/**
 * 通知訊息
 */
export const NOTIFICATION_MESSAGES = {
  WELCOME: '歡迎使用 CEO 平台',
  ACCOUNT_VERIFIED: '帳號驗證成功',
  PASSWORD_CHANGED: '密碼已變更',
  ORDER_CREATED: '訂單已建立',
  ORDER_UPDATED: '訂單狀態已更新',
  PAYMENT_RECEIVED: '付款已收到',
  INVOICE_GENERATED: '發票已產生',
  REMINDER_SENT: '提醒已發送',
} as const;

// ==================== 格式常數 ====================

/**
 * 日期時間格式
 */
export const DATE_FORMATS = {
  DISPLAY_DATE: 'yyyy-MM-dd',
  DISPLAY_DATETIME: 'yyyy-MM-dd HH:mm:ss',
  DISPLAY_TIME: 'HH:mm:ss',
  API_DATE: 'yyyy-MM-dd',
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
} as const;

/**
 * 數字格式
 */
export const NUMBER_FORMATS = {
  CURRENCY: 'NT$ #,##0',
  DECIMAL: '#,##0.00',
  PERCENTAGE: '#,##0.00%',
  QUANTITY: '#,##0',
} as const;

/**
 * 正則表達式
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  TAX_ID: /^[0-9]{8,10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
} as const;

// ==================== 角色和權限常數 ====================

/**
 * 用戶角色
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SUPPLIER: 'SUPPLIER',
  WHOLESALER: 'WHOLESALER',
  USER: 'USER',
} as const;

/**
 * 供應商用戶角色
 */
export const SUPPLIER_USER_ROLES = {
  MAIN_ACCOUNT: 'MAIN_ACCOUNT',
  SUB_ACCOUNT: 'SUB_ACCOUNT',
} as const;

/**
 * 權限定義
 */
export const PERMISSIONS = {
  // 管理員權限
  MANAGE_USERS: 'manage_users',
  MANAGE_SUPPLIERS: 'manage_suppliers',
  MANAGE_ORDERS: 'manage_orders',
  MANAGE_INVOICES: 'manage_invoices',
  VIEW_REPORTS: 'view_reports',
  
  // 供應商權限
  MANAGE_PRODUCTS: 'manage_products',
  VIEW_SALES: 'view_sales',
  MANAGE_APPLICATIONS: 'manage_applications',
  VIEW_ACCOUNT: 'view_account',
  
  // 批發商權限
  PLACE_ORDERS: 'place_orders',
  VIEW_ORDERS: 'view_orders',
  MANAGE_TEMPLATES: 'manage_templates',
  VIEW_RECOMMENDATIONS: 'view_recommendations',
} as const;

// ==================== 通知相關常數 ====================

/**
 * 通知類型
 */
export const NOTIFICATION_TYPES = {
  SUPPLIER_APPLICATION: 'SUPPLIER_APPLICATION',
  ORDER_STATUS: 'ORDER_STATUS',
  PAYMENT_REMINDER: 'PAYMENT_REMINDER',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  PROMOTIONAL: 'PROMOTIONAL',
} as const;

/**
 * 通知通道
 */
export const NOTIFICATION_CHANNELS = {
  WEBSOCKET: 'WEBSOCKET',
  EMAIL: 'EMAIL',
  PUSH: 'PUSH',
  SMS: 'SMS',
  IN_APP: 'IN_APP',
} as const;

/**
 * 通知狀態
 */
export const NOTIFICATION_STATUS = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED',
} as const;

// ==================== 審計日誌常數 ====================

/**
 * 審計操作類型
 */
export const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  PAY: 'PAY',
  VERIFY: 'VERIFY',
  SUSPEND: 'SUSPEND',
  ACTIVATE: 'ACTIVATE',
} as const;

/**
 * 審計資源類型
 */
export const AUDIT_RESOURCES = {
  USER: 'USER',
  SUPPLIER: 'SUPPLIER',
  PRODUCT: 'PRODUCT',
  ORDER: 'ORDER',
  INVOICE: 'INVOICE',
  APPLICATION: 'APPLICATION',
  TRANSACTION: 'TRANSACTION',
  SETTING: 'SETTING',
} as const;

// ==================== 環境相關常數 ====================

/**
 * 環境變數名稱
 */
export const ENV_VARS = {
  // 資料庫
  DATABASE_URL: 'DATABASE_URL',
  DATABASE_TEST_URL: 'DATABASE_TEST_URL',
  
  // 認證
  NEXTAUTH_SECRET: 'NEXTAUTH_SECRET',
  NEXTAUTH_URL: 'NEXTAUTH_URL',
  
  // 第三方服務
  RESEND_API_KEY: 'RESEND_API_KEY',
  TWILIO_ACCOUNT_SID: 'TWILIO_ACCOUNT_SID',
  TWILIO_AUTH_TOKEN: 'TWILIO_AUTH_TOKEN',
  TWILIO_PHONE_NUMBER: 'TWILIO_PHONE_NUMBER',
  
  // Redis
  REDIS_URL: 'REDIS_URL',
  
  // Cron
  CRON_SECRET: 'CRON_SECRET',
  
  // 其他
  APP_URL: 'APP_URL',
  NODE_ENV: 'NODE_ENV',
} as const;

/**
 * 環境類型
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const;

// ==================== 輔助函數 ====================

/**
 * 獲取帶參數的錯誤訊息
 */
export function getErrorMessage(
  template: string,
  params: Record<string, string | number> = {}
): string {
  return Object.entries(params).reduce(
    (msg, [key, value]) => msg.replace(`{${key}}`, String(value)),
    template
  );
}

/**
 * 檢查環境
 */
export function isEnvironment(env: keyof typeof ENVIRONMENTS): boolean {
  return process.env.NODE_ENV === ENVIRONMENTS[env];
}

/**
 * 獲取環境變數或使用預設值
 */
export function getEnvVar(
  key: keyof typeof ENV_VARS,
  defaultValue?: string
): string {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`環境變數 ${key} 未設置`);
  }
  return value || defaultValue!;
}

// ==================== 導出類型 ====================

/**
 * 常數類型導出
 */
export type PaginationConfig = typeof PAGINATION;
export type SupplierConfig = typeof SUPPLIER;
export type ProductConfig = typeof PRODUCT;
export type OrderConfig = typeof ORDER;
export type InvoiceConfig = typeof INVOICE;
export type AuthErrors = typeof AUTH_ERRORS;
export type ValidationErrors = typeof VALIDATION_ERRORS;
export type BusinessErrors = typeof BUSINESS_ERRORS;
export type SystemErrors = typeof SYSTEM_ERRORS;
export type SuccessMessages = typeof SUCCESS_MESSAGES;
export type NotificationMessages = typeof NOTIFICATION_MESSAGES;
export type DateFormats = typeof DATE_FORMATS;
export type NumberFormats = typeof NUMBER_FORMATS;
export type RegexPatterns = typeof REGEX_PATTERNS;
export type UserRoles = typeof USER_ROLES;
export type SupplierUserRoles = typeof SUPPLIER_USER_ROLES;
export type Permissions = typeof PERMISSIONS;
export type NotificationTypes = typeof NOTIFICATION_TYPES;
export type NotificationChannels = typeof NOTIFICATION_CHANNELS;
export type NotificationStatus = typeof NOTIFICATION_STATUS;
export type AuditActions = typeof AUDIT_ACTIONS;
export type AuditResources = typeof AUDIT_RESOURCES;
export type EnvVars = typeof ENV_VARS;
export type Environments = typeof ENVIRONMENTS;
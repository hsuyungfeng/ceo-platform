import { logger } from '@/lib/logger'

/**
 * 審計日誌類型
 */
export type AuditAction =
  // Cron 任務
  | 'CRON_MONTHLY_FEE'
  | 'CRON_CHECK_BALANCE'
  | 'CRON_CHECK_OVERDUE'
  | 'CRON_PAYMENT_REMINDER'
  
  // 供應商操作
  | 'SUPPLIER_VERIFY'
  | 'SUPPLIER_SUSPEND'
  | 'SUPPLIER_APPLICATION_APPROVE'
  | 'SUPPLIER_APPLICATION_REJECT'
  | 'SUPPLIER_REGISTER'
  | 'SUPPLIER_UPDATE'
  | 'SUPPLIER_DELETE'
  
  // 發票操作
  | 'INVOICE_CREATE'
  | 'INVOICE_PAY'
  | 'INVOICE_UPDATE'
  | 'INVOICE_DELETE'
  
  // 管理員操作
  | 'ADMIN_BROADCAST'
  | 'ADMIN_USER_MANAGE'
  | 'ADMIN_SETTINGS_UPDATE'
  
  // 用戶操作
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'USER_PASSWORD_CHANGE'
  | 'USER_PROFILE_UPDATE'
  
  // 訂單操作
  | 'ORDER_CREATE'
  | 'ORDER_UPDATE'
  | 'ORDER_CANCEL'
  | 'ORDER_DELETE'
  
  // 產品操作
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  
  // 支付操作
  | 'PAYMENT_PROCESS'
  | 'PAYMENT_REFUND'
  | 'PAYMENT_FAILED'
  
  // 安全事件
  | 'SECURITY_LOGIN_FAILED'
  | 'SECURITY_CSRF_FAILED'
  | 'SECURITY_RATE_LIMIT'
  | 'SECURITY_UNAUTHORIZED_ACCESS'
  
  // 系統事件
  | 'SYSTEM_STARTUP'
  | 'SYSTEM_SHUTDOWN'
  | 'SYSTEM_ERROR'
  | 'SYSTEM_CONFIG_CHANGE'

interface AuditEntry {
  action: AuditAction
  actor: string
  target?: string
  details?: Record<string, unknown>
  timestamp: string
  ip?: string | null
}

/**
 * 審計日誌服務
 * 記錄所有敏感操作，用於安全審計和問題追蹤
 *
 * 目前使用結構化日誌輸出，未來可擴展至資料庫或外部服務
 */
class AuditLogger {
  log(entry: Omit<AuditEntry, 'timestamp'>): void {
    const auditEntry: AuditEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    }

    logger.info(
      { audit: auditEntry },
      `[AUDIT] ${entry.action} by ${entry.actor}${entry.target ? ` on ${entry.target}` : ''}`
    )
  }

  cronAction(action: AuditAction, details: Record<string, unknown>): void {
    this.log({
      action,
      actor: 'SYSTEM_CRON',
      details,
    })
  }

  adminAction(action: AuditAction, actor: string, target?: string, details?: Record<string, unknown>): void {
    this.log({
      action,
      actor,
      target,
      details,
    })
  }

  supplierAction(action: AuditAction, actor: string, target?: string, details?: Record<string, unknown>): void {
    this.log({
      action,
      actor,
      target,
      details,
    })
  }

  userAction(action: AuditAction, actor: string, target?: string, details?: Record<string, unknown>): void {
    this.log({
      action,
      actor,
      target,
      details,
    })
  }

  securityAction(action: AuditAction, actor: string, target?: string, details?: Record<string, unknown>): void {
    this.log({
      action,
      actor,
      target,
      details,
    })
  }

  systemAction(action: AuditAction, details: Record<string, unknown>): void {
    this.log({
      action,
      actor: 'SYSTEM',
      details,
    })
  }

  /**
   * 記錄登入事件
   */
  login(userId: string, success: boolean, ip?: string, details?: Record<string, unknown>): void {
    this.log({
      action: success ? 'USER_LOGIN' : 'SECURITY_LOGIN_FAILED',
      actor: userId,
      details: {
        success,
        ip,
        ...details,
      },
    })
  }

  /**
   * 記錄 CSRF 驗證失敗
   */
  csrfFailure(sessionId: string, path: string, ip?: string): void {
    this.securityAction('SECURITY_CSRF_FAILED', sessionId, path, {
      ip,
      path,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * 記錄速率限制事件
   */
  rateLimit(ip: string, path: string, limit: number): void {
    this.securityAction('SECURITY_RATE_LIMIT', ip, path, {
      ip,
      path,
      limit,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * 記錄未授權訪問
   */
  unauthorizedAccess(userId: string, path: string, ip?: string): void {
    this.securityAction('SECURITY_UNAUTHORIZED_ACCESS', userId, path, {
      ip,
      path,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * 記錄系統啟動
   */
  systemStartup(version: string, environment: string): void {
    this.systemAction('SYSTEM_STARTUP', {
      version,
      environment,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * 記錄系統錯誤
   */
  systemError(error: Error, context?: Record<string, unknown>): void {
    this.systemAction('SYSTEM_ERROR', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    })
  }
}

export const auditLogger = new AuditLogger()
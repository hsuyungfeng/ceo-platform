/**
 * 配置檢查器
 * 在應用程式啟動時檢查必要的環境變數和配置
 */

import { logger } from '@/lib/logger'
import { auditLogger } from '@/lib/audit-logger'

/**
 * 必要的環境變數清單
 */
const REQUIRED_ENV_VARS = {
  // 資料庫配置
  DATABASE_URL: 'PostgreSQL 資料庫連接字串',
  
  // 認證配置
  NEXTAUTH_SECRET: 'NextAuth 加密密鑰',
  NEXTAUTH_URL: 'NextAuth 應用程式 URL',
  
  // Cron 任務配置
  CRON_SECRET: 'Cron 任務授權密鑰',
  
  // 電子郵件配置
  RESEND_API_KEY: 'Resend 電子郵件服務 API 金鑰',
  
  // WebSocket 配置
  WEBSOCKET_PORT: 'WebSocket 伺服器端口',
  
  // Push 通知配置
  VAPID_PUBLIC_KEY: 'Web Push VAPID 公鑰',
  VAPID_PRIVATE_KEY: 'Web Push VAPID 私鑰',
  
  // 安全配置
  CSRF_SECRET: 'CSRF 保護密鑰',
  JWT_SECRET: 'JWT 簽名密鑰',
}

/**
 * 開發環境可選的環境變數
 */
const OPTIONAL_DEV_ENV_VARS = [
  'RESEND_API_KEY',
  'VAPID_PUBLIC_KEY', 
  'VAPID_PRIVATE_KEY',
  'WEBSOCKET_PORT',
]

/**
 * 檢查環境變數是否設定
 */
export function checkRequiredEnvVars(): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  const warnings: string[] = []
  
  for (const [envVar, description] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[envVar]
    
    // 在開發環境中，某些變數是可選的
    const isOptionalInDev = process.env.NODE_ENV === 'development' && 
                           OPTIONAL_DEV_ENV_VARS.includes(envVar)
    
    if (!value || value.trim() === '') {
      if (isOptionalInDev) {
        warnings.push(`${envVar} (${description}) - 在開發環境中可選`)
        logger.warn(`環境變數缺失（開發環境可選）: ${envVar} - ${description}`)
      } else {
        missing.push(`${envVar} (${description})`)
        logger.error(`環境變數缺失: ${envVar} - ${description}`)
      }
    } else if (envVar.includes('SECRET') || envVar.includes('KEY')) {
      // 檢查密鑰強度
      if (value.length < 32) {
        const warning = `${envVar} 長度過短 (${value.length} 字元)，建議至少 32 字元`
        warnings.push(warning)
        logger.warn(`安全警告: ${warning}`)
      }
      
      // 檢查是否為默認值
      const weakPatterns = [
        'changeme',
        'secret',
        'password',
        '123456',
        'admin',
        'test',
        'default',
      ]
      
      if (weakPatterns.some(pattern => value.toLowerCase().includes(pattern))) {
        const warning = `${envVar} 可能使用弱密鑰`
        warnings.push(warning)
        logger.warn(`安全警告: ${warning}`)
      }
    }
  }
  
  // 在開發環境中，只檢查生產必需的變數
  const productionRequiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
  const missingProductionVars = missing.filter(m => 
    productionRequiredVars.some(required => m.includes(required))
  )
  
  if (process.env.NODE_ENV === 'production') {
    if (missing.length > 0) {
      logger.error(`缺少 ${missing.length} 個必要的環境變數:`, missing)
      return { valid: false, missing }
    }
  } else {
    // 開發環境：只檢查生產必需的變數
    if (missingProductionVars.length > 0) {
      logger.warn(`缺少 ${missingProductionVars.length} 個生產必需的環境變數:`, missingProductionVars)
      // 在開發環境中，不返回 false，只記錄警告
    }
    
    if (missing.length > 0) {
      logger.warn(`缺少 ${missing.length} 個環境變數（開發環境可接受）:`, missing)
    }
  }
  
  if (warnings.length > 0) {
    logger.warn(`環境變數檢查發現 ${warnings.length} 個警告:`, warnings)
  } else {
    logger.info('所有必要的環境變數檢查通過')
  }
  
  return { valid: true, missing: [] }
}

/**
 * 檢查 Cron 配置
 */
export function checkCronConfig(): boolean {
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || cronSecret.trim() === '') {
    logger.error('CRON_SECRET 未設定，Cron 任務將無法正常運作')
    return false
  }
  
  // 檢查 Cron 密鑰強度
  if (cronSecret.length < 32) {
    logger.warn(`CRON_SECRET 長度過短 (${cronSecret.length} 字元)，建議至少 32 字元`)
  }
  
  // 檢查是否為默認值
  const weakCronSecrets = ['changeme', 'secret', 'cron', 'password', '123456']
  if (weakCronSecrets.some(weak => cronSecret.toLowerCase().includes(weak))) {
    logger.warn('CRON_SECRET 可能使用弱密鑰，建議更換為強隨機密鑰')
  }
  
  logger.info('Cron 配置檢查通過')
  return true
}

/**
 * 檢查安全配置
 */
export function checkSecurityConfig(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []
  
  // 檢查 NEXTAUTH_SECRET
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  if (nextAuthSecret && nextAuthSecret.length < 32) {
    warnings.push(`NEXTAUTH_SECRET 長度過短 (${nextAuthSecret.length} 字元)，建議至少 32 字元`)
  }
  
  // 檢查 JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET
  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push(`JWT_SECRET 長度過短 (${jwtSecret.length} 字元)，建議至少 32 字元`)
  }
  
  // 檢查 CSRF_SECRET
  const csrfSecret = process.env.CSRF_SECRET
  if (csrfSecret && csrfSecret.length < 32) {
    warnings.push(`CSRF_SECRET 長度過短 (${csrfSecret.length} 字元)，建議至少 32 字元`)
  }
  
  // 檢查是否在生產環境中使用默認值
  if (process.env.NODE_ENV === 'production') {
    const defaultPatterns = ['changeme', 'secret', 'password', '123456']
    
    const secretsToCheck = [
      { name: 'NEXTAUTH_SECRET', value: nextAuthSecret },
      { name: 'JWT_SECRET', value: jwtSecret },
      { name: 'CSRF_SECRET', value: csrfSecret },
      { name: 'CRON_SECRET', value: process.env.CRON_SECRET },
    ]
    
    for (const secret of secretsToCheck) {
      if (secret.value && defaultPatterns.some(pattern => 
        secret.value!.toLowerCase().includes(pattern)
      )) {
        warnings.push(`生產環境警告: ${secret.name} 可能使用默認或弱密鑰`)
      }
    }
  }
  
  if (warnings.length > 0) {
    logger.warn(`安全配置檢查發現 ${warnings.length} 個警告:`, warnings)
    return { valid: true, warnings } // 警告但不阻止啟動
  }
  
  logger.info('安全配置檢查通過')
  return { valid: true, warnings: [] }
}

/**
 * 執行所有配置檢查
 */
export function runAllConfigChecks(): { 
  envVarsValid: boolean 
  cronConfigValid: boolean
  securityConfigValid: boolean
  missingEnvVars: string[]
  securityWarnings: string[]
} {
  logger.info('開始執行配置檢查...')
  
  const envCheck = checkRequiredEnvVars()
  const cronCheck = checkCronConfig()
  const securityCheck = checkSecurityConfig()
  
  const allValid = envCheck.valid && cronCheck && securityCheck.valid
  
  if (!allValid) {
    logger.error('配置檢查失敗，應用程式可能無法正常運作')
  } else {
    logger.info('所有配置檢查通過，應用程式可以正常啟動')
  }
  
  return {
    envVarsValid: envCheck.valid,
    cronConfigValid: cronCheck,
    securityConfigValid: securityCheck.valid,
    missingEnvVars: envCheck.missing,
    securityWarnings: securityCheck.warnings,
  }
}

/**
 * 在應用程式啟動時自動執行配置檢查
 * 此函數應在應用程式入口點調用
 */
export function initializeConfigChecks(): void {
  if (process.env.NODE_ENV === 'test') {
    logger.info('測試環境跳過配置檢查')
    return
  }
  
  // 記錄系統啟動
  auditLogger.systemStartup(
    process.env.npm_package_version || 'unknown',
    process.env.NODE_ENV || 'development'
  )
  
  const checks = runAllConfigChecks()
  
  // 在開發環境中，如果缺少環境變數，只記錄警告而不拋出錯誤
  if (!checks.envVarsValid) {
    const errorMessage = `缺少必要的環境變數: ${checks.missingEnvVars.join(', ')}`
    
    if (process.env.NODE_ENV === 'production') {
      const error = new Error(errorMessage)
      auditLogger.systemError(error, { missingEnvVars: checks.missingEnvVars })
      throw error
    } else {
      logger.warn(`開發環境警告: ${errorMessage}`)
      // 在開發環境中，不記錄審計日誌，只記錄警告
    }
  }
  
  if (!checks.cronConfigValid) {
    logger.warn('Cron 配置檢查失敗，Cron 任務可能無法正常運作')
    auditLogger.systemError(new Error('Cron 配置檢查失敗'), {
      cronConfigValid: false,
    })
  }
  
  if (checks.securityWarnings.length > 0) {
    logger.warn('安全配置警告，建議修復:')
    checks.securityWarnings.forEach(warning => logger.warn(`  - ${warning}`))
    
    auditLogger.systemError(new Error('安全配置警告'), {
      warnings: checks.securityWarnings,
    })
  }
  
  logger.info('配置檢查完成，應用程式可以正常啟動')
}
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * Cron 任務授權驗證
 * 驗證 CRON_SECRET 環境變數和請求的 Bearer Token
 *
 * 安全規則：
 * 1. CRON_SECRET 必須設定且非空
 * 2. 請求必須攜帶正確的 Bearer Token
 */
export function verifyCronAuth(request: NextRequest): { authorized: boolean; response?: NextResponse } {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || cronSecret.trim() === '') {
    logger.error('CRON_SECRET 環境變數未設定或為空，拒絕 Cron 請求')
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Cron 服務配置錯誤：缺少 CRON_SECRET' },
        { status: 500 }
      ),
    }
  }

  const authHeader = request.headers.get('authorization')

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    logger.warn({ ip: request.headers.get('x-forwarded-for') }, '未授權的 Cron 請求')
    return {
      authorized: false,
      response: NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      ),
    }
  }

  return { authorized: true }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCronAuth } from '@/lib/cron-auth'
import { auditLogger } from '@/lib/audit-logger'
import { PrismaCursorPagination, BatchProcessor } from '@/lib/cursor-pagination'

// 低餘額閾值（新台幣）
const LOW_BALANCE_THRESHOLD = 1000 // NT$1,000

export async function POST(request: NextRequest) {
  try {
    const { authorized, response } = verifyCronAuth(request)
    if (!authorized) return response!

    const body = await request.json()
    const { supplierId } = body

    // 如果提供 supplierId，只檢查該供應商；否則檢查所有供應商
    if (supplierId) {
      return await checkSingleSupplier(supplierId)
    } else {
      return await checkAllSuppliers()
    }
  } catch (error) {
    console.error('檢查餘額錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

// 檢查單個供應商
async function checkSingleSupplier(supplierId: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      account: true,
    },
  })

  if (!supplier || !supplier.account) {
    return NextResponse.json({ error: '供應商帳號不存在' }, { status: 404 })
  }

  const account = supplier.account
  const balance = Number(account.balance)

  // 檢查是否餘額為0或負數（停權）
  if (balance <= 0) {
    await prisma.supplierAccount.update({
      where: { id: account.id },
      data: { isSuspended: true },
    })

    await prisma.supplier.update({
      where: { id: supplierId },
      data: { status: 'SUSPENDED' },
    })

    return NextResponse.json({
      success: true,
      message: '餘額不足，供應商已停權',
      action: 'SUSPENDED',
    })
  }

  // 檢查低餘額警告
  if (balance < LOW_BALANCE_THRESHOLD) {
    // 檢查是否已有最近的低餘額提醒（7天內）
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentReminder = await prisma.paymentReminder.findFirst({
      where: {
        supplierId,
        type: 'LOW_BALANCE',
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    })

    if (!recentReminder) {
      // 創建低餘額提醒記錄
      await prisma.paymentReminder.create({
        data: {
          supplierId,
          type: 'LOW_BALANCE',
          balance: account.balance,
          dueAmount: 0,
          daysOverdue: 0,
          isSent: true,
          sentAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: `餘額低於 NT$${LOW_BALANCE_THRESHOLD}，已發送提醒`,
        balance,
        threshold: LOW_BALANCE_THRESHOLD,
        action: 'LOW_BALANCE_WARNING',
      })
    }
  }

  return NextResponse.json({
    success: true,
    message: '餘額充足',
    balance,
  })
}

// 檢查所有供應商
async function checkAllSuppliers() {
  const results = {
    checked: 0,
    lowBalance: 0,
    suspended: 0,
    warningsSent: 0,
    details: [] as Array<{
      supplierId: string
      companyName: string
      balance: number
      action: string
    }>,
  }

  const batchProcessor = new BatchProcessor<any>()

    // 使用游標分頁處理供應商，批次大小 100
    const processingResult = await PrismaCursorPagination.processSuppliers(
      prisma,
      {
        status: { in: ['ACTIVE', 'PENDING'] }, // 只檢查活躍或待審核的供應商
      },
      async (suppliers) => {
        // 批次獲取所有供應商 ID
        const supplierIds = suppliers.map(supplier => supplier.id).filter(Boolean)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        // 批量查詢哪些供應商已有最近的低餘額提醒（避免 N+1）
        const recentReminders = await prisma.paymentReminder.findMany({
          where: {
            supplierId: { in: supplierIds },
            type: 'LOW_BALANCE',
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
          select: {
            supplierId: true,
          },
          distinct: ['supplierId'],
        })
        
        const suppliersWithRecentReminder = new Set(
          recentReminders.map(reminder => reminder.supplierId)
        )

        // 批次處理供應商
        await batchProcessor.processItems(suppliers, async (supplier) => {
          if (!supplier.account) return

          const account = supplier.account
          const balance = Number(account.balance)

          // 檢查是否餘額為0或負數
          if (balance <= 0) {
            await prisma.$transaction([
              prisma.supplierAccount.update({
                where: { id: account.id },
                data: { isSuspended: true },
              }),
              prisma.supplier.update({
                where: { id: supplier.id },
                data: { status: 'SUSPENDED' },
              }),
            ])

            results.suspended++
            results.details.push({
              supplierId: supplier.id,
              companyName: supplier.companyName,
              balance,
              action: 'SUSPENDED',
            })
            return
          }

          // 檢查低餘額警告
          if (balance < LOW_BALANCE_THRESHOLD) {
            // 檢查是否已有最近的低餘額提醒（使用批量查詢結果）
            if (suppliersWithRecentReminder.has(supplier.id)) {

              results.details.push({
                supplierId: supplier.id,
                companyName: supplier.companyName,
                balance,
                action: 'REMINDER_ALREADY_SENT',
              })
            } else {
              // 創建低餘額提醒記錄
              await prisma.paymentReminder.create({
                data: {
                  supplierId: supplier.id,
                  type: 'LOW_BALANCE',
                  balance: account.balance,
                  dueAmount: 0,
                  daysOverdue: 0,
                  isSent: true,
                  sentAt: new Date(),
                },
              })

              results.warningsSent++
              results.details.push({
                supplierId: supplier.id,
                companyName: supplier.companyName,
                balance,
                action: 'LOW_BALANCE_WARNING',
              })
            }

          results.lowBalance++
        } else {
          results.details.push({
            supplierId: supplier.id,
            companyName: supplier.companyName,
            balance,
            action: 'SUFFICIENT_BALANCE',
          })
        }

        results.checked++
      }, {
        continueOnError: true,
        maxErrors: 50,
      })
    },
    {
      batchSize: 100,
      include: {
        account: true,
      },
      onProgress: (processed, totalBatches, currentBatch) => {
        console.log(`餘額檢查進度：已處理 ${processed} 個供應商，第 ${currentBatch}/${totalBatches} 批次`)
      },
    }
  )

  const batchStats = batchProcessor.getStats()
  results.checked = batchStats.totalProcessed

  auditLogger.cronAction('CRON_CHECK_BALANCE', {
    checked: results.checked,
    lowBalance: results.lowBalance,
    suspended: results.suspended,
    warningsSent: results.warningsSent,
    batchStats: {
      totalProcessed: processingResult.totalProcessed,
      totalBatches: processingResult.totalBatches,
      success: processingResult.success,
      itemStats: {
        successCount: batchStats.successCount,
        errorCount: batchStats.errorCount,
        totalProcessed: batchStats.totalProcessed,
      },
    },
  })

  return NextResponse.json({
    success: true,
    message: `檢查完成：${results.checked} 個供應商，${results.lowBalance} 個低餘額，${results.suspended} 個已停權，${results.warningsSent} 個警告已發送（批次處理：${processingResult.totalBatches} 批次）`,
    ...results,
    batchStats: {
      totalProcessed: processingResult.totalProcessed,
      totalBatches: processingResult.totalBatches,
      success: processingResult.success,
      itemStats: {
        successCount: batchStats.successCount,
        errorCount: batchStats.errorCount,
        totalProcessed: batchStats.totalProcessed,
      },
      errors: batchStats.errors.length > 0 ? batchStats.errors.slice(0, 10) : undefined,
    },
  })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Use POST method' }, { status: 405 })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { verifyCronAuth } from '@/lib/cron-auth'
import { auditLogger } from '@/lib/audit-logger'
import { PrismaCursorPagination, BatchProcessor } from '@/lib/cursor-pagination'

function getPreviousMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  return { start, end }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, response } = verifyCronAuth(request)
    if (!authorized) return response!

    const { start, end } = getPreviousMonthRange()
    const results: Array<{
      supplierId: string
      companyName: string
      feeAmount: number
      status: 'SUSPENDED' | 'DEDUCTED'
      reason?: string
    }> = []
    const batchProcessor = new BatchProcessor<any>()

    // 使用游標分頁處理供應商，批次大小 100
    const processingResult = await PrismaCursorPagination.processSuppliers(
      prisma,
      {
        status: 'ACTIVE',
      },
      async (suppliers) => {
        // 批次處理供應商
        await batchProcessor.processItems(suppliers, async (supplier) => {
          if (!supplier.account) return

      // 獲取該供應商上個月的存款交易總額（使用聚合查詢避免 N+1）
      const depositResult = await prisma.supplierTransaction.aggregate({
        where: {
          supplierId: supplier.id,
          type: 'DEPOSIT',
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        _sum: {
          amount: true,
        },
      })

      const totalSales = depositResult._sum.amount ? Number(depositResult._sum.amount) : 0

          if (totalSales <= 0) return

          const billingRate = Number(supplier.account.billingRate)
          const feeAmount = Math.round(totalSales * billingRate)

          if (feeAmount <= 0) return

          const currentBalance = Number(supplier.account.balance)

          if (currentBalance < feeAmount) {
            // 餘額不足，停權處理
            await prisma.$transaction([
              prisma.supplierAccount.update({
                where: { id: supplier.account.id },
                data: {
                  balance: new Prisma.Decimal(0),
                  isSuspended: true,
                },
              }),
              prisma.supplier.update({
                where: { id: supplier.id },
                data: { status: 'SUSPENDED' },
              }),
            ])

            const invoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

            const invoice = await prisma.supplierInvoice.create({
              data: {
                invoiceNo,
                supplierId: supplier.id,
                type: 'MONTHLY_FEE',
                amount: new Prisma.Decimal(feeAmount),
                totalAmount: new Prisma.Decimal(feeAmount),
                status: 'OVERDUE',
                dueDate: new Date(),
                note: `餘額不足扣款，供應商已停權`,
              },
            })

            await prisma.supplierTransaction.create({
              data: {
                supplierId: supplier.id,
                type: 'MONTHLY_CHARGE',
                amount: new Prisma.Decimal(-feeAmount),
                balanceBefore: new Prisma.Decimal(currentBalance),
                balanceAfter: new Prisma.Decimal(0),
                invoiceId: invoice.id,
                note: `扣除月費（餘額不足）`,
              },
            })

            results.push({
              supplierId: supplier.id,
              companyName: supplier.companyName,
              feeAmount,
              status: 'SUSPENDED',
              reason: '餘額不足',
            })
          } else {
            // 餘額充足，正常扣款
            const newBalance = currentBalance - feeAmount

            await prisma.$transaction([
              prisma.supplierAccount.update({
                where: { id: supplier.account.id },
                data: {
                  balance: new Prisma.Decimal(newBalance),
                  totalSpent: {
                    increment: feeAmount,
                  },
                },
              }),
            ])

            const invoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

            const invoice = await prisma.supplierInvoice.create({
              data: {
                invoiceNo,
                supplierId: supplier.id,
                type: 'MONTHLY_FEE',
                amount: new Prisma.Decimal(feeAmount),
                totalAmount: new Prisma.Decimal(feeAmount),
                status: 'PAID',
                paidAt: new Date(),
                dueDate: new Date(),
                note: `月費扣款`,
              },
            })

            await prisma.supplierTransaction.create({
              data: {
                supplierId: supplier.id,
                type: 'MONTHLY_CHARGE',
                amount: new Prisma.Decimal(-feeAmount),
                balanceBefore: new Prisma.Decimal(currentBalance),
                balanceAfter: new Prisma.Decimal(newBalance),
                invoiceId: invoice.id,
                note: `扣除月費`,
              },
            })

            results.push({
              supplierId: supplier.id,
              companyName: supplier.companyName,
              feeAmount,
              status: 'DEDUCTED',
            })
          }
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
          console.log(`月費扣款進度：已處理 ${processed} 個供應商，第 ${currentBatch}/${totalBatches} 批次`)
        },
      }
    )

    const batchStats = batchProcessor.getStats()

    auditLogger.cronAction('CRON_MONTHLY_FEE', {
      processedCount: results.length,
      suspendedCount: results.filter(r => r.status === 'SUSPENDED').length,
      deductedCount: results.filter(r => r.status === 'DEDUCTED').length,
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
      message: `處理了 ${results.length} 個供應商的月費（批次處理：${processingResult.totalBatches} 批次，${processingResult.totalProcessed} 個供應商）`,
      results,
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
  } catch (error) {
    console.error('月費扣款錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Use POST method' }, { status: 405 })
}
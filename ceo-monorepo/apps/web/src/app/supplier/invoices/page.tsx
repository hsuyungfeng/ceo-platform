'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Invoice {
  id: string
  invoiceNo: string
  type: string
  amount: number
  tax: number
  totalAmount: number
  billingMonth: string | null
  status: string
  dueDate: string
  paidAt: string | null
  createdAt: string
}

export default function SupplierInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {
    try {
      const res = await fetch('/api/supplier-invoices')
      const data = await res.json()
      if (data.success) {
        setInvoices(data.data)
      } else {
        setError(data.error || '載入失敗')
      }
    } catch {
      setError('載入失敗')
    } finally {
      setLoading(false)
    }
  }

  async function handlePay(invoiceId: string) {
    try {
      const res = await fetch(`/api/supplier-invoices/${invoiceId}/pay`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success('繳納成功')
        fetchInvoices()
      } else {
        toast.error(data.error || '繳納失敗')
      }
    } catch {
      toast.error('繳納失敗')
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'PAID':
        return <Badge variant="default">已繳納</Badge>
      case 'UNPAID':
        return <Badge variant="secondary">待繳納</Badge>
      case 'OVERDUE':
        return <Badge variant="destructive">逾期</Badge>
      case 'CANCELLED':
        return <Badge variant="outline">已取消</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'MONTHLY_FEE':
        return '月租費'
      case 'PRODUCT_FEE':
        return '上架費'
      case 'TRANSACTION_FEE':
        return '交易手續費'
      case 'SERVICE_FEE':
        return '服務費'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">載入中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">供應商帳單</h1>
          <p className="text-gray-500 mt-1">查看並繳納帳單</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">目前沒有帳單</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{invoice.invoiceNo}</h3>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {getTypeLabel(invoice.type)}
                        {invoice.billingMonth && ` - ${invoice.billingMonth}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">NT$ {Number(invoice.totalAmount).toLocaleString()}</p>
                      {invoice.status === 'UNPAID' && (
                        <p className="text-sm text-gray-500">
                          截止日：{new Date(invoice.dueDate).toLocaleDateString('zh-TW')}
                        </p>
                      )}
                    </div>
                  </div>
                  {invoice.status === 'UNPAID' && (
                    <div className="mt-4 pt-4 border-t flex justify-end">
                      <Button onClick={() => handlePay(invoice.id)}>
                        立即繳納
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

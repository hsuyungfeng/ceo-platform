'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Invoice {
  id: string
  invoiceNo: string
  billingMonth: string
  totalAmount: string
  status: string
  user: { name: string; email: string }
}

export function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [billingMonth, setBillingMonth] = useState(getCurrentMonth())
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [billingMonth])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/invoices?billingMonth=${billingMonth}`
      )
      if (!response.ok) throw new Error('Failed to fetch invoices')
      const result = await response.json()
      setInvoices(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const response = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingMonth })
      })
      if (!response.ok) throw new Error('Failed to generate invoices')
      await fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setGenerating(false)
    }
  }

  const handleSendAll = async () => {
    try {
      setSending(true)
      const response = await fetch('/api/admin/invoices/send-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingMonth })
      })
      if (!response.ok) throw new Error('Failed to send invoices')
      await fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSending(false)
    }
  }

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/mark-paid`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to mark paid')
      await fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  function getCurrentMonth() {
    const now = new Date()
    return now.toISOString().slice(0, 7)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD'
    }).format(amount)
  }

  const draftCount = invoices.filter(inv => inv.status === 'DRAFT').length

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>月結帳單管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="month"
              value={billingMonth}
              onChange={e => setBillingMonth(e.target.value)}
              className="w-32"
            />
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? '生成中...' : '生成本月帳單'}
            </Button>
            {draftCount > 0 && (
              <Button
                onClick={handleSendAll}
                disabled={sending}
                variant="secondary"
              >
                {sending ? '發送中...' : `發送 ${draftCount} 張帳單`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {billingMonth} 年月結帳單 ({invoices.length} 張)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>載入中...</div>
          ) : invoices.length === 0 ? (
            <p className="text-gray-500">無帳單</p>
          ) : (
            <div className="space-y-4">
              {invoices.map(invoice => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{invoice.invoiceNo}</h3>
                    <p className="text-sm text-gray-600">
                      {invoice.user.name} ({invoice.user.email})
                    </p>
                  </div>
                  <div className="text-right mr-6">
                    <p className="font-semibold">
                      {formatCurrency(parseFloat(invoice.totalAmount))}
                    </p>
                    <Badge className="mt-2">{invoice.status}</Badge>
                  </div>
                  {invoice.status !== 'PAID' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkPaid(invoice.id)}
                    >
                      標記已支付
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface AccountInfo {
  id: string
  balance: number
  billingRate: number
  totalSpent: number
  isSuspended: boolean
  isLowBalance: boolean
}

interface Transaction {
  id: string
  type: string
  amount: number
  balanceAfter: number
  note: string | null
  createdAt: string
}

export default function SupplierAccountPage() {
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchAccount()
    fetchTransactions()
  }, [])

  async function fetchAccount() {
    try {
      const res = await fetch('/api/supplier/account')
      const data = await res.json()
      if (data.success) {
        setAccount(data.data)
      }
    } catch {
      setError('載入帳戶失敗')
    }
  }

  async function fetchTransactions() {
    try {
      const res = await fetch('/api/supplier/transactions')
      const data = await res.json()
      if (data.success) {
        setTransactions(data.data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!depositAmount || parseInt(depositAmount) <= 0) {
      alert('請輸入有效金額')
      return
    }

    setProcessing(true)
    try {
      const res = await fetch('/api/supplier/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert('儲值成功')
        setDepositAmount('')
        fetchAccount()
        fetchTransactions()
      } else {
        alert(data.error || '儲值失敗')
      }
    } catch {
      alert('儲值失敗')
    } finally {
      setProcessing(false)
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

  if (error && !account) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">{error}</p>
              <Link href="/suppliers/register">
                <Button>註冊供應商</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">帳戶管理</h1>
          <p className="text-gray-500">管理您的供應商帳戶餘額與交易記錄</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>帳戶資訊</CardTitle>
            </CardHeader>
            <CardContent>
              {account && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">目前餘額</span>
                    <span className="text-3xl font-bold">
                      NT$ {account.balance?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">累計繳費</span>
                    <span className="font-medium">
                      NT$ {account.totalSpent?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">收費率</span>
                    <span className="font-medium">
                      {(Number(account.billingRate || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">狀態</span>
                    <div className="flex gap-2">
                      {account.isSuspended && (
                        <Badge variant="destructive">已停權</Badge>
                      )}
                      {account.isLowBalance && (
                        <Badge variant="outline">餘額不足</Badge>
                      )}
                      {!account.isSuspended && !account.isLowBalance && (
                        <Badge variant="secondary">正常</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-8 border-t">
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">儲值金額 (NT$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="100"
                      step="100"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="輸入儲值金額"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      最小儲值金額：NT$ 100
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? '處理中...' : '立即儲值'}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>近期交易</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">尚無交易記錄</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center text-sm">
                      <div>
                        <div className="font-medium">{tx.note || tx.type}</div>
                        <div className="text-gray-500 text-xs">
                          {new Date(tx.createdAt).toLocaleDateString('zh-TW')}
                        </div>
                      </div>
                      <div className={`font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount >= 0 ? '+' : ''}NT$ {Math.abs(tx.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {transactions.length > 10 && (
                <Button variant="link" className="w-full mt-4">
                  查看更多交易
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>帳戶說明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="space-y-2">
              <h3 className="font-medium">收費方式</h3>
              <p>每月根據您的銷售總額收取 0.1% - 0.3% 的平台服務費，具體費率由管理員設定。</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">儲值提醒</h3>
              <p>當餘額低於 NT$ 1,000 時，系統會發出提醒通知，請及時儲值以避免服務中斷。</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">帳單繳費</h3>
              <p>每月帳單需在 28 天內繳清，逾期將每週提醒一次，28 天後未繳清將暫停帳號服務。</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SupplierInfo {
  id: string
  companyName: string
  status: string
  isVerified: boolean
}

interface AccountInfo {
  balance: number
  totalSpent: number
  billingRate: number
  isSuspended: boolean
  isLowBalance: boolean
  paymentDueDate: string | null
}

interface Application {
  id: string
  status: string
  createdAt: string
}

export default function SupplierDashboardPage() {
  const [supplier, setSupplier] = useState<SupplierInfo | null>(null)
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [pendingApplications, setPendingApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      const [supplierRes, appRes] = await Promise.all([
        fetch('/api/suppliers').then(r => r.json()),
        fetch('/api/supplier-applications?type=pending').then(r => r.json()),
      ])

      if (supplierRes.success && supplierRes.data?.length > 0) {
        setSupplier(supplierRes.data[0])
        
        const accountRes = await fetch('/api/supplier/account')
        const accountData = await accountRes.json()
        if (accountData.success) {
          setAccount(accountData.data)
        }
      }

      if (appRes.success) {
        setPendingApplications(appRes.data)
      }
    } catch {
      setError('載入失敗')
    } finally {
      setLoading(false)
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

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">您還沒有供應商帳號</p>
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
          <h1 className="text-3xl font-bold">{supplier.companyName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge>{supplier.status === 'ACTIVE' ? '營業中' : supplier.status}</Badge>
            {supplier.isVerified && <Badge variant="outline">已驗證</Badge>}
            {account?.isSuspended && <Badge variant="destructive">已停權</Badge>}
          </div>
        </div>

        {account?.isLowBalance && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
            餘額不足 NT$ 1,000，請盡快儲值以確保服務持續
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">帳戶餘額</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                NT$ {account?.balance?.toLocaleString() || '0'}
              </p>
              <Link href="/supplier/account">
                <Button variant="link" className="px-0 mt-2">儲值 →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">累計繳費</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                NT$ {account?.totalSpent?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                收費率：{(Number(account?.billingRate || 0) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">待審申請</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pendingApplications.length}</p>
              <Link href="/supplier/applications">
                <Button variant="link" className="px-0 mt-2">審批 →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">帳單</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {account?.paymentDueDate ? '待繳納' : '無'}
              </p>
              <Link href="/supplier/invoices">
                <Button variant="link" className="px-0 mt-2">查看 →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>快速功能</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Link href="/supplier/applications">
                  <Button variant="outline" className="w-full">
                    審批申請 ({pendingApplications.length})
                  </Button>
                </Link>
                <Link href="/supplier/products">
                  <Button variant="outline" className="w-full">產品管理</Button>
                </Link>
                <Link href="/supplier/account">
                  <Button variant="outline" className="w-full">帳戶儲值</Button>
                </Link>
                <Link href="/account/sub-accounts">
                  <Button variant="outline" className="w-full">附屬帳號</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近申請</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingApplications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">目前沒有待審批的申請</p>
              ) : (
                <div className="space-y-2">
                  {pendingApplications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex justify-between items-center text-sm">
                      <span>申請 #{app.id.slice(-6)}</span>
                      <Badge variant="secondary">待審批</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

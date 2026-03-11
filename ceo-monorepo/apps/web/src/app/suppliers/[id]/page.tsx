'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Supplier {
  id: string
  taxId: string
  companyName: string
  contactPerson: string
  phone: string
  email: string
  address: string
  industry: string
  description: string
  status: string
  isVerified: boolean
  verifiedAt: string
  createdAt: string
  productsCount: number
  applicationsCount: number
  approvedUsersCount: number
}

export default function SupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const supplierId = params.id as string

  useEffect(() => {
    if (supplierId) {
      fetchSupplier()
    }
  }, [supplierId])

  async function fetchSupplier() {
    try {
      const res = await fetch(`/api/suppliers/${supplierId}`)
      const data = await res.json()
      if (data.success) {
        setSupplier(data.data)
      } else {
        setError(data.error || '載入失敗')
      }
    } catch {
      setError('載入失敗，請稍後再試')
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

  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || '供應商不存在'}
          </div>
          <div className="mt-4">
            <Link href="/suppliers">
              <Button variant="outline">返回列表</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/suppliers">
            <Button variant="ghost">← 返回列表</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{supplier.companyName}</CardTitle>
                    <p className="text-gray-500 mt-1">統一編號：{supplier.taxId}</p>
                  </div>
                  <div className="flex gap-2">
                    {supplier.isVerified && (
                      <Badge variant="outline">✓ 已驗證</Badge>
                    )}
                    <Badge>{supplier.status === 'ACTIVE' ? '營業中' : supplier.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-500 text-sm">公司描述</h3>
                    <p className="mt-1">{supplier.description || '暂无描述'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-500 text-sm">產業類別</h3>
                      <p className="mt-1">{supplier.industry || '-'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500 text-sm">創立時間</h3>
                      <p className="mt-1">{new Date(supplier.createdAt).toLocaleDateString('zh-TW')}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 text-sm">公司地址</h3>
                    <p className="mt-1">{supplier.address || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>聯絡資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">聯絡人</p>
                  <p className="font-medium">{supplier.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">電話</p>
                  <p className="font-medium">{supplier.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">電子郵件</p>
                  <p className="font-medium">{supplier.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>統計資料</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">產品數量</span>
                  <span className="font-medium">{supplier.productsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">合作商家</span>
                  <span className="font-medium">{supplier.approvedUsersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">申請數量</span>
                  <span className="font-medium">{supplier.applicationsCount}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Link href={`/suppliers/${supplier.id}/apply`} className="block">
                <Button className="w-full">申請加入</Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={() => router.back()}>
                返回
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

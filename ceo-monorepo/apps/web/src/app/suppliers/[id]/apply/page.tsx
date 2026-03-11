'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Supplier {
  id: string
  companyName: string
  status: string
}

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    businessLicense: '',
    note: '',
  })

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/supplier-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          ...formData,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('申請提交成功！')
        router.push('/my-applications')
      } else {
        setError(data.error || '提交失敗')
      }
    } catch {
      setError('提交失敗，請稍後再試')
    } finally {
      setSubmitting(false)
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

  if (error && !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
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
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href={`/suppliers/${supplierId}`}>
            <Button variant="ghost">← 返回供應商詳情</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>申請加入供應商</CardTitle>
            <p className="text-gray-500">供應商：{supplier?.companyName}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  公司名稱 <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="請輸入公司名稱"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  聯絡人 <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="請輸入聯絡人姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  電話 <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="請輸入聯絡電話"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  營業執照 URL
                </label>
                <Input
                  value={formData.businessLicense}
                  onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
                  placeholder="請輸入營業執照圖片網址"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  備註
                </label>
                <Textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="其他補充說明（選填）"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? '提交中...' : '提交申請'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

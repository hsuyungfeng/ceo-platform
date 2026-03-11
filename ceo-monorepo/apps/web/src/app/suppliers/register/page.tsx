'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SupplierRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    industry: '',
    description: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/suppliers/${data.data.id}`)
        }, 2000)
      } else {
        setError(data.error || '註冊失敗，請稍後再試')
      }
    } catch {
      setError('註冊失敗，請檢查網路連線')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">供應商註冊</h1>
          <p className="text-gray-500 mt-1">填寫供應商資訊以申請加入平台</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              註冊成功！正在跳轉到供應商頁面...
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>供應商資訊</CardTitle>
            <CardDescription>
              請填寫完整的公司資訊，審核通過後即可成為平台供應商
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="companyName">公司名稱 *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="如：台灣股份有限公司"
                  />
                </div>

                <div>
                  <Label htmlFor="taxId">統一編號 *</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    required
                    placeholder="8位數字"
                    pattern="[0-9]{8}"
                    maxLength={8}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contactPerson">聯絡人姓名 *</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                    placeholder="如：張三"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">聯絡電話 *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="如：0912345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">聯絡信箱 *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="如：contact@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">行業別</Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="如：電子零件、食品加工"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">公司地址 *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="完整的公司地址"
                />
              </div>

              <div>
                <Label htmlFor="description">公司簡介</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="簡述公司業務、產品或服務"
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  簡介有助於批發商了解您的公司
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? '處理中...' : '提交註冊申請'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/suppliers">取消</Link>
                </Button>
              </div>

              <div className="text-sm text-gray-500 pt-4 border-t">
                <p className="mb-2">註冊說明：</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>提交申請後，平台管理員將在1-3個工作天內審核</li>
                  <li>審核通過後，您將收到電子郵件通知</li>
                  <li>成為供應商後，您需要設定帳戶餘額以支付平台服務費</li>
                  <li>平台將根據月銷售額收取0.1% - 0.3%的服務費</li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
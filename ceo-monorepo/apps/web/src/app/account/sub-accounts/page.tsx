'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface SubAccount {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  status: string
  createdAt: string
  lastLoginAt: string | null
}

export default function SubAccountsPage() {
  const [accounts, setAccounts] = useState<SubAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'MEMBER',
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/account/sub-accounts')
      const data = await res.json()
      if (data.success) {
        setAccounts(data.data)
      }
    } catch {
      setError('載入失敗')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/account/sub-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(`附屬帳號建立成功！臨時密碼：${data.data.tempPassword}`)
        setShowForm(false)
        setFormData({ name: '', email: '', phone: '', role: 'MEMBER' })
        fetchAccounts()
      } else {
        setError(data.error || '建立失敗')
      }
    } catch {
      setError('建立失敗，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除此附屬帳號嗎？')) return

    try {
      const res = await fetch(`/api/account/sub-accounts/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('附屬帳號已刪除')
        fetchAccounts()
      } else {
        toast.error(data.error || '刪除失敗')
      }
    } catch {
      toast.error('刪除失敗')
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">附屬帳號管理</h1>
            <p className="text-gray-500 mt-1">管理您的附屬帳號</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? '取消' : '+ 新增附屬帳號'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>新增附屬帳號</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">姓名 *</label>
                    <input
                      required
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">電子郵件 *</label>
                    <input
                      required
                      type="email"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">電話</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">權限</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="MEMBER">一般成員</option>
                      <option value="ADMIN">管理員</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" disabled={submitting}>
                  {submitting ? '建立中...' : '建立帳號'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {accounts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">目前沒有附屬帳號</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">姓名</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">電子郵件</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">權限</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">狀態</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">建立時間</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-b">
                      <td className="px-4 py-3">{account.name}</td>
                      <td className="px-4 py-3 text-gray-500">{account.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {account.role === 'ADMIN' ? '管理員' : '一般成員'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge>{account.status === 'ACTIVE' ? '正常' : account.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(account.createdAt).toLocaleDateString('zh-TW')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                          className="text-red-500"
                        >
                          刪除
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

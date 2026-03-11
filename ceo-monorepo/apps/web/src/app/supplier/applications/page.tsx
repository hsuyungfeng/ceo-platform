'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface SupplierApplication {
  id: string
  userId: string
  supplierId: string
  status: string
  note: string | null
  createdAt: string
  updatedAt: string
  applicant?: {
    name: string | null
    email: string
  }
  supplier?: {
    companyName: string
  }
}

export default function SupplierApplicationsPage() {
  const [applications, setApplications] = useState<SupplierApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [selectedApp, setSelectedApp] = useState<SupplierApplication | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [actionNote, setActionNote] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [filter])

  async function fetchApplications() {
    try {
      const supplierRes = await fetch('/api/suppliers')
      const supplierData = await supplierRes.json()

      if (!supplierData.success || !supplierData.data?.length) {
        setError('您還沒有供應商帳號')
        setLoading(false)
        return
      }

      const supplierId = supplierData.data[0].id
      const statusParam = filter !== 'ALL' ? `&status=${filter}` : ''
      const res = await fetch(
        `/api/supplier-applications?supplierId=${supplierId}${statusParam}`
      )
      const data = await res.json()

      if (data.success) {
        setApplications(data.data)
      }
    } catch {
      setError('載入失敗')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/supplier-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          note: actionNote || null,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setShowDetailDialog(false)
        setSelectedApp(null)
        setActionNote('')
        fetchApplications()
      } else {
        alert(data.error || '操作失敗')
      }
    } catch {
      alert('操作失敗')
    }
  }

  async function handleReject(id: string) {
    if (!confirm('確定要拒絕此申請嗎？')) return

    try {
      const res = await fetch(`/api/supplier-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          note: actionNote || null,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setShowDetailDialog(false)
        setSelectedApp(null)
        setActionNote('')
        fetchApplications()
      } else {
        alert(data.error || '操作失敗')
      }
    } catch {
      alert('操作失敗')
    }
  }

  function openDetail(app: SupplierApplication) {
    setSelectedApp(app)
    setShowDetailDialog(true)
    setActionNote('')
  }

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDING: { label: '待審批', variant: 'default' },
    APPROVED: { label: '已通過', variant: 'secondary' },
    REJECTED: { label: '已拒絕', variant: 'destructive' },
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

  if (error) {
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

  const pendingCount = applications.filter(a => a.status === 'PENDING').length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">申請審批</h1>
            <p className="text-gray-500">審批批发商加入供應商的申請</p>
          </div>
          {pendingCount > 0 && (
            <Badge className="text-lg px-4 py-1">{pendingCount} 待審批</Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>申請列表</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('ALL')}
                >
                  全部
                </Button>
                <Button
                  variant={filter === 'PENDING' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('PENDING')}
                >
                  待審批
                </Button>
                <Button
                  variant={filter === 'APPROVED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('APPROVED')}
                >
                  已通過
                </Button>
                <Button
                  variant={filter === 'REJECTED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('REJECTED')}
                >
                  已拒絕
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>申請編號</TableHead>
                  <TableHead>申請人</TableHead>
                  <TableHead>供應商</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>申請時間</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      尚無申請記錄
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">
                        #{app.id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{app.applicant?.name || '未設定姓名'}</div>
                          <div className="text-sm text-gray-500">{app.applicant?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{app.supplier?.companyName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={statusMap[app.status]?.variant || 'outline'}>
                          {statusMap[app.status]?.label || app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(app.createdAt).toLocaleDateString('zh-TW')}
                      </TableCell>
                      <TableCell>
                        {app.status === 'PENDING' ? (
                          <Button size="sm" onClick={() => openDetail(app)}>
                            審批
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => openDetail(app)}>
                            查看
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>申請詳情</DialogTitle>
              <DialogDescription>
                申請編號：#{selectedApp?.id.slice(-8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">申請人</div>
                <div className="font-medium">
                  {selectedApp?.applicant?.name || '未設定姓名'}
                </div>
                <div className="text-sm text-gray-500">{selectedApp?.applicant?.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">供應商</div>
                <div className="font-medium">{selectedApp?.supplier?.companyName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">狀態</div>
                <Badge variant={statusMap[selectedApp?.status || '']?.variant || 'outline'}>
                  {statusMap[selectedApp?.status || '']?.label || selectedApp?.status}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-500">申請時間</div>
                <div>{selectedApp && new Date(selectedApp.createdAt).toLocaleString('zh-TW')}</div>
              </div>
              {selectedApp?.note && (
                <div>
                  <div className="text-sm text-gray-500">備註</div>
                  <div>{selectedApp.note}</div>
                </div>
              )}

              {selectedApp?.status === 'PENDING' && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">審批備註（可選）</div>
                    <Input
                      placeholder="輸入備註..."
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleApprove(selectedApp.id)}
                    >
                      通過申請
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(selectedApp.id)}
                    >
                      拒絕申請
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

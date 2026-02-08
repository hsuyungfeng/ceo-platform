'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Edit, Trash2, ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface Faq {
  id: string
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function FaqList() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'sortOrder' | 'createdAt' | 'question'>('sortOrder')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  useEffect(() => {
    fetchFaqs()
  }, [pagination.page, search, statusFilter])

  const fetchFaqs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (search) params.append('search', search)
      if (statusFilter !== 'all') {
        params.append('isActive', statusFilter === 'active' ? 'true' : 'false')
      }
      
      const response = await fetch(`/api/admin/faqs?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFaqs(data.data)
          setPagination(data.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchFaqs()
        setDeleteDialogOpen(false)
        setFaqToDelete(null)
      }
    } catch (error) {
      console.error('Failed to delete FAQ:', error)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/faqs/${id}/toggle-status`, {
        method: 'PATCH',
      })
      if (response.ok) {
        fetchFaqs()
      }
    } catch (error) {
      console.error('Failed to toggle FAQ status:', error)
    }
  }

  const handleSort = (column: 'sortOrder' | 'createdAt' | 'question') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return
    setPagination(prev => ({ ...prev, page }))
  }

  const sortedFaqs = [...faqs].sort((a, b) => {
    if (sortBy === 'sortOrder') {
      return sortOrder === 'asc' ? a.sortOrder - b.sortOrder : b.sortOrder - a.sortOrder
    } else if (sortBy === 'question') {
      return sortOrder === 'asc' 
        ? a.question.localeCompare(b.question)
        : b.question.localeCompare(a.question)
    } else {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    }
  })

  if (loading) {
    return <div className="py-8 text-center">載入中...</div>
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="搜尋問題或答案..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="篩選狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部狀態</SelectItem>
              <SelectItem value="active">啟用中</SelectItem>
              <SelectItem value="inactive">已停用</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <button
                  onClick={() => handleSort('sortOrder')}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  排序
                  {sortBy === 'sortOrder' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('question')}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  問題
                  {sortBy === 'question' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  建立時間
                  {sortBy === 'createdAt' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFaqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                  沒有找到 FAQ
                </TableCell>
              </TableRow>
            ) : (
              sortedFaqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium">{faq.sortOrder}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="font-medium">{faq.question}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={faq.isActive ? 'default' : 'secondary'}>
                      {faq.isActive ? '啟用中' : '已停用'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(faq.createdAt).toLocaleDateString('zh-TW')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/faqs/${faq.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(faq.id, faq.isActive)}
                      >
                        {faq.isActive ? (
                          <span className="text-red-600">停用</span>
                        ) : (
                          <span className="text-green-600">啟用</span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFaqToDelete(faq.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            顯示第 {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} 筆，
            共 {pagination.total.toLocaleString()} 筆
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              第 {pagination.page} 頁，共 {pagination.totalPages} 頁
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除這個 FAQ 嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => faqToDelete && handleDelete(faqToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
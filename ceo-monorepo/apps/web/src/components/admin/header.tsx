'use client'

import { useState } from 'react'
import { Bell, Search, Menu, X, User, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/contexts/theme-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminHeaderProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" aria-hidden="true" />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-900 pt-5 pb-4">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">關閉側邊欄</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-shrink-0 items-center px-4">
              <span className="text-xl font-bold text-gray-900 dark:text-white">CEO 團購管理</span>
            </div>
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <nav className="space-y-1 px-2">
                <a
                  href="/admin"
                  className="group flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-2 text-base font-medium text-gray-900 dark:text-white"
                >
                  儀表板
                </a>
                <a
                  href="/admin/products"
                  className="group flex items-center rounded-md px-2 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                >
                  商品管理
                </a>
                <a
                  href="/admin/orders"
                  className="group flex items-center rounded-md px-2 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                >
                  訂單管理
                </a>
                <a
                  href="/admin/members"
                  className="group flex items-center rounded-md px-2 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                >
                  會員管理
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 lg:border-none">
        <button
          type="button"
          className="border-r border-gray-200 dark:border-gray-800 px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">開啟側邊欄</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        
        {/* Search bar */}
        <div className="flex flex-1 justify-between px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8">
          <div className="flex flex-1 items-center">
            <form className="flex w-full md:ml-0" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                搜尋
              </label>
              <div className="relative w-full text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-300">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                  <Search className="h-5 w-5" aria-hidden="true" />
                </div>
                <Input
                  id="search-field"
                  className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm bg-gray-50 dark:bg-gray-800"
                  placeholder="搜尋商品、訂單、會員..."
                  type="search"
                  name="search"
                  aria-label="管理後台搜尋"
                />
              </div>
            </form>
          </div>
          
          <div className="ml-4 flex items-center space-x-2 md:ml-6">
            {/* 主題切換 */}
            <ThemeToggle />
            
            {/* 通知按鈕 */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="查看通知"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* 個人資料下拉選單 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2"
                  aria-label="開啟個人選單"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role === 'SUPER_ADMIN' ? '超級管理員' : '管理員'}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/admin/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    個人資料
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    系統設定
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                  onClick={() => window.location.href = '/api/auth/logout'}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  登出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  )
}
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  homeLabel?: string;
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
}

/**
 * 麵包屑導航組件
 * 用於顯示當前頁面在網站結構中的位置
 * 
 * 自動模式：根據路由自動生成麵包屑
 * 手動模式：通過 items 屬性自定義麵包屑項目
 * 
 * WCAG 2.1 AA 相容性：
 * - 使用 nav 元素和 aria-label
 * - 使用 ol/li 語義結構
 * - 當前頁面有 aria-current="page"
 * - 支援鍵盤導航
 * - 提供足夠的色彩對比度
 */
export function Breadcrumb({
  items,
  homeLabel = '首頁',
  className,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
}: BreadcrumbProps) {
  const pathname = usePathname();
  
  // 如果沒有提供 items，則根據路由自動生成
  const breadcrumbItems = items || generateBreadcrumbItems(pathname, homeLabel, showHome);
  
  // 確保最後一個項目標記為當前頁面
  const finalItems = breadcrumbItems.map((item, index) => ({
    ...item,
    isCurrent: index === breadcrumbItems.length - 1
  }));

  return (
    <nav 
      className={cn('py-4', className)} 
      aria-label="麵包屑導航"
    >
      <ol 
        className="flex flex-wrap items-center gap-2 text-sm"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {finalItems.map((item, index) => {
          const isLast = index === finalItems.length - 1;
          
          return (
            <li 
              key={item.href}
              className="flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index > 0 && (
                <span 
                  className="mx-2" 
                  aria-hidden="true"
                >
                  {separator}
                </span>
              )}
              
              {isLast ? (
                <span
                  className="text-gray-600 font-medium"
                  aria-current="page"
                  itemProp="name"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  itemProp="item"
                >
                  {item.label === homeLabel && showHome ? (
                    <span className="flex items-center gap-1">
                      <Home className="h-4 w-4" aria-hidden="true" />
                      <span itemProp="name">{item.label}</span>
                    </span>
                  ) : (
                    <span itemProp="name">{item.label}</span>
                  )}
                </Link>
              )}
              
              <meta itemProp="position" content={(index + 1).toString()} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * 根據路由路徑生成麵包屑項目
 */
function generateBreadcrumbItems(
  pathname: string, 
  homeLabel: string, 
  showHome: boolean
): BreadcrumbItem[] {
  // 移除查詢參數和哈希
  const cleanPath = pathname.split('?')[0].split('#')[0];
  
  // 分割路徑為部分
  const pathParts = cleanPath.split('/').filter(part => part.length > 0);
  
  // 構建麵包屑項目
  const items: BreadcrumbItem[] = [];
  
  // 添加首頁
  if (showHome) {
    items.push({
      label: homeLabel,
      href: '/'
    });
  }
  
  // 添加路徑部分
  let currentPath = '';
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    
    // 將路徑部分轉換為友好標籤
    const label = getLabelFromPathPart(part, pathParts, index);
    
    items.push({
      label,
      href: currentPath
    });
  });
  
  return items;
}

/**
 * 將路徑部分轉換為友好標籤
 */
function getLabelFromPathPart(
  part: string, 
  allParts: string[], 
  index: number
): string {
  // 特殊路徑映射
  const pathLabelMap: Record<string, string> = {
    'products': '商品',
    'suppliers': '供應商',
    'supplier': '供應商管理',
    'recommendations': '採購推薦',
    'purchase-templates': '採購模板',
    'supplier-ratings': '供應商評比',
    'delivery-predictions': '交貨預測',
    'notifications': '通知',
    'cart': '購物車',
    'orders': '訂單',
    'invoices': '帳單',
    'admin': '管理後台',
    'settings': '設定',
    'account': '帳戶',
    'login': '登入',
    'register': '註冊',
    'applications': '申請',
    'dashboard': '儀表板',
    'sub-accounts': '附屬帳號',
    'apply': '申請加入',
    'new': '新增',
    'edit': '編輯',
    '[id]': '詳情'
  };
  
  // 如果是 ID 參數，嘗試獲取更有意義的標籤
  if (part.startsWith('[') && part.endsWith(']')) {
    const paramName = part.slice(1, -1);
    
    // 根據參數名稱和上下文決定標籤
    if (paramName === 'id') {
      if (index > 0) {
        const parentPart = allParts[index - 1];
        if (parentPart === 'suppliers') {
          return '供應商詳情';
        } else if (parentPart === 'products') {
          return '產品詳情';
        } else if (parentPart === 'orders') {
          return '訂單詳情';
        } else if (parentPart === 'invoices') {
          return '發票詳情';
        }
      }
      return '詳情';
    }
    
    return pathLabelMap[part] || paramName;
  }
  
  // 返回映射的標籤或原始部分（首字母大寫）
  return pathLabelMap[part] || 
    part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
}

/**
 * 使用麵包屑導航的頁面組件
 * 這是一個方便的高階組件，用於在頁面中自動添加麵包屑
 */
export function withBreadcrumb<P extends object>(
  Component: React.ComponentType<P>,
  breadcrumbProps?: Omit<BreadcrumbProps, 'items'> & { items?: BreadcrumbItem[] }
) {
  return function WithBreadcrumbWrapper(props: P) {
    return (
      <div className="space-y-4">
        <Breadcrumb {...breadcrumbProps} />
        <Component {...props} />
      </div>
    );
  };
}

/**
 * 麵包屑導航鉤子
 * 用於在組件中獲取當前麵包屑項目
 */
export function useBreadcrumb(
  customItems?: BreadcrumbItem[],
  options?: {
    homeLabel?: string;
    showHome?: boolean;
  }
) {
  const pathname = usePathname();
  const { homeLabel = '首頁', showHome = true } = options || {};
  
  const items = customItems || generateBreadcrumbItems(pathname, homeLabel, showHome);
  
  // 確保最後一個項目標記為當前頁面
  const finalItems = items.map((item, index) => ({
    ...item,
    isCurrent: index === items.length - 1
  }));
  
  return {
    items: finalItems,
    currentItem: finalItems[finalItems.length - 1],
    hasItems: finalItems.length > 0
  };
}
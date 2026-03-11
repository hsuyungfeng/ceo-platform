'use client';

import React from 'react';
import { Breadcrumb, useBreadcrumb, withBreadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 使用 withBreadcrumb 高階組件的示例組件
function ProductDetailContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>產品詳情頁面</CardTitle>
        <CardDescription>
          這個頁面演示了使用 withBreadcrumb 高階組件自動添加麵包屑
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          這個組件被 withBreadcrumb 包裝，自動在頂部顯示麵包屑導航。
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/breadcrumb-test">返回測試頁面</Link>
          </Button>
          <Button asChild>
            <Link href="/products">瀏覽商品</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 使用 withBreadcrumb 包裝的組件
const ProductDetailWithBreadcrumb = withBreadcrumb(ProductDetailContent, {
  homeLabel: '首頁',
  showHome: true
});

// 使用 useBreadcrumb 鉤子的示例組件
function SupplierManagementContent() {
  const { items, currentItem, hasItems } = useBreadcrumb();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>供應商管理頁面</CardTitle>
        <CardDescription>
          這個頁面演示了使用 useBreadcrumb 鉤子獲取麵包屑資訊
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">當前麵包屑資訊：</h3>
            <ul className="list-disc pl-5 text-gray-600">
              <li>項目數量：{items.length}</li>
              <li>當前頁面：{currentItem?.label}</li>
              <li>是否有項目：{hasItems ? '是' : '否'}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">所有麵包屑項目：</h3>
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li key={item.href} className="flex items-center gap-2">
                  <span className="text-gray-500">{index + 1}.</span>
                  <Link 
                    href={item.href} 
                    className={`${item.isCurrent ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    {item.label}
                  </Link>
                  {item.isCurrent && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      當前頁面
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/breadcrumb-test">返回測試頁面</Link>
            </Button>
            <Button asChild>
              <Link href="/suppliers">瀏覽供應商</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 自定義麵包屑項目的示例
function CustomBreadcrumbContent() {
  const customItems = [
    { label: '首頁', href: '/' },
    { label: '管理後台', href: '/admin' },
    { label: '用戶管理', href: '/admin/users' },
    { label: '用戶詳情', href: '/admin/users/123' },
    { label: '編輯資料', href: '/admin/users/123/edit' }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>自定義麵包屑示例</CardTitle>
        <CardDescription>
          這個頁面演示了使用自定義麵包屑項目
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Breadcrumb 
            items={customItems}
            homeLabel="控制台"
            separator={<span className="text-gray-400">/</span>}
          />
          
          <p className="text-gray-600">
            這個麵包屑使用完全自定義的項目，不依賴路由自動生成。
            適用於複雜的頁面結構或需要特殊標籤的情況。
          </p>
          
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/breadcrumb-test">返回測試頁面</Link>
            </Button>
            <Button asChild>
              <Link href="/admin">前往管理後台</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BreadcrumbTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">麵包屑導航測試頁面</h1>
          <p className="text-gray-600 mt-2">
            測試麵包屑導航組件的各種用法和功能
          </p>
        </div>
        
        <div className="space-y-8">
          {/* 示例 1：基本用法 */}
          <section aria-labelledby="basic-example-title">
            <h2 id="basic-example-title" className="text-2xl font-semibold mb-4">基本用法</h2>
            <Card>
              <CardHeader>
                <CardTitle>自動生成麵包屑</CardTitle>
                <CardDescription>
                  根據當前路由自動生成麵包屑項目
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Breadcrumb />
                
                <div className="p-4 bg-gray-100 rounded">
                  <code className="text-sm">
                    {'<Breadcrumb />'}
                  </code>
                </div>
                
                <p className="text-gray-600">
                  最簡單的用法，不傳遞任何參數。組件會根據當前路由自動生成麵包屑項目。
                </p>
              </CardContent>
            </Card>
          </section>
          
          {/* 示例 2：自定義首頁標籤 */}
          <section aria-labelledby="custom-home-title">
            <h2 id="custom-home-title" className="text-2xl font-semibold mb-4">自定義首頁標籤</h2>
            <Card>
              <CardHeader>
                <CardTitle>自定義首頁標籤和圖標</CardTitle>
                <CardDescription>
                  使用自定義的首頁標籤和隱藏首頁連結
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Breadcrumb 
                  homeLabel="控制台"
                  showHome={true}
                />
                
                <Breadcrumb 
                  homeLabel="主頁"
                  showHome={false}
                />
                
                <div className="p-4 bg-gray-100 rounded">
                  <code className="text-sm">
                    {'<Breadcrumb homeLabel="控制台" showHome={true} />'}
                    <br />
                    {'<Breadcrumb homeLabel="主頁" showHome={false} />'}
                  </code>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* 示例 3：自定義分隔符 */}
          <section aria-labelledby="custom-separator-title">
            <h2 id="custom-separator-title" className="text-2xl font-semibold mb-4">自定義分隔符</h2>
            <Card>
              <CardHeader>
                <CardTitle>不同風格的分隔符</CardTitle>
                <CardDescription>
                  使用不同的分隔符樣式
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Breadcrumb separator="›" />
                
                <Breadcrumb separator="/" />
                
                <Breadcrumb separator={<span className="text-gray-400">→</span>} />
                
                <div className="p-4 bg-gray-100 rounded">
                  <code className="text-sm">
                    {'<Breadcrumb separator="›" />'}
                    <br />
                    {'<Breadcrumb separator="/" />'}
                    <br />
                    {'<Breadcrumb separator={<span className="text-gray-400">→</span>} />'}
                  </code>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* 示例 4：使用 useBreadcrumb 鉤子 */}
          <section aria-labelledby="hook-example-title">
            <h2 id="hook-example-title" className="text-2xl font-semibold mb-4">使用 useBreadcrumb 鉤子</h2>
            <SupplierManagementContent />
          </section>
          
          {/* 示例 5：自定義麵包屑項目 */}
          <section aria-labelledby="custom-items-title">
            <h2 id="custom-items-title" className="text-2xl font-semibold mb-4">自定義麵包屑項目</h2>
            <CustomBreadcrumbContent />
          </section>
          
          {/* 示例 6：使用 withBreadcrumb 高階組件 */}
          <section aria-labelledby="hoc-example-title">
            <h2 id="hoc-example-title" className="text-2xl font-semibold mb-4">使用 withBreadcrumb 高階組件</h2>
            <ProductDetailWithBreadcrumb />
          </section>
          
          {/* 無障礙性說明 */}
          <section aria-labelledby="accessibility-title">
            <h2 id="accessibility-title" className="text-2xl font-semibold mb-4">無障礙性特性</h2>
            <Card>
              <CardHeader>
                <CardTitle>WCAG 2.1 AA 相容性</CardTitle>
                <CardDescription>
                  麵包屑導航組件的無障礙性特性
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>使用 <code>nav</code> 元素和 <code>aria-label="麵包屑導航"</code></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>使用語義化的 <code>ol</code>/<code>li</code> 結構</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>當前頁面有 <code>aria-current="page"</code> 屬性</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>支援 Schema.org 結構化數據</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>分隔符有 <code>aria-hidden="true"</code> 屬性</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>足夠的色彩對比度</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>支援鍵盤導航和焦點管理</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>
          
          {/* 使用指南 */}
          <section aria-labelledby="usage-guide-title">
            <h2 id="usage-guide-title" className="text-2xl font-semibold mb-4">使用指南</h2>
            <Card>
              <CardHeader>
                <CardTitle>如何在不同場景中使用</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">1. 基本頁面</h3>
                    <p className="text-gray-600">
                      在頁面頂部直接使用 <code>{'<Breadcrumb />'}</code>，組件會自動根據路由生成麵包屑。
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">2. 管理後台頁面</h3>
                    <p className="text-gray-600">
                      使用自定義項目或 <code>useBreadcrumb</code> 鉤子獲取更精確的麵包屑。
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">3. 產品/詳情頁面</h3>
                    <p className="text-gray-600">
                      使用 <code>withBreadcrumb</code> 高階組件自動包裝頁面內容。
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">4. 特殊路徑處理</h3>
                    <p className="text-gray-600">
                      在 <code>breadcrumb.tsx</code> 的 <code>pathLabelMap</code> 中添加特殊路徑的映射。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">下一步</h3>
          <p className="text-blue-700">
            麵包屑導航組件已準備就緒，可以在實際頁面中使用。建議：
          </p>
          <ul className="list-disc pl-5 mt-2 text-blue-700">
            <li>在管理後台頁面中添加麵包屑導航</li>
            <li>在產品詳情頁面中使用 withBreadcrumb</li>
            <li>在供應商管理頁面中使用自定義麵包屑</li>
            <li>運行無障礙性測試驗證相容性</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
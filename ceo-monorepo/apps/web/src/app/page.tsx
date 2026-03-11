'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';

interface PriceTier {
  minQty: number;
  price: string;
}

interface Product {
  id: string;
  name: string;
  image?: string;
  unit?: string;
  priceTiers: PriceTier[];
  currentGroupBuyQty: number;
  qtyToNextTier: number;
  isGroupBuyActive: boolean;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products?limit=8&isFeatured=true');
        const data = await response.json();
        
        if (data.data) {
          setFeaturedProducts(data.data.slice(0, 4));
          setLatestProducts(data.data.slice(4, 8));
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const getLowestPrice = (product: Product) => {
    if (!product.priceTiers?.length) return null;
    return product.priceTiers.reduce((min, tier) => 
      Number(tier.price) < Number(min.price) ? tier : min
    , product.priceTiers[0]);
  };

  const getHighestPrice = (product: Product) => {
    if (!product.priceTiers?.length) return null;
    return product.priceTiers[0];
  };

  const renderProductCard = (product: Product) => {
    const lowestPrice = getLowestPrice(product);
    const highestPrice = getHighestPrice(product);
    const hasTierPricing = product.priceTiers && product.priceTiers.length > 1;

    return (
      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <Link href={`/products/${product.id}`}>
          <div className="relative h-48 bg-gray-200">
            <img
              src={product.image || '/placeholder-product.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {hasTierPricing && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                階梯價
              </div>
            )}
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {hasTierPricing ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-red-600 font-bold">NT${lowestPrice?.price}</span>
                  <span className="text-gray-400 text-xs">起</span>
                </div>
              ) : (
                <span className="text-red-600 font-bold">NT${highestPrice?.price}</span>
              )}
            </div>
          </CardHeader>
          
          {/* 狀態條 - 集購進度 */}
          {product.isGroupBuyActive && (
            <CardContent className="pt-0">
              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Users className="w-4 h-4" />
                    <span>集購進度</span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {product.currentGroupBuyQty} {product.unit || '個'}
                  </span>
                </div>
                
                {/* 進度條 */}
                {product.priceTiers && product.priceTiers.length > 0 && (
                  <>
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, (product.currentGroupBuyQty / (product.priceTiers[product.priceTiers.length - 1]?.minQty || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                    
                    {/* 下一個目標 */}
                    {product.qtyToNextTier > 0 ? (
                      <p className="text-xs text-blue-600">
                        再集購 <span className="font-bold">{product.qtyToNextTier}</span> {product.unit || '個'} 享更低價！
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 font-medium">
                        已達最低價！感謝參與集購
                      </p>
                    )}
                  </>
                )}
              </div>
              
              <Button className="w-full mt-3" asChild>
                <span>查看詳情</span>
              </Button>
            </CardContent>
          )}
          
          {!product.isGroupBuyActive && (
            <CardContent>
              <Button className="w-full" asChild>
                <span>查看詳情</span>
              </Button>
            </CardContent>
          )}
        </Link>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">CEO 平台</h1>
          <p className="text-gray-600 mt-2">多供應商 B2B 批發平台</p>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-12">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="py-2" aria-label="麵包屑導航">
            <ol className="flex items-center gap-2 text-sm">
              <li className="flex items-center">
                <a href="/" className="text-gray-500 hover:text-blue-600">首頁</a>
              </li>
            </ol>
          </nav>
        </div>
        
        {/* Featured Products */}
        <section aria-labelledby="featured-products-title" className="mb-16">
          <h2 id="featured-products-title" className="text-3xl font-bold mb-8 text-center">熱門商品</h2>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" role="list">
              {featuredProducts.map(renderProductCard)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>目前沒有熱門商品</p>
            </div>
          )}
        </section>

        {/* Latest Products */}
        <section aria-labelledby="latest-products-title" className="mb-16">
          <h2 id="latest-products-title" className="text-3xl font-bold mb-8 text-center">最新商品</h2>
          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" role="list">
              {latestProducts.map(renderProductCard)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>目前沒有最新商品</p>
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section aria-labelledby="quick-links-title" className="mb-16">
          <h2 id="quick-links-title" className="text-2xl font-bold mb-6 text-center">快速連結</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <CardHeader>
                <CardTitle className="text-lg">供應商系統</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">瀏覽供應商列表，申請成為交易夥伴</p>
                <Button asChild className="w-full">
                  <Link href="/suppliers" aria-label="前往供應商列表">
                    瀏覽供應商
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardHeader>
                <CardTitle className="text-lg">採購推薦</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">基於您的採購歷史，獲得智慧推薦</p>
                <Button asChild className="w-full">
                  <Link href="/recommendations" aria-label="前往採購推薦">
                    查看推薦
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardHeader>
                <CardTitle className="text-lg">通知中心</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">查看最新通知和系統訊息</p>
                <Button asChild className="w-full">
                  <Link href="/notifications" aria-label="前往通知中心">
                    查看通知
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">關於 CEO 平台</h3>
              <p className="text-gray-600">
                CEO 平台是多供應商 B2B 批發平台，專為醫療器材批發商設計。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">快速連結</h3>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-gray-600 hover:text-blue-600">商品列表</Link></li>
                <li><Link href="/suppliers" className="text-gray-600 hover:text-blue-600">供應商列表</Link></li>
                <li><Link href="/cart" className="text-gray-600 hover:text-blue-600">購物車</Link></li>
                <li><Link href="/notifications" className="text-gray-600 hover:text-blue-600">通知中心</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">聯絡我們</h3>
              <p className="text-gray-600">
                如有任何問題，請聯繫客服：
                <br />
                Email: support@ceo-platform.com
                <br />
                電話: 02-1234-5678
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-gray-500">
            <p>© 2026 CEO 平台. 版權所有.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, Users, TrendingUp } from 'lucide-react';

interface PriceTier {
  minQty: number;
  price: string;
}

interface Product {
  id: string;
  name: string;
  subtitle?: string;
  image?: string;
  unit?: string;
  category?: string;
  firm?: string;
  isFeatured: boolean;
  priceTiers: PriceTier[];
  currentGroupBuyQty: number;
  qtyToNextTier: number;
  isGroupBuyActive: boolean;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('featured');

  // Extract search term from URL params
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products?limit=100');
        const data = await response.json();
        
        if (data.data) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => {
          const priceA = a.priceTiers?.[0]?.price ? Number(a.priceTiers[0].price) : 0;
          const priceB = b.priceTiers?.[0]?.price ? Number(b.priceTiers[0].price) : 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const priceA = a.priceTiers?.[0]?.price ? Number(a.priceTiers[0].price) : 0;
          const priceB = b.priceTiers?.[0]?.price ? Number(b.priceTiers[0].price) : 0;
          return priceB - priceA;
        });
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortOption]);

  // Extract unique categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('?');
    }
  };

  const getLowestPrice = (product: Product) => {
    if (!product.priceTiers?.length) return null;
    return product.priceTiers.reduce((min, tier) => 
      Number(tier.price) < Number(min.price) ? tier : min
    , product.priceTiers[0]);
  };

  const renderProductCard = (product: Product) => {
    const lowestPrice = getLowestPrice(product);
    const hasTierPricing = product.priceTiers && product.priceTiers.length > 1;

    return (
      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <div 
          className="relative h-48 bg-gray-200 cursor-pointer"
          onClick={() => router.push(`/products/${product.id}`)}
        >
          <img 
            src={product.image || '/placeholder-product.svg'} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-red-500">熱門</Badge>
          )}
          {hasTierPricing && (
            <Badge className="absolute top-2 right-2 bg-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              階梯價
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle 
            className="text-lg cursor-pointer hover:text-blue-600"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            {product.name}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            <div>{product.category || '未分類'}</div>
            <div className="text-xs text-gray-500">{product.firm || '未知供應商'}</div>
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
                      再 <span className="font-bold">{product.qtyToNextTier}</span> {product.unit || '個'} 享更低價！
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 font-medium">
                      已達最低價！
                    </p>
                  )}
                </>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div>
                {hasTierPricing ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-red-600 font-bold">NT${lowestPrice?.price}</span>
                    <span className="text-gray-400 text-xs">起</span>
                  </div>
                ) : (
                  <span className="text-red-600 font-bold">NT${lowestPrice?.price || '-'}</span>
                )}
              </div>
              <Button 
                size="sm" 
                onClick={() => router.push(`/products/${product.id}`)}
              >
                詳情
              </Button>
            </div>
          </CardContent>
        )}
        
        {!product.isGroupBuyActive && (
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                {hasTierPricing ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-red-600 font-bold">NT${lowestPrice?.price}</span>
                    <span className="text-gray-400 text-xs">起</span>
                  </div>
                ) : (
                  <span className="text-red-600 font-bold">NT${lowestPrice?.price || '-'}</span>
                )}
              </div>
              <Button 
                size="sm" 
                onClick={() => router.push(`/products/${product.id}`)}
              >
                詳情
              </Button>
            </div>
          </CardContent>
        )}
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">商品列表</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <SlidersHorizontal className="mr-2 h-5 w-5" />
                篩選條件
              </h2>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">分類</h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === null ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(null)}
                  >
                    全部 ({products.length})
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category as string)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">排序</h3>
                <div className="space-y-2">
                  <Button
                    variant={sortOption === 'featured' ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSortOption('featured')}
                  >
                    熱門優先
                  </Button>
                  <Button
                    variant={sortOption === 'price-low' ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSortOption('price-low')}
                  >
                    價格由低到高
                  </Button>
                  <Button
                    variant={sortOption === 'price-high' ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSortOption('price-high')}
                  >
                    價格由高到低
                  </Button>
                  <Button
                    variant={sortOption === 'name' ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSortOption('name')}
                  >
                    名稱 A-Z
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="搜尋商品..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="py-3 pl-10 pr-4 rounded-full shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </form>
            
            {/* Products grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-4 gap-6">
              {filteredProducts.map(renderProductCard)}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">沒有找到符合條件的商品</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">載入中...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

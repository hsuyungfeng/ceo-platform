'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Package, ArrowLeft, Loader2 } from 'lucide-react';

interface PriceTier {
  minQty: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  unit: string;
  spec: string | null;
  isFeatured: boolean;
  startDate: string;
  endDate: string;
  totalSold: number;
  priceTiers: PriceTier[];
  suggestedQty: number;
  isGroupBuyActive: boolean;
  firm: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
  } | null;
  category: {
    id: string;
    name: string;
    path: string[];
  } | null;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '獲取商品失敗');
        }
        
        setProduct(data);
        // Initialize selected tier with the first tier
        if (data.priceTiers && data.priceTiers.length > 0) {
          setSelectedTier(data.priceTiers[0]);
          // Set initial quantity to suggestedQty if available
          if (data.suggestedQty && data.suggestedQty > 1) {
            setQuantity(data.suggestedQty);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '獲取商品失敗');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Calculate applicable tier based on quantity
  const getApplicableTier = (qty: number): PriceTier => {
    if (!product?.priceTiers) return { minQty: 1, price: 0 };
    
    let tier = product.priceTiers[0];
    for (const t of product.priceTiers) {
      if (qty >= t.minQty) {
        tier = t;
      } else {
        break;
      }
    }
    return tier;
  };

  // Calculate price based on quantity
  const calculatePrice = (qty: number): number => {
    const tier = getApplicableTier(qty);
    setSelectedTier(tier);
    return tier.price * qty;
  };

  // Handle quantity change
  const handleQuantityChange = (value: number) => {
    if (value < 1) value = 1;
    setQuantity(value);
    calculatePrice(value);
  };

  // Calculate savings percentage
  const savingsPercentage = product?.priceTiers && selectedTier
    ? Math.round(
        ((product.priceTiers[0].price - selectedTier.price) / product.priceTiers[0].price) * 100
      )
    : 0;

  // Calculate time remaining
  const getTimeRemaining = (): string => {
    if (!product?.endDate) return '';
    const end = new Date(product.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return '已截止';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} 天 ${hours} 小時`;
    return `${hours} 小時`;
  };

  // Add to cart
  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '加入購物車失敗');
      }

      // Show success toast or notification
      alert(`已加入購物車: ${quantity} ${product?.unit || '件'}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '加入購物車失敗');
    } finally {
      setAddingToCart(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">載入商品資訊...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
            className="mb-6 flex items-center"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回商品列表
          </Button>
          
          <Card className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <Package className="h-12 w-12 mx-auto mb-2" />
              <h2 className="text-xl font-bold">載入失敗</h2>
            </div>
            <p className="text-gray-600 mb-4">{error || '商品不存在或已下架'}</p>
            <Button onClick={() => router.push('/products')}>
              瀏覽其他商品
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const displayPrice = calculatePrice(quantity);
  const timeRemaining = getTimeRemaining();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Button 
          variant="outline" 
          className="mb-6 flex items-center"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回商品列表
        </Button>
        
        <Card className="overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="h-96 bg-gray-200 relative">
                <Image 
                  src={product.image || '/placeholder-product.jpg'} 
                  alt={product.name} 
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  {product.subtitle && (
                    <p className="text-gray-600">{product.subtitle}</p>
                  )}
                </div>
                {product.isFeatured && (
                  <Badge className="bg-red-500">熱門商品</Badge>
                )}
              </div>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">({product.totalSold || 0} 已售)</span>
              </div>
              
              <div className="mb-6">
                {product.description && (
                  <p className="text-gray-700 mb-4">{product.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {product.spec && (
                    <div className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="text-gray-600">規格: {product.spec}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="text-gray-600">單位: {product.unit}</span>
                  </div>
                  {product.firm && (
                    <div className="flex items-center">
                      <span className="text-gray-600">廠商: {product.firm.name}</span>
                    </div>
                  )}
                  {product.category && (
                    <div className="flex items-center">
                      <span className="text-gray-600">分類: {product.category.name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Pricing tiers */}
              {product.priceTiers && product.priceTiers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">階梯定價</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {product.priceTiers.map((tier, index) => (
                      <Card 
                        key={index} 
                        className={`${selectedTier?.minQty === tier.minQty ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="text-sm text-gray-600">滿 {tier.minQty}{product.unit}</div>
                          <div className="font-bold text-red-600">${tier.price}/{product.unit}</div>
                          {index > 0 && product.priceTiers[0] && (
                            <div className="text-xs text-green-600">
                              省{Math.round(((product.priceTiers[0].price - tier.price) / product.priceTiers[0].price) * 100)}%
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity selector */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">數量</h3>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityChange(quantity - 1)}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="mx-2 w-20 text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    +
                  </Button>
                  <div className="ml-4">
                    <div className="text-lg font-bold text-red-600">
                      小計: ${displayPrice}
                    </div>
                    {savingsPercentage > 0 && selectedTier && product.priceTiers[0] && (
                      <div className="text-sm text-green-600">
                        省${(product.priceTiers[0].price - selectedTier.price) * quantity} ({savingsPercentage}% OFF)
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700" 
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    '加入購物車'
                  )}
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => router.push('/checkout')}
                >
                  立即購買
                </Button>
              </div>
              
              {/* Time remaining */}
              {timeRemaining && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                  <div>
                    <div className="font-semibold">團購即將截止</div>
                    <div className="text-sm text-gray-600">剩餘 {timeRemaining}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
        
        {/* Related products section - Placeholder for future implementation */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">相關商品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((id) => (
              <Card key={id} className="overflow-hidden opacity-50">
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">即將推出</span>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-400">相關商品 {id}</CardTitle>
                  <CardDescription>
                    <span className="text-gray-400">敬請期待</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Package, ArrowLeft, Users, TrendingUp, Clock } from 'lucide-react';

interface PriceTier {
  minQty: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  image?: string;
  unit?: string;
  spec?: string;
  isFeatured: boolean;
  startDate?: string;
  endDate?: string;
  totalSold: number;
  priceTiers: PriceTier[];
  suggestedQty: number;
  currentGroupBuyQty: number;
  qtyToNextTier: number;
  isGroupBuyActive: boolean;
  firm?: {
    id: string;
    name: string;
    phone?: string;
    address?: string;
  };
  category?: {
    id: string;
    name: string;
    path: string[];
  };
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setProduct(data);
          // 設置默認數量為建議數量
          if (data.suggestedQty > 1) {
            setQuantity(data.suggestedQty);
          }
        } else {
          setError(data.error || '無法載入商品');
        }
      } catch (err) {
        setError('載入商品時發生錯誤');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  // 計算當前數量對應的價格
  const getCurrentPrice = () => {
    if (!product?.priceTiers?.length) return 0;
    
    let currentPrice = product.priceTiers[0].price;
    for (const tier of product.priceTiers) {
      if (quantity >= tier.minQty) {
        currentPrice = tier.price;
      }
    }
    return currentPrice;
  };

  // 處理數量變更
  const handleQuantityChange = (value: number) => {
    if (value < 1) value = 1;
    setQuantity(value);
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
            <p className="text-red-600 text-lg">{error || '商品不存在'}</p>
          </Card>
        </div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();

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
              <div className="h-96 bg-gray-200">
                <img 
                  src={product.image || '/placeholder-product.svg'} 
                  alt={product.name} 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.subtitle && (
                <p className="text-gray-600 mb-4">{product.subtitle}</p>
              )}

              <p className="text-gray-700 mb-6">{product.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">規格: {product.spec || '-'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">單位: {product.unit || '-'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">廠商: {product.firm?.name || '-'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">分類: {product.category?.name || '-'}</span>
                </div>
              </div>

              {/* 目前集購數量 */}
              {product.isGroupBuyActive && (
                <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">目前集購數量</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {product.currentGroupBuyQty} {product.unit}
                  </div>
                  {product.qtyToNextTier > 0 && (
                    <p className="text-sm text-blue-700 mt-1">
                      再集購 {product.qtyToNextTier} {product.unit} 即可達到下一個階梯價格！
                    </p>
                  )}
                </div>
              )}

              {/* 階梯價格顯示 - 圖形化 */}
              {product.priceTiers && product.priceTiers.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-gray-800">階梯價格</span>
                  </div>
                  
                  {/* 進度條視覺化 */}
                  <div className="relative mb-6">
                    <div className="flex justify-between items-center mb-2">
                      {product.priceTiers.map((tier, index) => {
                        const isActive = quantity >= tier.minQty;
                        const isNext = product.priceTiers[index + 1] && quantity < product.priceTiers[index + 1].minQty;
                        return (
                          <div 
                            key={index}
                            className={`flex flex-col items-center ${isActive ? 'text-green-600' : 'text-gray-400'}`}
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-1 transition-all
                              ${isActive ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100 border-2 border-gray-300'}
                              ${isNext && index === 0 ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                            `}>
                              {tier.minQty}+
                            </div>
                            <span className="text-xs">{product.unit}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* 進度條背景 */}
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, (quantity / (product.priceTiers[product.priceTiers.length - 1].minQty || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* 價格區間卡片 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {product.priceTiers.map((tier, index) => {
                      const isCurrent = quantity >= tier.minQty && (index === product.priceTiers.length - 1 || quantity < product.priceTiers[index + 1].minQty);
                      const isReached = quantity >= tier.minQty;
                      
                      return (
                        <div 
                          key={index}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                            ${isCurrent 
                              ? 'border-green-500 bg-green-50 shadow-md scale-105' 
                              : isReached 
                                ? 'border-green-300 bg-green-25' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }
                          `}
                          onClick={() => handleQuantityChange(tier.minQty)}
                        >
                          {isCurrent && (
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                              目前
                            </div>
                          )}
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">
                              {tier.minQty}+ {product.unit}
                            </div>
                            <div className={`text-2xl font-bold ${isReached ? 'text-green-600' : 'text-gray-700'}`}>
                              ${tier.price}
                            </div>
                            {index > 0 && (
                              <div className="text-xs text-gray-400 mt-1">
                                省 ${Number(product.priceTiers[0].price) - Number(tier.price)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 當前價格 */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-1">當前價格</div>
                <div className="text-3xl font-bold text-red-600">
                  ${currentPrice} <span className="text-base font-normal text-gray-600">/{product.unit}</span>
                </div>
                {quantity > 1 && currentPrice < product.priceTiers[0]?.price && (
                  <p className="text-sm text-green-600 mt-1">
                    已享有階梯優惠！
                  </p>
                )}
              </div>
              
              {/* 數量選擇器 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">選擇數量</label>
                <div className="flex items-center gap-2">
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
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    +
                  </Button>
                  {product.suggestedQty > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 text-blue-600 border-blue-600"
                      onClick={() => handleQuantityChange(product.suggestedQty)}
                    >
                      建議: {product.suggestedQty}
                    </Button>
                  )}
                </div>
              </div>

              {/* 總價計算 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">小計</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${(currentPrice * quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 購買按鈕 */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                onClick={() => {
                  alert(`已加入購物車: ${quantity} ${product.unit}\n單價: $${currentPrice}\n小計: $${currentPrice * quantity}`);
                }}
              >
                加入購物車
              </Button>

              {/* 團購時間 */}
              {product.startDate && product.endDate && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    團購時間: {new Date(product.startDate).toLocaleDateString('zh-TW')} - {new Date(product.endDate).toLocaleDateString('zh-TW')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Calendar, Package, ArrowLeft } from 'lucide-react';

// Mock data for a product
const mockProduct = {
  id: 1,
  name: '醫療口罩',
  subtitle: '三層防護，高效過濾',
  description: '高品質醫療級口罩，採用三層過濾設計，有效阻隔細菌和病毒。適合醫療機構日常使用。',
  image: '/placeholder-product.jpg',
  unit: '盒',
  spec: '每盒50片',
  firm: '健康醫療器材',
  category: '醫療耗材',
  priceTiers: [
    { minQty: 1, price: 200, savings: 0 },
    { minQty: 5, price: 180, savings: 10 },
    { minQty: 10, price: 160, savings: 20 },
    { minQty: 20, price: 150, savings: 25 },
  ],
  startDate: new Date(Date.now() - 86400000 * 3), // 3 days ago
  endDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
  totalSold: 156,
  isFeatured: true,
  isActive: true,
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedTier, setSelectedTier] = useState(mockProduct.priceTiers[0]);
  
  // Calculate price based on quantity
  const calculatePrice = (qty: number) => {
    let applicableTier = mockProduct.priceTiers[0];
    for (const tier of mockProduct.priceTiers) {
      if (qty >= tier.minQty) {
        applicableTier = tier;
      } else {
        break;
      }
    }
    setSelectedTier(applicableTier);
    return applicableTier.price * qty;
  };
  
  // Handle quantity change
  const handleQuantityChange = (value: number) => {
    if (value < 1) value = 1;
    setQuantity(value);
    calculatePrice(value);
  };
  
  // Calculate savings percentage
  const savingsPercentage = Math.round(
    ((mockProduct.priceTiers[0].price - selectedTier.price) / mockProduct.priceTiers[0].price) * 100
  );
  
  // Calculate time remaining
  const timeRemaining = Math.max(0, Math.floor((mockProduct.endDate.getTime() - Date.now()) / (1000 * 60 * 60)));
  
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
                  src={mockProduct.image} 
                  alt={mockProduct.name} 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{mockProduct.name}</h1>
                  <p className="text-gray-600">{mockProduct.subtitle}</p>
                </div>
                {mockProduct.isFeatured && (
                  <Badge className="bg-red-500">熱門商品</Badge>
                )}
              </div>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">(128 評價)</span>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">{mockProduct.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="text-gray-600">規格: {mockProduct.spec}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600">單位: {mockProduct.unit}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600">廠商: {mockProduct.firm}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600">分類: {mockProduct.category}</span>
                  </div>
                </div>
              </div>
              
              {/* Pricing tiers */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">階梯定價</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {mockProduct.priceTiers.map((tier, index) => (
                    <Card 
                      key={index} 
                      className={`${selectedTier.minQty === tier.minQty ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-sm text-gray-600">滿 {tier.minQty}{mockProduct.unit}</div>
                        <div className="font-bold text-red-600">${tier.price}/{mockProduct.unit}</div>
                        {index > 0 && (
                          <div className="text-xs text-green-600">省{Math.round(((mockProduct.priceTiers[0].price - tier.price) / mockProduct.priceTiers[0].price) * 100)}%</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
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
                      小計: ${calculatePrice(quantity)}
                    </div>
                    <div className="text-sm text-green-600">
                      省${(mockProduct.priceTiers[0].price - selectedTier.price) * quantity} ({savingsPercentage}% OFF)
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700" 
                  onClick={() => {
                    // Add to cart logic would go here
                    alert(`已加入購物車: ${quantity} ${mockProduct.unit}`);
                  }}
                >
                  加入購物車
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => {
                    // Buy now logic would go here
                    alert('立即購買功能待實現');
                  }}
                >
                  立即購買
                </Button>
              </div>
              
              {/* Time remaining */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                <div>
                  <div className="font-semibold">團購即將截止</div>
                  <div className="text-sm text-gray-600">剩餘 {timeRemaining} 小時</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Related products section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">相關商品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((id) => (
              <Card key={id} className="overflow-hidden">
                <div className="h-40 bg-gray-200"></div>
                <CardHeader>
                  <CardTitle className="text-lg">相關商品 {id}</CardTitle>
                  <CardDescription>
                    <span className="text-red-600 font-bold">$150</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">查看詳情</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
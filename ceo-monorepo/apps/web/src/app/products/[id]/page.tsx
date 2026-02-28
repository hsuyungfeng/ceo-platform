'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Package, ArrowLeft } from 'lucide-react';

// Mock data for a product (simplified)
const mockProduct = {
  id: 1,
  name: '醫療口罩',
  description: '高品質醫療級口罩，採用三層過濾設計，有效阻隔細菌和病毒。適合醫療機構日常使用。',
  image: '/placeholder-product.svg',
  unit: '盒',
  spec: '每盒50片',
  firm: '健康醫療器材',
  category: '醫療耗材',
  price: 200,
  isActive: true,
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  // Handle quantity change
  const handleQuantityChange = (value: number) => {
    if (value < 1) value = 1;
    setQuantity(value);
  };
  
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
              <h1 className="text-3xl font-bold mb-2">{mockProduct.name}</h1>

              <p className="text-gray-700 mb-6">{mockProduct.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">規格: {mockProduct.spec}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">單位: {mockProduct.unit}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">廠商: {mockProduct.firm}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">分類: {mockProduct.category}</span>
                </div>
              </div>

              {/* Simple Price Display */}
              <div className="mb-6">
                <div className="text-2xl font-bold text-red-600">${mockProduct.price}/{mockProduct.unit}</div>
              </div>
              
              {/* Quantity selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">數量</label>
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
                </div>
              </div>

              {/* Action button */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                onClick={() => {
                  alert(`已加入購物車: ${quantity} ${mockProduct.unit}`);
                }}
              >
                加入購物車
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, CreditCard } from 'lucide-react';

// Mock data for cart items
const mockCartItems = [
  { id: 1, productId: 1, name: '醫療口罩', price: 150, quantity: 3, image: '/placeholder-product.jpg', unit: '盒' },
  { id: 2, productId: 3, name: '血壓計', price: 2450, quantity: 1, image: '/placeholder-product.jpg', unit: '台' },
  { id: 3, productId: 5, name: '體溫槍', price: 1200, quantity: 2, image: '/placeholder-product.jpg', unit: '支' },
];

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initialQuantities: Record<number, number> = {};
    mockCartItems.forEach(item => {
      initialQuantities[item.id] = item.quantity;
    });
    return initialQuantities;
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * quantities[item.id]), 0);
  const shipping = subtotal > 0 ? 150 : 0; // Fixed shipping cost
  const total = subtotal + shipping;

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  const removeItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId];
      return newQuantities;
    });
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">購物車</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">您的購物車是空的</p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/products')}
            >
              瀏覽商品
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <div className="flex">
                    <div className="w-24 h-24 bg-gray-200 m-4 flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1 p-4">
                      <CardHeader className="p-0">
                        <CardTitle>{item.name}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="p-0 pt-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-red-600 font-bold">${item.price}/{item.unit}</p>
                            <p className="text-sm text-gray-500">小計: ${item.price * quantities[item.id]}</p>
                          </div>
                          
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, quantities[item.id] - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            
                            <Input
                              type="number"
                              min="1"
                              value={quantities[item.id]}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 mx-2 text-center"
                            />
                            
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, quantities[item.id] + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="p-0 pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          移除
                        </Button>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Order summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>訂單摘要</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>小計</span>
                      <span>${subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>運費</span>
                      <span>${shipping}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                      <span>總計</span>
                      <span>${total}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700" 
                    onClick={handleCheckout}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    結帳
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2" 
                    onClick={() => router.push('/products')}
                  >
                    繼續購物
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
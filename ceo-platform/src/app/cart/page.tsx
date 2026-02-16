'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, CreditCard, Loader2 } from 'lucide-react';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }
      
      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    
    try {
      setUpdatingItemId(itemId);
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }
      
      const updatedItem = await response.json();
      
      setCartItems(prev => 
        prev.map(item => item.id === itemId ? updatedItem : item)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setRemovingItemId(itemId);
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
      
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setRemovingItemId(null);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">購物車</h1>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">載入中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">購物車</h1>
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <Button onClick={fetchCartItems}>
              重試
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                            <p className="text-sm text-gray-500">小計: ${item.price * item.quantity}</p>
                          </div>
                          
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingItemId === item.id}
                            >
                              {updatingItemId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 mx-2 text-center"
                              disabled={updatingItemId === item.id}
                            />
                            
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingItemId === item.id}
                            >
                              {updatingItemId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="p-0 pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={removingItemId === item.id}
                        >
                          {removingItemId === item.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
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

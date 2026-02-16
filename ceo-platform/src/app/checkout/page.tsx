'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, MapPin, User, Phone, Mail, Loader2, AlertCircle } from 'lucide-react';

interface CartItem {
  id: number;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

interface UserProfile {
  name: string;
  taxId: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [orderNote, setOrderNote] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCartItems();
    fetchUserProfile();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }
      const data = await response.json();
      setCartItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart items');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError('購物車是空的，無法下單');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId || String(item.id),
          quantity: item.quantity
        })),
        note: orderNote
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const result = await response.json();
      setSuccess(true);
      
      // Redirect to orders page after successful order
      router.push('/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">載入中...</span>
        </div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-96 text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">結帳</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>訂單摘要</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    購物車是空的
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="w-16 h-16 bg-gray-200 mr-4">
                        <img 
                          src={item.image || '/placeholder-product.jpg'} 
                          alt={item.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">數量: {item.quantity} {item.unit || '件'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.price * item.quantity}</p>
                        <p className="text-sm text-gray-600">${item.price}/{item.unit || '件'}</p>
                      </div>
                    </div>
                  ))
                )}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span>小計</span>
                    <span>${subtotal}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>運費</span>
                    <span>${shipping}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>總計</span>
                    <span>${total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Checkout form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>配送與付款資訊</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    聯絡資訊
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">姓名</Label>
                      <Input id="name" defaultValue={userData?.name || ''} />
                    </div>
                    <div>
                      <Label htmlFor="taxId">統一編號</Label>
                      <Input id="taxId" defaultValue={userData?.taxId || ''} />
                    </div>
                    <div>
                      <Label htmlFor="email">電子郵件</Label>
                      <Input id="email" type="email" defaultValue={userData?.email || ''} />
                    </div>
                    <div>
                      <Label htmlFor="phone">電話</Label>
                      <Input id="phone" defaultValue={userData?.phone || ''} />
                    </div>
                  </div>
                </div>
                
                {/* Billing Address */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    發票寄送地址
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="billing-address">地址</Label>
                      <Input id="billing-address" defaultValue={userData?.billingAddress || ''} />
                    </div>
                  </div>
                </div>
                
                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    收貨地址
                  </h3>
                  
                  <div className="flex items-center mb-3">
                    <Checkbox 
                      id="same-as-billing" 
                      checked={sameAsBilling}
                      onCheckedChange={(checked) => setSameAsBilling(!!checked)}
                    />
                    <Label htmlFor="same-as-billing" className="ml-2">
                      與發票寄送地址相同
                    </Label>
                  </div>
                  
                  {!sameAsBilling && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="shipping-address">地址</Label>
                        <Input id="shipping-address" defaultValue={userData?.shippingAddress || ''} />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Order Notes */}
                <div>
                  <Label htmlFor="order-notes">訂單備註</Label>
                  <Textarea 
                    id="order-notes" 
                    placeholder="如有特殊需求請在此說明..." 
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                  />
                </div>
                
                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    付款方式
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Input type="radio" id="payment-card" name="payment" defaultChecked />
                      <Label htmlFor="payment-card" className="ml-2">信用卡</Label>
                    </div>
                    <div className="flex items-center">
                      <Input type="radio" id="payment-atm" name="payment" />
                      <Label htmlFor="payment-atm" className="ml-2">ATM轉帳</Label>
                    </div>
                    <div className="flex items-center">
                      <Input type="radio" id="payment-cod" name="payment" />
                      <Label htmlFor="payment-cod" className="ml-2">貨到付款</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={handlePlaceOrder}
                  disabled={submitting || cartItems.length === 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      處理中...
                    </>
                  ) : (
                    `確認下單 - $${total}`
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  返回購物車
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, MapPin, User, Phone, Mail } from 'lucide-react';

// Mock data for cart items
const mockCartItems = [
  { id: 1, name: '醫療口罩', price: 150, quantity: 3, image: '/placeholder-product.svg', unit: '盒' },
  { id: 2, name: '血壓計', price: 2450, quantity: 1, image: '/placeholder-product.svg', unit: '台' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [orderNote, setOrderNote] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  
  // Mock user data
  const userData = {
    name: '王大明',
    taxId: '12345678',
    email: 'user@example.com',
    phone: '0912-345-678',
    billingAddress: '台北市中山區南京東路一段123號',
    shippingAddress: '台北市中山區南京東路一段123號',
  };

  // Calculate totals
  const subtotal = mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 150 : 0; // Fixed shipping cost
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    // Process order
    alert('訂單已送出！訂單編號：' + new Date().getTime());
    router.push('/orders');
  };

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
                {mockCartItems.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 mr-4">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">數量: {item.quantity} {item.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price * item.quantity}</p>
                      <p className="text-sm text-gray-600">${item.price}/{item.unit}</p>
                    </div>
                  </div>
                ))}
                
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
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    聯絡資訊
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">姓名</Label>
                      <Input id="name" defaultValue={userData.name} />
                    </div>
                    <div>
                      <Label htmlFor="taxId">統一編號</Label>
                      <Input id="taxId" defaultValue={userData.taxId} />
                    </div>
                    <div>
                      <Label htmlFor="email">電子郵件</Label>
                      <Input id="email" type="email" defaultValue={userData.email} />
                    </div>
                    <div>
                      <Label htmlFor="phone">電話</Label>
                      <Input id="phone" defaultValue={userData.phone} />
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
                      <Input id="billing-address" defaultValue={userData.billingAddress} />
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
                        <Input id="shipping-address" defaultValue={userData.shippingAddress} />
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
                >
                  確認下單 - ${total}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => router.back()}
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
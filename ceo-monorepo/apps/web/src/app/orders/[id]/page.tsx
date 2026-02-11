'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

// Mock data for order detail
const mockOrder = {
  id: 1,
  orderNo: '20260207-0001',
  status: 'COMPLETED',
  totalAmount: 1250,
  date: '2026-02-07',
  note: '請盡快安排出貨',
  shippingAddress: '台北市中山區南京東路一段123號',
  billingAddress: '台北市中山區南京東路一段123號',
  items: [
    { id: 1, name: '醫療口罩', quantity: 3, price: 150, image: '/placeholder-product.svg', unit: '盒' },
    { id: 2, name: '酒精乾洗手', quantity: 2, price: 280, image: '/placeholder-product.svg', unit: '瓶' }
  ]
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'CONFIRMED': return 'default';
      case 'SHIPPED': return 'warning';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '待處理';
      case 'CONFIRMED': return '已確認';
      case 'SHIPPED': return '已出貨';
      case 'COMPLETED': return '已完成';
      case 'CANCELLED': return '已取消';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Button 
          variant="outline" 
          className="mb-6 flex items-center"
          onClick={() => router.push('/orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回訂單列表
        </Button>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
               <div>
                 <CardTitle>訂單編號: {mockOrder.orderNo}</CardTitle>
                 <div className="text-sm text-muted-foreground">訂購日期: {mockOrder.date}</div>
               </div>
              <div className="mt-2 sm:mt-0">
                <Badge variant={getStatusVariant(mockOrder.status)}>
                  {getStatusText(mockOrder.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">配送資訊</h3>
                <p className="text-gray-600">{mockOrder.shippingAddress}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">發票資訊</h3>
                <p className="text-gray-600">{mockOrder.billingAddress}</p>
              </div>
            </div>
            
            {mockOrder.note && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">訂單備註</h3>
                <p className="text-gray-600">{mockOrder.note}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>訂單明細</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 mr-4">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.quantity} {item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.price}/{item.unit}</p>
                    <p className="text-sm text-gray-600">${item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3">
                <div className="flex justify-between py-2">
                  <span>小計</span>
                  <span>${mockOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>運費</span>
                  <span>$150</span>
                </div>
                <div className="flex justify-between py-2 border-t font-bold text-lg">
                  <span>總計</span>
                  <span>${mockOrder.totalAmount + 150}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
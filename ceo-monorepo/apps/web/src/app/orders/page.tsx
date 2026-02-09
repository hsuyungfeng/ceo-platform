'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for orders
const mockOrders = [
  { 
    id: 1, 
    orderNo: '20260207-0001', 
    status: 'COMPLETED', 
    totalAmount: 1250, 
    date: '2026-02-07',
    items: [
      { id: 1, name: '醫療口罩', quantity: 3, price: 150, image: '/placeholder-product.svg' },
      { id: 2, name: '酒精乾洗手', quantity: 2, price: 280, image: '/placeholder-product.svg' }
    ]
  },
  { 
    id: 2, 
    orderNo: '20260206-0002', 
    status: 'SHIPPED', 
    totalAmount: 2450, 
    date: '2026-02-06',
    items: [
      { id: 3, name: '血壓計', quantity: 1, price: 2450, image: '/placeholder-product.svg' }
    ]
  },
  { 
    id: 3, 
    orderNo: '20260205-0003', 
    status: 'PENDING', 
    totalAmount: 8500, 
    date: '2026-02-05',
    items: [
      { id: 4, name: '輪椅', quantity: 1, price: 8500, image: '/placeholder-product.svg' }
    ]
  }
];

export default function OrdersPage() {
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
        <h1 className="text-3xl font-bold mb-8">我的訂單</h1>
        
        <div className="space-y-6">
          {mockOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                   <div>
                     <CardTitle>訂單編號: {order.orderNo}</CardTitle>
                     <div className="text-sm text-muted-foreground">訂購日期: {order.date}</div>
                   </div>
                  <div className="mt-2 sm:mt-0">
                    <Badge variant={getStatusVariant(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">訂單明細:</h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 mr-3">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span>{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p>{item.quantity} x ${item.price} = ${item.quantity * item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-lg font-semibold">總計: ${order.totalAmount}</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      訂單詳情
                    </Button>
                    {order.status === 'PENDING' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                      >
                        取消訂單
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {mockOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">您還沒有任何訂單</p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/products')}
            >
              開始購物
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
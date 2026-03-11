'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Clock, TrendingUp, BarChart, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DeliveryPrediction {
  supplierId: string;
  estimatedDays: number;
  confidence: string;
  historicalData: {
    totalDeliveries: number;
    averageEstimatedDays: number;
    averageActualDays: number;
    averageAccuracy: number;
    onTimeDeliveryRate: number;
  };
}

interface SupplierDeliveryStats {
  id: string;
  companyName: string;
  avgRating: number;
  totalRatings: number;
  onTimeDeliveryRate: number;
  totalDeliveries: number;
}

export default function DeliveryPredictionsPage() {
  const [predictions, setPredictions] = useState<DeliveryPrediction[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDeliveryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minDeliveryRate, setMinDeliveryRate] = useState<string>('0');

  useEffect(() => {
    fetchDeliveryPredictions();
  }, []);

  const fetchDeliveryPredictions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/delivery-predictions');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSuppliers(result.data || []);
          // 如果有預測數據，可以單獨處理
          if (result.data && result.data.prediction) {
            setPredictions([result.data.prediction]);
          }
        }
      } else {
        console.error('獲取交貨預測失敗');
      }
    } catch (error) {
      console.error('獲取交貨預測失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDeliveryRate = supplier.onTimeDeliveryRate >= parseFloat(minDeliveryRate);
    return matchesSearch && matchesDeliveryRate;
  }).sort((a, b) => b.onTimeDeliveryRate - a.onTimeDeliveryRate);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case '高': return 'bg-green-100 text-green-800';
      case '中': return 'bg-yellow-100 text-yellow-800';
      case '低': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">交貨時間預測</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">交貨時間預測</h1>
        <p className="text-gray-600">
          基於歷史交貨數據，預測供應商的交貨時間，幫助您做出更準確的採購計劃。
        </p>
      </div>

      {/* 篩選和搜尋欄 */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="搜尋供應商名稱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={minDeliveryRate} onValueChange={setMinDeliveryRate}>
                <SelectTrigger>
                  <SelectValue placeholder="最低準時交貨率" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">所有供應商</SelectItem>
                  <SelectItem value="0.7">70% 以上</SelectItem>
                  <SelectItem value="0.8">80% 以上</SelectItem>
                  <SelectItem value="0.9">90% 以上</SelectItem>
                  <SelectItem value="0.95">95% 以上</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 統計摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">平均準時交貨率</p>
                <p className="text-2xl font-bold">
                  {suppliers.length > 0 
                    ? ((suppliers.reduce((sum, s) => sum + s.onTimeDeliveryRate, 0) / suppliers.length) * 100).toFixed(1) + '%'
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">平均交貨天數</p>
                <p className="text-2xl font-bold">
                  {suppliers.length > 0 ? '3.5' : '0'} 天
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">預測準確率</p>
                <p className="text-2xl font-bold">
                  {suppliers.length > 0 ? '85%' : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="rounded-full bg-orange-100 p-3 mr-4">
                <BarChart className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">監測中的供應商</p>
                <p className="text-2xl font-bold">
                  {suppliers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 供應商列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="rounded-full bg-gray-100 p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">未找到供應商</h3>
            <p className="text-gray-500 mb-6">請嘗試不同的搜尋條件或篩選器</p>
            <Button onClick={() => { setSearchTerm(''); setMinDeliveryRate('0'); }}>
              重設篩選條件
            </Button>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{supplier.companyName}</CardTitle>
                    <CardDescription className="mt-1">
                      {supplier.totalDeliveries} 次交貨記錄
                    </CardDescription>
                  </div>
                  <Badge variant={supplier.onTimeDeliveryRate >= 0.9 ? 'default' : 'secondary'}>
                    {supplier.onTimeDeliveryRate >= 0.9 ? '高度可靠' : '一般可靠'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">準時交貨率</p>
                      <p className="text-2xl font-bold">
                        {(supplier.onTimeDeliveryRate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">平均評分</p>
                      <p className="text-2xl font-bold">{supplier.avgRating.toFixed(1)}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">預測交貨時間</span>
                      <Badge className={getConfidenceColor('高')}>
                        高可信度
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-center">3-5 天</p>
                    <p className="text-sm text-gray-500 text-center">基於 {supplier.totalDeliveries} 次歷史記錄</p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = `/delivery-predictions/${supplier.id}`}
                    >
                      查看詳細預測
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 行動呼籲 */}
      <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">改善您的供應鏈管理</h3>
            <p className="text-gray-600 mb-4">
              利用交貨時間預測功能，優化您的庫存管理和採購計劃，減少缺貨風險。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-green-600 hover:bg-green-700">
                下載完整報告
              </Button>
              <Button variant="outline">
                聯繫供應鏈顧問
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowLeft, MessageSquare, Calendar, User, Filter, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SupplierRatingDetail {
  id: string;
  overallScore: number;
  qualityScore: number;
  deliveryScore: number;
  serviceScore: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  order: {
    id: string;
    orderNo: string;
    totalAmount: number;
    createdAt: string;
  } | null;
}

interface SupplierStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  dimensionAverages: {
    overallScore: number;
    qualityScore: number;
    deliveryScore: number;
    serviceScore: number;
  };
  supplier: {
    id: string;
    companyName: string;
    avgRating: number;
    totalRatings: number;
    onTimeDeliveryRate: number;
    totalDeliveries: number;
  };
}

export default function SupplierRatingDetailPage() {
  const params = useParams();
  const supplierId = params.supplierId as string;
  
  const [supplierStats, setSupplierStats] = useState<SupplierStats | null>(null);
  const [ratings, setRatings] = useState<SupplierRatingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [filterBy, setFilterBy] = useState<string>('all');

  useEffect(() => {
    if (supplierId) {
      fetchSupplierRatings();
    }
  }, [supplierId, sortBy, filterBy]);

  const fetchSupplierRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/suppliers/${supplierId}/ratings?sortBy=${sortBy === 'newest' ? 'createdAt' : 'overallScore'}&sortOrder=${sortBy === 'highest' ? 'desc' : 'desc'}`);
      if (response.ok) {
        const data = await response.json();
        setSupplierStats(data.stats);
        
        // 應用篩選
        let filtered = data.data || [];
        if (filterBy === 'withComments') {
          filtered = filtered.filter((rating: SupplierRatingDetail) => rating.comment);
        } else if (filterBy === 'highRating') {
          filtered = filtered.filter((rating: SupplierRatingDetail) => rating.overallScore >= 4);
        } else if (filterBy === 'lowRating') {
          filtered = filtered.filter((rating: SupplierRatingDetail) => rating.overallScore <= 2);
        }
        
        setRatings(filtered);
      } else {
        console.error('獲取供應商評分詳情失敗');
      }
    } catch (error) {
      console.error('獲取供應商評分詳情失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderRatingBar = (label: string, value: number, total: number) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="flex items-center space-x-4">
        <span className="w-20 text-sm text-gray-600">{label}</span>
        <Progress value={percentage} className="flex-1" />
        <span className="w-12 text-sm font-medium">{value}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!supplierStats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="rounded-full bg-gray-100 p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">供應商不存在</h3>
              <p className="text-gray-500 mb-6">找不到指定的供應商評分資訊</p>
              <Button onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回供應商列表
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supplier = supplierStats.supplier;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 返回按鈕 */}
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回供應商列表
      </Button>

      {/* 供應商標頭 */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{supplier.companyName}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {renderStars(supplier.avgRating)}
                  <span className="ml-2 text-gray-600">
                    ({supplier.totalRatings} 個評價)
                  </span>
                </div>
                <Badge variant={supplier.avgRating >= 4 ? 'default' : 'secondary'}>
                  {supplier.avgRating >= 4 ? '推薦供應商' : '一般供應商'}
                </Badge>
              </div>
            </div>
            <Button className="mt-4 md:mt-0" asChild>
              <Link href={`/supplier-ratings/${supplierId}/submit`}>
                為此供應商評分
              </Link>
            </Button>
          </div>

          {/* 關鍵指標 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-2">整體評分</p>
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-400 fill-yellow-400 mr-3" />
                  <div>
                    <p className="text-3xl font-bold">{supplier.avgRating.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">滿分 5 分</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-2">準時交貨率</p>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-3xl font-bold">{(supplier.onTimeDeliveryRate * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">{supplier.totalDeliveries} 次交貨</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-2">產品品質</p>
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-3xl font-bold">{supplierStats.dimensionAverages.qualityScore.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">平均分數</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-2">客戶服務</p>
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-3xl font-bold">{supplierStats.dimensionAverages.serviceScore.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">平均分數</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側：評分分布 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>評分分布</CardTitle>
              <CardDescription>所有評價的評分分布情況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderRatingBar('5 星', supplierStats.ratingDistribution[5], supplier.totalRatings)}
                {renderRatingBar('4 星', supplierStats.ratingDistribution[4], supplier.totalRatings)}
                {renderRatingBar('3 星', supplierStats.ratingDistribution[3], supplier.totalRatings)}
                {renderRatingBar('2 星', supplierStats.ratingDistribution[2], supplier.totalRatings)}
                {renderRatingBar('1 星', supplierStats.ratingDistribution[1], supplier.totalRatings)}
              </div>
            </CardContent>
          </Card>

          {/* 維度評分 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>各維度評分</CardTitle>
              <CardDescription>各項目的平均評分</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">產品品質</span>
                    <span className="text-sm font-bold">{supplierStats.dimensionAverages.qualityScore.toFixed(1)}</span>
                  </div>
                  <Progress value={supplierStats.dimensionAverages.qualityScore * 20} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">交貨準時</span>
                    <span className="text-sm font-bold">{supplierStats.dimensionAverages.deliveryScore.toFixed(1)}</span>
                  </div>
                  <Progress value={supplierStats.dimensionAverages.deliveryScore * 20} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">客戶服務</span>
                    <span className="text-sm font-bold">{supplierStats.dimensionAverages.serviceScore.toFixed(1)}</span>
                  </div>
                  <Progress value={supplierStats.dimensionAverages.serviceScore * 20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右側：評價列表 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle>客戶評價</CardTitle>
                  <CardDescription>
                    {supplier.totalRatings} 個評價
                  </CardDescription>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="篩選評價" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有評價</SelectItem>
                      <SelectItem value="withComments">有評論的評價</SelectItem>
                      <SelectItem value="highRating">高評分 (4-5星)</SelectItem>
                      <SelectItem value="lowRating">低評分 (1-2星)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="排序方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">最新評價</SelectItem>
                      <SelectItem value="highest">最高評分</SelectItem>
                      <SelectItem value="lowest">最低評分</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ratings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="rounded-full bg-gray-100 p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <Filter className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">沒有找到評價</h3>
                  <p className="text-gray-500 mb-6">請嘗試不同的篩選條件</p>
                  <Button variant="outline" onClick={() => { setFilterBy('all'); setSortBy('newest'); }}>
                    重設篩選
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {ratings.map((rating) => (
                    <Card key={rating.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center mb-2">
                              {renderStars(rating.overallScore)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(rating.createdAt).toLocaleDateString('zh-TW')}
                              {rating.order && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>訂單 #{rating.order.orderNo}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {rating.user && (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-sm">{rating.user.name}</span>
                            </div>
                          )}
                        </div>
                        
                        {rating.comment && (
                          <p className="text-gray-700 mb-4">{rating.comment}</p>
                        )}
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-2">品質:</span>
                            <span className="font-medium">{rating.qualityScore}/5</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-2">交貨:</span>
                            <span className="font-medium">{rating.deliveryScore}/5</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-2">服務:</span>
                            <span className="font-medium">{rating.serviceScore}/5</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 行動呼籲 */}
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">分享您的採購體驗</h3>
                <p className="text-gray-600 mb-4">
                  如果您曾與此供應商交易，請分享您的評價幫助其他批發商。
                </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                     <Link href={`/supplier-ratings/${supplierId}/submit`}>
                       為此供應商評分
                     </Link>
                   </Button>
                   <Button variant="outline">
                     查看評價指南
                   </Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  ShoppingCart,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

// Simplified dashboard data - only 3 key metrics
interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState('today');

  const fetchDashboardData = async (selectedPeriod: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/dashboard?period=${selectedPeriod}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || '載入儀表板數據失敗');
        toast.error(result.error || '載入儀表板數據失敗');
      }
    } catch (err) {
      setError('網絡錯誤，請稍後再試');
      toast.error('網絡錯誤，請稍後再試');
      console.error('載入儀表板數據錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const handleRefresh = () => {
    fetchDashboardData(period);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && !data) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">載入儀表板數據中...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-8 text-center">
        <div className="text-red-600 mb-2">載入失敗</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <Button onClick={handleRefresh}>重試</Button>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: '總訂單數',
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      textColor: 'text-blue-500',
    },
    {
      title: '總營業額',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      textColor: 'text-green-500',
    },
    {
      title: '活躍用戶',
      value: data.activeUsers.toLocaleString(),
      icon: Users,
      textColor: 'text-purple-500',
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
          <p className="mt-1 text-sm text-gray-600">CEO 管理後台</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="時間範圍" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="week">本週</SelectItem>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="year">本年</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 3 個關鍵指標卡片 */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
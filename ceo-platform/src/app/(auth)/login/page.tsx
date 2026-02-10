'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [taxId, setTaxId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 驗證輸入
    if (!taxId || !password) {
      setError('請填寫統一編號和密碼');
      setLoading(false);
      return;
    }

    if (taxId.length !== 8 || !/^\d+$/.test(taxId)) {
      setError('統一編號必須是8位數字');
      setLoading(false);
      return;
    }

    try {
      // 呼叫登入 API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taxId,
          password,
          rememberMe: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '登入失敗，請稍後再試');
        setLoading(false);
        return;
      }

      // 登入成功，重新導向到首頁
      router.push('/(shop)');
      router.refresh(); // 刷新頁面以更新認證狀態

    } catch (err) {
      console.error('登入錯誤:', err);
      setError('網路錯誤，請檢查連線後再試');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">會員登入</CardTitle>
          <CardDescription className="text-center">
            請輸入您的統一編號和密碼
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="tax-id">統一編號</Label>
              <Input
                id="tax-id"
                type="text"
                placeholder="請輸入8位數統一編號"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? '登入中...' : '登入'}
            </Button>
            <div className="mt-4 text-center text-sm">
              <p className="text-gray-600">
                還沒有帳號？{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/register')}>
                  點此註冊
                </Button>
              </p>
              <p className="text-gray-600 mt-2">
                <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/forgot-password')}>
                  忘記密碼？
                </Button>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
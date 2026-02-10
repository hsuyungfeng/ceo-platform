'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function EmailLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/email/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.requiresEmailVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
        } else if (result.requiresTwoFactor) {
          router.push(`/two-factor?email=${encodeURIComponent(result.email)}`);
        } else {
          setError(result.error || '登入失敗');
        }
        return;
      }

      // 登入成功，重定向到儀表板
      localStorage.setItem('token', result.token);
      router.push('/dashboard');
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">郵件登入</CardTitle>
          <CardDescription className="text-center">
            請輸入您的電子郵件和密碼
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
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            
            <div className="my-4">
              <Separator>
                <span className="px-2 text-sm text-gray-500 bg-white">或</span>
              </Separator>
            </div>
            
            <div className="mt-4 text-center text-sm w-full">
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
              <p className="text-gray-600 mt-2">
                或使用{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/login')}>
                  統一編號登入
                </Button>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
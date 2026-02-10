'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleSendVerification = async () => {
    if (!email) {
      setError('請輸入電子郵件');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/email/send-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          purpose: 'VERIFY_EMAIL'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '發送驗證郵件失敗');
        return;
      }

      setMessage('驗證郵件已發送到您的郵箱，請檢查您的收件箱');
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
          <CardTitle className="text-2xl text-center">驗證電子郵件</CardTitle>
          <CardDescription className="text-center">
            請輸入您的電子郵件以發送驗證郵件
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

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
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button
            onClick={handleSendVerification}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? '發送中...' : '發送驗證郵件'}
          </Button>

          <div className="mt-4 text-center text-sm w-full">
            <p className="text-gray-600">
              已經驗證了？{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/email-login')}>
                返回登入
              </Button>
            </p>
            <p className="text-gray-600 mt-2">
              需要幫助？{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/contact')}>
                聯絡我們
              </Button>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
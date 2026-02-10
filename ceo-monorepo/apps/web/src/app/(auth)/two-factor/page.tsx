'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // 自動聚焦到下一個輸入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 如果所有數字都輸入了，自動提交
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleSubmit();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('請輸入完整的6位數驗證碼');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/email/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          password: '', // 密碼應該已經在之前的請求中驗證過了
          twoFactorCode: fullCode
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '驗證失敗');
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

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/email/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: '' }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '重新發送驗證碼失敗');
        return;
      }

      if (result.requiresTwoFactor) {
        setResendCooldown(60); // 60秒冷卻時間
        setError('新的驗證碼已發送到您的郵件');
      }
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
          <CardTitle className="text-2xl text-center">雙因素驗證</CardTitle>
          <CardDescription className="text-center">
            驗證碼已發送到 {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant={error.includes('已發送') ? 'default' : 'destructive'}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="flex justify-center space-x-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el: HTMLInputElement | null) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  disabled={loading}
                />
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || code.join('').length !== 6}
              className="w-full"
            >
              {loading ? '驗證中...' : '驗證'}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={handleResendCode}
                disabled={loading || resendCooldown > 0}
              >
                {resendCooldown > 0 
                  ? `重新發送 (${resendCooldown}秒)` 
                  : '重新發送驗證碼'}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm">
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push('/email-login')}
            >
              使用其他帳戶登入
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
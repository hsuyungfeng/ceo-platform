import { NextRequest, NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import { validateTokenForRefresh } from '@/lib/auth-helper';

/**
 * POST /api/auth/refresh
 * 
 * Refresh JWT token endpoint for Mobile App API
 * 
 * Accepts Bearer Token in Authorization header, validates it with grace period,
 * and issues a new token with 30-day expiration.
 * 
 * Request:
 * - Authorization: Bearer <old-token>
 * 
 * Response (success):
 * {
 *   "message": "Token refreshed successfully",
 *   "token": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiUnpzM1BLUWdJa3RxaDVLZmd0WktxOWFrVmFabDFWeWswdS1lby1ONmEwSFNwM2hybFhnZW1ZZXY3R3JxYV84dFFLcXgtVkdnaWg3Q3h3TU9SaTlUMkEifQ...",
 *   "expiresAt": "2026-03-11T10:30:00.000Z"
 * }
 * 
 * Response (error):
 * {
 *   "error": "Invalid or expired token"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未提供有效的 Authorization header。請使用 Bearer Token 格式' },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.substring(7);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token 不能為空' },
        { status: 401 }
      );
    }

    // Validate token with grace period using our helper
    const validationResult = await validateTokenForRefresh(token);
    
    if (!validationResult) {
      return NextResponse.json(
        { error: 'Token 無效或已過期' },
        { status: 401 }
      );
    }

    const { decoded, user } = validationResult;

    // Check NEXTAUTH_SECRET
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('NEXTAUTH_SECRET 未設定');
      return NextResponse.json(
        { error: '伺服器設定錯誤，請聯絡管理員' },
        { status: 500 }
      );
    }

    // Prepare new token payload (30 days expiration)
    const now = Math.floor(Date.now() / 1000);
    const newExp = now + (30 * 24 * 60 * 60); // 30 days from now
    
    const tokenPayload = {
      id: user.id,
      taxId: user.taxId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      iat: now,
      exp: newExp,
    };

    // Generate new JWT token
    const newToken = await encode({
      token: tokenPayload,
      secret: process.env.NEXTAUTH_SECRET,
      salt: 'next-auth.session-token',
    });

    // Calculate expiration date for response
    const expiresAt = new Date(newExp * 1000).toISOString();

    return NextResponse.json(
      {
        message: 'Token 刷新成功',
        token: newToken,
        expiresAt: expiresAt,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token 刷新錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

/**
 * Handle other HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    { error: '此端點僅支援 POST 方法。請使用 POST 請求並提供 Bearer Token' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: '此端點僅支援 POST 方法。請使用 POST 請求並提供 Bearer Token' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: '此端點僅支援 POST 方法。請使用 POST 請求並提供 Bearer Token' },
    { status: 405 }
  );
}
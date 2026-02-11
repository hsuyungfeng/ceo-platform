/**
 * Example usage of the unified Auth Helper
 * 
 * This file demonstrates how to use the auth helper in different scenarios.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthData, getUserId, getUser } from './auth-helper';

/**
 * Example 1: Basic usage in a protected API endpoint
 */
export async function exampleProtectedEndpoint(request: NextRequest) {
  // Get authentication data
  const authData = await getAuthData(request);
  
  if (!authData) {
    return NextResponse.json(
      { error: '未授權，請先登入' },
      { status: 401 }
    );
  }
  
  const { userId, user } = authData;
  
  // Now you can use userId and user in your endpoint logic
  return NextResponse.json({
    message: '認證成功',
    userId,
    userName: user.name
  });
}

/**
 * Example 2: Using convenience functions
 */
export async function exampleWithConvenienceFunctions(request: NextRequest) {
  // Get just the user ID
  const userId = await getUserId(request);
  
  if (!userId) {
    return NextResponse.json(
      { error: '未授權，請先登入' },
      { status: 401 }
    );
  }
  
  // Get full user object if needed
  const user = await getUser(request);
  
  return NextResponse.json({
    userId,
    userEmail: user?.email
  });
}

/**
 * Example 3: How to update existing endpoints (cart, orders, etc.)
 * 
 * BEFORE (old way):
 * ```typescript
 * const session = await auth();
 * if (!session?.user) {
 *   return NextResponse.json({ error: '未授權' }, { status: 401 });
 * }
 * const userId = session.user.id;
 * ```
 * 
 * AFTER (new way):
 * ```typescript
 * const authData = await getAuthData(request);
 * if (!authData) {
 *   return NextResponse.json({ error: '未授權' }, { status: 401 });
 * }
 * const { userId, user } = authData;
 * ```
 * 
 * Benefits:
 * 1. Supports both Bearer Token and Session Cookies
 * 2. Consistent error handling
 * 3. Mobile App API compatibility
 */

/**
 * Example 4: Testing with different authentication methods
 * 
 * 1. Web App (Session Cookies):
 *    - Browser automatically sends cookies
 *    - No Authorization header needed
 * 
 * 2. Mobile App (Bearer Token):
 *    - Include header: Authorization: Bearer <token>
 *    - Token obtained from login API
 * 
 * 3. curl examples:
 *    Web: curl -H "Cookie: next-auth.session-token=..." http://localhost:3000/api/user/profile
 *    Mobile: curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." http://localhost:3000/api/user/profile
 */
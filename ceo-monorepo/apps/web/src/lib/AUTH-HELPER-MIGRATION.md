# Unified Auth Helper Migration Guide

## Overview
The new unified Auth Helper (`/apps/web/src/lib/auth-helper.ts`) provides consistent authentication for both Web App (session cookies) and Mobile App (Bearer Token). This guide shows how to update existing endpoints.

## Current Status
- ✅ `/api/user/profile` - Already updated to use new auth helper
- ⏳ `/api/cart/*` - Needs update (session-only)
- ⏳ `/api/orders/*` - Needs update (session-only)
- ⏳ `/api/auth/*` - Needs update (session-only)
- ⏳ Other protected endpoints - Need update

## Quick Migration Template

### Before (Session-only)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Session validation
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: '未授權，請先登入' },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  
  // Your endpoint logic...
}
```

### After (Unified Auth)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthData } from '@/lib/auth-helper';  // ← New import

export async function GET(request: NextRequest) {
  // Unified authentication
  const authData = await getAuthData(request);  // ← Updated
  
  if (!authData) {
    return NextResponse.json(
      { error: '未授權，請先登入' },
      { status: 401 }
    );
  }

  const { userId, user } = authData;  // ← Updated
  
  // Your endpoint logic (same as before)...
}
```

## Step-by-Step Migration

### 1. Update `/api/cart/route.ts`
```diff
 import { NextRequest, NextResponse } from 'next/server';
 import { prisma } from '@/lib/prisma';
-import { auth } from '@/auth';
+import { getAuthData } from '@/lib/auth-helper';
 import { z } from 'zod';

 export async function GET(request: NextRequest) {
   try {
-    // 驗證使用者是否已登入
-    const session = await auth();
-    
-    if (!session?.user) {
-      return NextResponse.json(
-        { error: '未授權，請先登入' },
-        { status: 401 }
-      );
-    }
+    // 使用統一的認證 helper
+    const authData = await getAuthData(request);
+    
+    if (!authData) {
+      return NextResponse.json(
+        { error: '未授權，請先登入' },
+        { status: 401 }
+      );
+    }
+    
+    const { userId } = authData;

     // 查詢使用者的購物車
     const cartItems = await prisma.cartItem.findMany({
       where: {
-        userId: session.user.id,
+        userId: userId,
       },
```

### 2. Update `/api/orders/route.ts`
```diff
 import { NextRequest, NextResponse } from 'next/server';
 import { prisma } from '@/lib/prisma';
-import { auth } from '@/auth';
+import { getAuthData } from '@/lib/auth-helper';
 import { z } from 'zod';

 export async function GET(request: NextRequest) {
   try {
-    // 驗證使用者是否已登入
-    const session = await auth();
-    
-    if (!session?.user) {
-      return NextResponse.json(
-        { error: '未授權，請先登入' },
-        { status: 401 }
-      );
-    }
+    // 使用統一的認證 helper
+    const authData = await getAuthData(request);
+    
+    if (!authData) {
+      return NextResponse.json(
+        { error: '未授權，請先登入' },
+        { status: 401 }
+      );
+    }
+    
+    const { userId } = authData;
```

### 3. Update Other Protected Endpoints
Same pattern applies to:
- `/api/cart/[id]/route.ts`
- `/api/orders/[id]/route.ts`
- `/api/auth/me/route.ts`
- Any other endpoint using `await auth()`

## Available Functions

### `getAuthData(request: NextRequest)`
Main function that returns:
```typescript
{
  id: string;      // User ID (same as userId)
  userId: string;  // User ID
  user: any;       // Full user object from database
} | null
```

### `getUserId(request: NextRequest)`
Convenience function that returns `string | null`

### `getUser(request: NextRequest)`
Convenience function that returns user object or `null`

## Authentication Flow
1. **Checks Bearer Token first** (for Mobile App)
   - Looks for `Authorization: Bearer <token>` header
   - Validates JWT token using NextAuth
   
2. **Falls back to Session Cookies** (for Web App)
   - Uses NextAuth's `auth()` function
   - Validates session from cookies

3. **Returns consistent data**
   - Same structure regardless of auth method
   - Returns `null` if both methods fail

## Testing

### Web App (Session Cookies)
```bash
# Already works - no changes needed
curl -H "Cookie: next-auth.session-token=..." http://localhost:3000/api/cart
```

### Mobile App (Bearer Token)
```bash
# Now works with Bearer Token
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." http://localhost:3000/api/cart
```

### No Authentication
```bash
# Returns 401 Unauthorized
curl http://localhost:3000/api/cart
```

## Benefits
1. **Mobile App API Support** - Bearer Token authentication
2. **Backward Compatible** - Session cookies still work
3. **Consistent** - Same auth logic across all endpoints
4. **Maintainable** - Single source of truth for authentication
5. **Error Handling** - Graceful handling of all auth failures

## Next Steps
1. Update all protected endpoints using the migration template
2. Test both authentication methods
3. Update Mobile App to use Bearer Tokens
4. Consider adding rate limiting or additional security features
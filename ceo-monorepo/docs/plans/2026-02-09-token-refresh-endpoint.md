# Token Refresh Endpoint Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create `/api/auth/refresh` endpoint for mobile apps to refresh expired JWT tokens with grace period.

**Architecture:** Extend existing auth-helper to support token refresh with 7-day grace period, create new refresh endpoint that accepts expired tokens and issues new ones with 30-day expiration.

**Tech Stack:** Next.js API Routes, NextAuth v5, JWT tokens, Prisma, TypeScript

---

### Task 1: Create token refresh validation helper

**Files:**
- Modify: `apps/web/src/lib/auth-helper.ts`

**Step 1: Add refresh token validation function**

```typescript
/**
 * Validates token for refresh with grace period
 * @param token JWT token string
 * @returns Decoded token data or null if invalid
 */
export async function validateTokenForRefresh(token: string) {
  try {
    // Use next-auth/jwt decode function to validate token
    const decoded = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET || '',
      salt: 'next-auth.session-token',
    });
    
    if (!decoded) {
      console.error('Token 解碼失敗: decoded is null');
      return null;
    }
    
    // Get user ID from decoded token
    const userId = decoded.id as string;
    
    if (!userId) {
      console.error('Token 解碼失敗: 沒有 user ID');
      return null;
    }
    
    // Check token expiration with grace period
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.exp as number;
    const iat = decoded.iat as number;
    
    if (!exp || !iat) {
      console.error('Token 缺少必要欄位: exp 或 iat');
      return null;
    }
    
    // Calculate how long ago token was issued
    const tokenAge = now - iat;
    const maxTokenAge = 60 * 24 * 60 * 60; // 60 days maximum (30 days valid + 30 days grace)
    
    if (tokenAge > maxTokenAge) {
      console.error('Token 太舊，超過最大使用期限');
      return null;
    }
    
    // Token is valid for refresh if:
    // 1. Not expired yet, OR
    // 2. Expired within last 7 days (grace period)
    const gracePeriod = 7 * 24 * 60 * 60; // 7 days in seconds
    const isExpired = exp < now;
    const isWithinGracePeriod = isExpired && (now - exp) <= gracePeriod;
    
    if (isExpired && !isWithinGracePeriod) {
      console.error('Token 已過期且超過寬限期');
      return null;
    }
    
    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      console.error('使用者不存在:', userId);
      return null;
    }
    
    // Check user status
    if (user.status !== 'ACTIVE') {
      console.error('使用者狀態非 ACTIVE:', user.status);
      return null;
    }
    
    return {
      decoded,
      user,
      userId: user.id,
    };
  } catch (error) {
    console.error('Token 驗證錯誤:', error);
    return null;
  }
}
```

**Step 2: Run type check to verify no errors**

Run: `cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo && npx tsc --noEmit apps/web/src/lib/auth-helper.ts`
Expected: No type errors

**Step 3: Commit**

```bash
cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo
git add apps/web/src/lib/auth-helper.ts
git commit -m "feat: add token refresh validation helper"
```

---

### Task 2: Create refresh endpoint

**Files:**
- Create: `apps/web/src/app/api/auth/refresh/route.ts`

**Step 1: Create the refresh endpoint file**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateTokenForRefresh } from '@/lib/auth-helper';
import { encode } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // Check Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '缺少授權標頭或格式錯誤' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Validate token for refresh
    const validationResult = await validateTokenForRefresh(token);
    
    if (!validationResult) {
      return NextResponse.json(
        { error: '無效或過期的 token' },
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

    // Create new token payload with same user data
    const now = Math.floor(Date.now() / 1000);
    const newTokenPayload = {
      id: user.id,
      taxId: user.taxId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      iat: now,
      exp: now + (30 * 24 * 60 * 60), // 30 days from now
    };

    // Generate new token
    const newToken = await encode({
      token: newTokenPayload,
      secret: process.env.NEXTAUTH_SECRET,
      salt: 'next-auth.session-token',
    });

    // Calculate expiration date for response
    const expiresAt = new Date((now + (30 * 24 * 60 * 60)) * 1000).toISOString();

    return NextResponse.json({
      message: 'Token 刷新成功',
      token: newToken,
      expiresAt: expiresAt,
      user: {
        id: user.id,
        name: user.name,
        taxId: user.taxId,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Token 刷新錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

**Step 2: Run type check**

Run: `cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo && npx tsc --noEmit apps/web/src/app/api/auth/refresh/route.ts`
Expected: No type errors

**Step 3: Commit**

```bash
cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo
git add apps/web/src/app/api/auth/refresh/route.ts
git commit -m "feat: add token refresh endpoint"
```

---

### Task 3: Update auth-helper imports

**Files:**
- Modify: `apps/web/src/lib/auth-helper.ts`

**Step 1: Add missing import for decode function**

At the top of the file, ensure decode is imported:

```typescript
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { decode } from 'next-auth/jwt'; // Already exists
```

**Step 2: Export the new function**

Add export statement for the new function:

```typescript
export async function validateTokenForRefresh(token: string) {
  // ... existing function code
}
```

**Step 3: Run type check**

Run: `cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo && npx tsc --noEmit apps/web/src/lib/auth-helper.ts`
Expected: No type errors

**Step 4: Commit**

```bash
cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo
git add apps/web/src/lib/auth-helper.ts
git commit -m "feat: export token refresh validation function"
```

---

### Task 4: Create test script

**Files:**
- Create: `test-token-refresh.sh`

**Step 1: Create test script**

```bash
#!/bin/bash

# Test Token Refresh Endpoint
# CEO團購電商平台 - Token Refresh 測試腳本

set -e

echo "=== CEO團購電商平台 Token Refresh 測試 ==="
echo "開始時間: $(date)"
echo

# 設定環境變數
API_URL="http://localhost:3000/api"
TEST_USER_TAX_ID="12345678"
TEST_USER_PASSWORD="password123"

echo "1. 測試登入取得初始 token..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"taxId\":\"$TEST_USER_TAX_ID\",\"password\":\"$TEST_USER_PASSWORD\"}")

echo "登入回應:"
echo "$LOGIN_RESPONSE" | jq '.'

# 提取 token
INITIAL_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
if [ "$INITIAL_TOKEN" = "null" ] || [ -z "$INITIAL_TOKEN" ]; then
  echo "錯誤: 無法取得初始 token"
  exit 1
fi

echo
echo "初始 token 取得成功"
echo "Token 長度: ${#INITIAL_TOKEN} 字元"
echo

echo "2. 測試 token refresh 端點..."
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INITIAL_TOKEN")

echo "Refresh 回應:"
echo "$REFRESH_RESPONSE" | jq '.'

# 檢查回應
REFRESH_SUCCESS=$(echo "$REFRESH_RESPONSE" | jq -r '.message')
NEW_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.token')
EXPIRES_AT=$(echo "$REFRESH_RESPONSE" | jq -r '.expiresAt')

if [ "$REFRESH_SUCCESS" = "Token 刷新成功" ] && [ "$NEW_TOKEN" != "null" ]; then
  echo "✅ Token refresh 測試成功!"
  echo "新 token 長度: ${#NEW_TOKEN} 字元"
  echo "新 token 到期時間: $EXPIRES_AT"
  
  echo
  echo "3. 測試新 token 是否可用於受保護端點..."
  PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
    -H "Authorization: Bearer $NEW_TOKEN")
  
  PROFILE_SUCCESS=$(echo "$PROFILE_RESPONSE" | jq -r '.user.taxId')
  if [ "$PROFILE_SUCCESS" = "$TEST_USER_TAX_ID" ]; then
    echo "✅ 新 token 驗證成功!"
  else
    echo "❌ 新 token 驗證失敗"
    echo "回應: $PROFILE_RESPONSE"
  fi
  
else
  echo "❌ Token refresh 測試失敗"
  echo "錯誤訊息: $(echo "$REFRESH_RESPONSE" | jq -r '.error')"
  exit 1
fi

echo
echo "4. 測試無效 token..."
INVALID_TOKEN="invalid.token.here"
INVALID_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INVALID_TOKEN")

INVALID_ERROR=$(echo "$INVALID_RESPONSE" | jq -r '.error')
if [ "$INVALID_ERROR" != "null" ]; then
  echo "✅ 無效 token 測試成功 (正確拒絕)"
else
  echo "❌ 無效 token 測試失敗 (應該拒絕但沒有)"
fi

echo
echo "5. 測試缺少 Authorization header..."
NO_AUTH_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json")

NO_AUTH_ERROR=$(echo "$NO_AUTH_RESPONSE" | jq -r '.error')
if [ "$NO_AUTH_ERROR" != "null" ]; then
  echo "✅ 缺少 Authorization header 測試成功 (正確拒絕)"
else
  echo "❌ 缺少 Authorization header 測試失敗 (應該拒絕但沒有)"
fi

echo
echo "=== 測試完成 ==="
echo "結束時間: $(date)"
```

**Step 2: Make script executable**

```bash
cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo
chmod +x test-token-refresh.sh
```

**Step 3: Commit**

```bash
cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo
git add test-token-refresh.sh
git commit -m "test: add token refresh test script"
```

---

### Task 5: Test the endpoint

**Step 1: Start development server (if not running)**

```bash
cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo
cd apps/web && npm run dev &
SERVER_PID=$!
echo "開發伺服器啟動中 (PID: $SERVER_PID)"
sleep 5
```

**Step 2: Run test script**

```bash
cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo
./test-token-refresh.sh
```

**Step 3: Check test results**

Expected: All tests should pass with ✅ marks

**Step 4: Stop development server**

```bash
kill $SERVER_PID 2>/dev/null || true
```

**Step 5: Commit any fixes**

```bash
cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo
git add .
git commit -m "test: complete token refresh endpoint testing"
```

---

### Task 6: Update documentation

**Files:**
- Create: `docs/auth-token-refresh.md`

**Step 1: Create documentation**

```markdown
# Token Refresh API 文件

## 概述

`/api/auth/refresh` 端點允許 Mobile App 刷新即將過期或已過期（在寬限期內）的 JWT token。

## 端點

`POST /api/auth/refresh`

## 請求

### Headers
- `Authorization: Bearer <token>` - 需要刷新的 JWT token

### 範例
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiUnpzM1BLUWdJa3RxaDVLZmd0WktxOWFrVmFabDFWeWswdS1lby1ONmEwSFNwM2hybFhnZW1ZZXY3R3JxYV84dFFLcXgtVkdnaWg3Q3h3TU9SaTlUMkEifQ..."
```

## 回應

### 成功回應 (200)
```json
{
  "message": "Token 刷新成功",
  "token": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiUnpzM1BLUWdJa3RxaDVLZmd0WktxOWFrVmFabDFWeWswdS1lby1ONmEwSFNwM2hybFhnZW1ZZXY3R3JxYV84dFFLcXgtVkdnaWg3Q3h3TU9SaTlUMkEifQ...",
  "expiresAt": "2026-03-11T10:30:00.000Z",
  "user": {
    "id": "user_123",
    "name": "測試公司",
    "taxId": "12345678",
    "email": "test@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "emailVerified": true
  }
}
```

### 錯誤回應

#### 401 Unauthorized
```json
{
  "error": "無效或過期的 token"
}
```

#### 401 Unauthorized
```json
{
  "error": "缺少授權標頭或格式錯誤"
}
```

#### 500 Internal Server Error
```json
{
  "error": "伺服器錯誤，請稍後再試"
}
```

## Token 驗證規則

1. **有效 token**: 未過期的 token 可以直接刷新
2. **寬限期**: 已過期但未超過 7 天的 token 可以刷新
3. **拒絕**: 超過 60 天（30天有效 + 30天最大期限）的 token 會被拒絕

## 使用情境

### Mobile App 自動刷新
```javascript
// 在 API 呼叫失敗時嘗試刷新 token
async function callAPIWithTokenRefresh(endpoint, options = {}) {
  try {
    return await fetch(endpoint, options);
  } catch (error) {
    if (error.status === 401) {
      // Token 可能過期，嘗試刷新
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (refreshResponse.ok) {
        const { token } = await refreshResponse.json();
        // 更新本地儲存的 token
        localStorage.setItem('token', token);
        
        // 重試原始請求
        options.headers.Authorization = `Bearer ${token}`;
        return await fetch(endpoint, options);
      }
    }
    throw error;
  }
}
```

### 定期刷新策略
建議在 token 過期前 24 小時自動刷新，避免使用者體驗中斷。

## 安全性考量

1. **短期寬限期**: 7 天寬限期平衡安全性與使用者體驗
2. **最大期限**: 60 天最大期限防止舊 token 被濫用
3. **使用者狀態檢查**: 每次刷新都會檢查使用者是否為 ACTIVE 狀態
```

**Step 2: Commit**

```bash
cd /Users/hsuyungfeng/Applesoft/統購PHP/.worktrees/phase6/ceo-monorepo
git add docs/auth-token-refresh.md
git commit -m "docs: add token refresh API documentation"
```

---

**Plan complete and saved to `docs/plans/2026-02-09-token-refresh-endpoint.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
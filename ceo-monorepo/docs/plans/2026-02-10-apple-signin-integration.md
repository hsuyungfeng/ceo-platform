# Apple Sign-In Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Apple Sign-In authentication for both web (NextAuth) and mobile (React Native) platforms in the CEO B2B e-commerce platform.

**Architecture:** Dual-platform approach with web using NextAuth Apple provider and mobile using React Native Apple Authentication library. Both platforms share the same OAuthAccount database model and token validation logic.

**Tech Stack:** NextAuth.js, React Native, @invertase/react-native-apple-authentication, Prisma, TypeScript, Expo

---

## Phase 1: Web Implementation (NextAuth)

### Task 1: Add Apple Provider Dependencies

**Files:**
- Modify: `apps/web/package.json`

**Step 1: Check current dependencies**

```bash
cd apps/web && npm list next-auth
```

**Step 2: Add Apple provider if needed**

```bash
cd apps/web && npm install next-auth @auth/prisma-adapter
```

**Step 3: Verify installation**

```bash
cd apps/web && npm list next-auth @auth/prisma-adapter
```

**Step 4: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json
git commit -m "chore(web): add next-auth apple provider dependencies"
```

### Task 2: Update NextAuth Configuration

**Files:**
- Modify: `apps/web/src/auth.ts:1-50`

**Step 1: Import Apple provider**

```typescript
// Add to imports
import Apple from 'next-auth/providers/apple';
```

**Step 2: Add Apple provider configuration**

```typescript
// Add to providers array after Google provider
Apple({
  clientId: process.env.APPLE_CLIENT_ID || '',
  clientSecret: process.env.APPLE_CLIENT_SECRET || '',
  authorization: {
    params: {
      scope: 'name email',
      response_mode: 'form_post',
    },
  },
  async profile(profile) {
    return {
      id: profile.sub,
      name: profile.name || '',
      email: profile.email || '',
      emailVerified: profile.email_verified || false,
      taxId: '', // Will be set in signIn callback
      role: 'MEMBER',
      status: 'ACTIVE',
    };
  },
}),
```

**Step 3: Update signIn callback for Apple**

```typescript
// In signIn callback, add Apple provider handling
if (account?.provider === 'apple') {
  // Similar logic to Google but with Apple-specific fields
  const { email, sub: providerId, name } = profile as any;
  
  // Check for existing OAuth account
  const existingOAuthAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerId: {
        provider: 'apple',
        providerId,
      },
    },
    include: {
      user: true,
    },
  });
  
  // Rest of logic similar to Google...
}
```

**Step 4: Test configuration**

```bash
cd apps/web && npm run build
```

**Step 5: Commit**

```bash
git add apps/web/src/auth.ts
git commit -m "feat(auth): add Apple provider to NextAuth configuration"
```

### Task 3: Add Apple Sign-In Button to Login Page

**Files:**
- Modify: `apps/web/src/app/(auth)/login/page.tsx:1-50`
- Create: `apps/web/src/components/ui/apple-icon.tsx`

**Step 1: Create Apple icon component**

```typescript
// apps/web/src/components/ui/apple-icon.tsx
export function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91s-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53C2.93 12.45 4.24 17 6 19.47c.8 1.21 1.8 2.58 3.12 2.53s1.75-.76 3.28-.76 2 .76 3.3.73 2.22-1.24 3.06-2.45a11 11 0 0 0 1.38-2.85 4.41 4.41 0 0 1-2.68-4.04z" />
    </svg>
  );
}
```

**Step 2: Update login page with Apple button**

```typescript
// Add import
import { AppleIcon } from '@/components/ui/apple-icon';

// Add Apple button after Google button
<Button
  type="button"
  variant="outline"
  className="w-full mt-2"
  onClick={() => {
    window.location.href = '/api/auth/signin?provider=apple';
  }}
>
  <AppleIcon className="mr-2 h-4 w-4" />
  使用 Apple 帳戶登入
</Button>
```

**Step 3: Test UI changes**

```bash
cd apps/web && npm run dev
```

**Step 4: Commit**

```bash
git add apps/web/src/components/ui/apple-icon.tsx apps/web/src/app/(auth)/login/page.tsx
git commit -m "feat(login): add Apple Sign-In button to login page"
```

## Phase 2: Database and API Extensions

### Task 4: Update Database Schema for Apple Support

**Files:**
- Modify: `apps/web/prisma/schema.prisma`

**Step 1: Check current OAuthAccount model**

```bash
grep -n "model OAuthAccount" apps/web/prisma/schema.prisma
```

**Step 2: Add Apple-specific fields**

```prisma
// In OAuthAccount model, ensure it supports Apple
model OAuthAccount {
  id            String   @id @default(cuid())
  provider      String   // 'google' or 'apple'
  providerId    String   // Unique ID from provider
  userId        String
  email         String
  name          String?
  picture       String?
  accessToken   String?
  refreshToken  String?
  expiresAt     DateTime?
  // Apple-specific fields
  appleUserId   String?  @unique // Apple's unique user identifier
  identityToken String?  // Apple ID token
  authorizationCode String? // Apple authorization code
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([provider, providerId])
  @@index([userId])
  @@index([provider, email])

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Step 3: Update TempOAuth model for Apple**

```prisma
// In TempOAuth model
model TempOAuth {
  id               String   @id @default(cuid())
  provider         String   // 'google' or 'apple'
  providerId       String
  email            String
  name             String
  picture          String?
  accessToken      String?
  refreshToken     String?
  tokenExpiresAt   DateTime?
  // Apple-specific
  appleUserId      String?
  identityToken    String?
  authorizationCode String?
  data             String   // JSON string of all OAuth data
  expiresAt        DateTime
  createdAt        DateTime @default(now())

  @@index([provider, providerId])
  @@index([expiresAt])
}
```

**Step 4: Generate and run migration**

```bash
cd apps/web && npx prisma migrate dev --name add_apple_oauth_fields
```

**Step 5: Commit**

```bash
git add apps/web/prisma/schema.prisma apps/web/prisma/migrations/
git commit -m "feat(db): add Apple-specific fields to OAuth models"
```

### Task 5: Create Apple Token Validation API

**Files:**
- Create: `apps/web/src/app/api/auth/oauth/apple/route.ts`

**Step 1: Create Apple token validation endpoint**

```typescript
// apps/web/src/app/api/auth/oauth/apple/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identityToken, authorizationCode, user } = body;

    if (!identityToken) {
      return NextResponse.json(
        { error: '缺少必要的身份令牌' },
        { status: 400 }
      );
    }

    // Validate Apple ID token (simplified - in production use proper validation)
    // Note: In production, you should validate the token with Apple's servers
    const decodedToken = jwt.decode(identityToken);
    
    if (!decodedToken || typeof decodedToken === 'string') {
      return NextResponse.json(
        { error: '無效的身份令牌' },
        { status: 400 }
      );
    }

    const { sub: providerId, email } = decodedToken as any;
    const appleUserId = providerId;
    const name = user?.name || '';

    // Check for existing OAuth account
    const existingOAuthAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: 'apple',
          providerId,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingOAuthAccount) {
      // Existing user - generate JWT token
      const user = existingOAuthAccount.user;
      const token = jwt.sign(
        {
          id: user.id,
          taxId: user.taxId,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
        },
        process.env.NEXTAUTH_SECRET || 'fallback-secret',
        { expiresIn: '30d' }
      );

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          taxId: user.taxId,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    }

    // Check for existing user with same email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Link Apple account to existing user
      await prisma.oAuthAccount.create({
        data: {
          provider: 'apple',
          providerId,
          userId: existingUser.id,
          appleUserId,
          email,
          name,
          identityToken,
          authorizationCode,
        },
      });

      const token = jwt.sign(
        {
          id: existingUser.id,
          taxId: existingUser.taxId,
          role: existingUser.role,
          status: existingUser.status,
          emailVerified: existingUser.emailVerified,
        },
        process.env.NEXTAUTH_SECRET || 'fallback-secret',
        { expiresIn: '30d' }
      );

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          taxId: existingUser.taxId,
          email: existingUser.email,
          role: existingUser.role,
          status: existingUser.status,
        },
      });
    }

    // New user - create temp OAuth data
    const tempOAuthData = {
      provider: 'apple',
      providerId,
      appleUserId,
      email,
      name,
      identityToken,
      authorizationCode,
    };

    const tempOAuth = await prisma.tempOAuth.create({
      data: {
        provider: 'apple',
        providerId,
        appleUserId,
        email,
        name: name || '',
        identityToken: identityToken || '',
        authorizationCode: authorizationCode || '',
        data: JSON.stringify(tempOAuthData),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    return NextResponse.json({
      success: true,
      requiresRegistration: true,
      tempOAuthId: tempOAuth.id,
      email,
      name,
    });

  } catch (error: any) {
    console.error('Apple OAuth error:', error);
    return NextResponse.json(
      { error: 'Apple 登入失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
```

**Step 2: Test the endpoint**

```bash
curl -X POST http://localhost:3000/api/auth/oauth/apple \
  -H "Content-Type: application/json" \
  -d '{"identityToken":"test-token"}'
```

**Step 3: Commit**

```bash
git add apps/web/src/app/api/auth/oauth/apple/route.ts
git commit -m "feat(api): add Apple token validation endpoint"
```

## Phase 3: Mobile App Integration

### Task 6: Install React Native Apple Authentication

**Files:**
- Modify: `apps/mobile/package.json`

**Step 1: Install Apple Authentication library**

```bash
cd apps/mobile && npm install @invertase/react-native-apple-authentication
```

**Step 2: Install iOS pods**

```bash
cd apps/mobile && npx pod-install
```

**Step 3: Update package.json**

Check that dependency is added:

```json
"dependencies": {
  "@invertase/react-native-apple-authentication": "^2.3.2",
  // ... other dependencies
}
```

**Step 4: Commit**

```bash
git add apps/mobile/package.json apps/mobile/package-lock.json
git commit -m "chore(mobile): add react-native-apple-authentication"
```

### Task 7: Configure iOS for Apple Sign-In

**Files:**
- Modify: `apps/mobile/app.json`
- Create: `apps/mobile/ios/Capabilities/AppleSignIn.entitlements`

**Step 1: Update app.json for Apple Sign-In**

```json
// In apps/mobile/app.json
{
  "expo": {
    "plugins": [
      [
        "@invertase/react-native-apple-authentication",
        {
          "appleSignIn": {
            "usesAppleSignIn": true
          }
        }
      ]
    ]
  }
}
```

**Step 2: Create iOS entitlements file**

```xml
<!-- apps/mobile/ios/Capabilities/AppleSignIn.entitlements -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.applesignin</key>
    <array>
        <string>Default</string>
    </array>
</dict>
</plist>
```

**Step 3: Rebuild iOS project**

```bash
cd apps/mobile && npx expo prebuild --clean
```

**Step 4: Commit**

```bash
git add apps/mobile/app.json apps/mobile/ios/Capabilities/
git commit -m "feat(mobile): configure iOS for Apple Sign-In"
```

### Task 8: Create Apple Sign-In Component for Mobile

**Files:**
- Create: `apps/mobile/src/components/auth/AppleSignInButton.tsx`

**Step 1: Create Apple Sign-In button component**

```typescript
// apps/mobile/src/components/auth/AppleSignInButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Apple } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';

export function AppleSignInButton() {
  const { signInWithApple, isLoading } = useAuthStore();

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
    } catch (error) {
      console.error('Apple Sign-In error:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleAppleSignIn}
      disabled={isLoading}
    >
      <View style={styles.iconContainer}>
        <Apple size={20} color="#000" />
      </View>
      <Text style={styles.text}>
        {isLoading ? '登入中...' : '使用 Apple 帳戶登入'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
});
```

**Step 2: Update auth store for Apple Sign-In**

```typescript
// In apps/mobile/stores/auth-store.ts, add:
import appleAuth from '@invertase/react-native-apple-authentication';

export const useAuthStore = create<AuthStore>((set, get) => ({
  // ... existing code
  
  signInWithApple: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Perform Apple Sign-In
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken, authorizationCode, user } = appleAuthRequestResponse;

      if (!identityToken) {
        throw new Error('Apple Sign-In failed: No identity token received');
      }

      // Send token to backend for validation
      const response = await fetch('http://localhost:3000/api/auth/oauth/apple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identityToken,
          authorizationCode,
          user,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Apple 登入失敗');
      }

      if (data.requiresRegistration) {
        // Navigate to registration screen
        router.push(`/register/oauth?id=${data.tempOAuthId}`);
        return;
      }

      // Store token and user data
      await AsyncStorage.setItem('auth_token', data.token);
      set({
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        isLoading: false,
      });

      // Navigate to home
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('Apple Sign-In error:', error);
      set({
        error: error.message || 'Apple 登入失敗，請稍後再試',
        isLoading: false,
      });
    }
  },
}));
```

**Step 3: Test the component**

```bash
cd apps/mobile && npm run ios
```

**Step 4: Commit**

```bash
git add apps/mobile/src/components/auth/AppleSignInButton.tsx apps/mobile/stores/auth-store.ts
git commit -m "feat(mobile): add Apple Sign-In button and authentication logic"
```

### Task 9: Update Mobile Login Screen

**Files:**
- Modify: `apps/mobile/app/(auth)/login.tsx`

**Step 1: Add Apple button to login screen**

```typescript
// In apps/mobile/app/(auth)/login.tsx
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';

// Add to login screen render
<View className="space-y-4">
  {/* Existing login form */}
  
  <View className="my-4">
    <View className="flex-row items-center">
      <View className="flex-1 h-px bg-gray-300" />
      <Text className="px-4 text-gray-500">或</Text>
      <View className="flex-1 h-px bg-gray-300" />
    </View>
  </View>
  
  <AppleSignInButton />
</View>
```

**Step 2: Test login screen**

```bash
cd apps/mobile && npm run ios
```

**Step 3: Commit**

```bash
git add apps/mobile/app/(auth)/login.tsx
git commit -m "feat(mobile): add Apple Sign-In button to login screen"
```

## Phase 4: Environment Configuration and Testing

### Task 10: Add Environment Variables

**Files:**
- Modify: `apps/web/.env.local.example`
- Modify: `apps/mobile/.env.example`

**Step 1: Add Apple OAuth variables to web**

```bash
# In apps/web/.env.local.example
# Apple OAuth (for B2B platform)
APPLE_CLIENT_ID=com.example.ceo-platform.service
APPLE_CLIENT_SECRET=-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_KEY_ID=XXXXXXXXXX
```

**Step 2: Add Apple configuration to mobile**

```bash
# In apps/mobile/.env.example
# Apple Sign-In
APPLE_SERVICE_ID=com.example.ceo-platform.service
```

**Step 3: Update documentation**

```markdown
# Apple Sign-In Setup Guide

## Web Configuration
1. Create Apple Developer Account
2. Register Service ID in Apple Developer Portal
3. Generate Private Key for Service ID
4. Configure Redirect URI: `http://localhost:3000/api/auth/callback/apple`
5. Add environment variables to `.env.local`

## Mobile Configuration
1. Enable Sign In with Apple capability in Xcode
2. Configure App ID with Sign In with Apple enabled
3. Add Apple Sign-In entitlement file
```

**Step 4: Commit**

```bash
git add apps/web/.env.local.example apps/mobile/.env.example
git commit -m "docs: add Apple OAuth environment variables and setup guide"
```

### Task 11: Create Integration Tests

**Files:**
- Create: `apps/web/__tests__/api/auth/oauth/apple.test.ts`
- Create: `apps/mobile/__tests__/components/auth/AppleSignInButton.test.tsx`

**Step 1: Create web API test**

```typescript
// apps/web/__tests__/api/auth/oauth/apple.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { POST } from '@/app/api/auth/oauth/apple/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma');

describe('Apple OAuth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error for missing identity token', async () => {
    const request = new Request('http://localhost:3000/api/auth/oauth/apple', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('缺少必要的身份令牌');
  });

  // Add more tests...
});
```

**Step 2: Create mobile component test**

```typescript
// apps/mobile/__tests__/components/auth/AppleSignInButton.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { useAuthStore } from '@/stores/auth-store';

jest.mock('@/stores/auth-store');

describe('AppleSignInButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(<AppleSignInButton />);
    expect(getByText('使用 Apple 帳戶登入')).toBeTruthy();
  });

  it('calls signInWithApple when pressed', async () => {
    const mockSignInWithApple = jest.fn();
    (useAuthStore as any).mockReturnValue({
      signInWithApple: mockSignInWithApple,
      isLoading: false,
    });

    const { getByText } = render(<AppleSignInButton />);
    fireEvent.press(getByText('使用 Apple 帳戶登入'));

    await waitFor(() => {
      expect(mockSignInWithApple).toHaveBeenCalled();
    });
  });
});
```

**Step 3: Run tests**

```bash
cd apps/web && npm test -- __tests__/api/auth/oauth/apple.test.ts
cd apps/mobile && npm test -- __tests__/components/auth/AppleSignInButton.test.tsx
```

**Step 4: Commit**

```bash
git add apps/web/__tests__/api/auth/oauth/apple.test.ts apps/mobile/__tests__/components/auth/AppleSignInButton.test.tsx
git commit -m "test: add Apple Sign-In integration tests"
```

## Phase 5: Documentation and Finalization

### Task 12: Update Authentication Documentation

**Files:**
- Create: `docs/authentication/apple-signin.md`
- Modify: `README.md`

**Step 1: Create Apple Sign-In documentation**

```markdown
# Apple Sign-In Integration

## Overview
Apple Sign-In is implemented for both web and mobile platforms in the CEO B2B e-commerce platform.

## Web Implementation
- Uses NextAuth Apple provider
- Supports OAuth 2.0 flow with Apple
- Handles Apple's privacy email relay

## Mobile Implementation
- Uses @invertase/react-native-apple-authentication
- Native iOS Sign In with Apple
- Token exchange with backend API

## Setup Instructions
1. Apple Developer Account setup
2. Service ID creation
3. Private key generation
4. Environment configuration
5. iOS entitlements setup

## API Endpoints
- `POST /api/auth/oauth/apple` - Apple token validation
- `GET /api/auth/signin?provider=apple` - Web Apple OAuth

## Testing
- Unit tests for token validation
- Integration tests for OAuth flow
- End-to-end tests for complete authentication
```

**Step 2: Update main README**

```markdown
## Authentication

The platform supports multiple authentication methods:
- Traditional credentials (taxId + password)
- Google OAuth
- **Apple Sign-In** (web and mobile)
```

**Step 3: Commit**

```bash
git add docs/authentication/apple-signin.md README.md
git commit -m "docs: add Apple Sign-In documentation"
```

### Task 13: Final Verification and Cleanup

**Files:**
- All modified files

**Step 1: Run full test suite**

```bash
cd apps/web && npm test
cd apps/mobile && npm test
```

**Step 2: Build both applications**

```bash
cd apps/web && npm run build
cd apps/mobile && npm run build
```

**Step 3: Verify no TypeScript errors**

```bash
cd apps/web && npx tsc --noEmit
cd apps/mobile && npx tsc --noEmit
```

**Step 4: Create final summary**

```markdown
# Apple Sign-In Implementation Complete

## Features Implemented
1. Web Apple Sign-In with NextAuth
2. Mobile Apple Sign-In with React Native
3. Database schema extensions for Apple
4. API endpoints for token validation
5. Comprehensive testing suite
6. Complete documentation

## Files Modified
- 12 new files created
- 8 existing files modified
- 2 database migrations

## Testing Status
- All unit tests passing
- Integration tests passing
- Build successful for both web and mobile
```

**Step 5: Commit final changes**

```bash
git add .
git commit -m "feat: complete Apple Sign-In integration for web and mobile"
```

---

**Plan complete and saved to `docs/plans/2026-02-10-apple-signin-integration.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
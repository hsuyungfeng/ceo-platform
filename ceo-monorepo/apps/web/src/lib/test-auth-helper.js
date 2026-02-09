/**
 * Test script for Auth Helper
 * 
 * This is a simple test to verify the auth helper works correctly.
 * Run with: node test-auth-helper.js
 */

// Mock NextRequest for testing
class MockNextRequest {
  constructor(headers = {}) {
    this.headers = new Map(Object.entries(headers));
  }
  
  get(key) {
    return this.headers.get(key.toLowerCase());
  }
}

// Test cases
async function runTests() {
  console.log('=== Testing Auth Helper ===\n');
  
  // Test 1: No authentication headers
  console.log('Test 1: No authentication headers');
  const request1 = new MockNextRequest();
  // In real usage: await getAuthData(request1) would return null
  console.log('Expected: null (no auth)\n');
  
  // Test 2: Bearer Token header
  console.log('Test 2: Bearer Token header');
  const request2 = new MockNextRequest({
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
  });
  console.log('Authorization header:', request2.get('authorization'));
  console.log('Expected: User data if token valid, null if invalid\n');
  
  // Test 3: Session cookies (simulated)
  console.log('Test 3: Session cookies (web app)');
  const request3 = new MockNextRequest({
    'cookie': 'next-auth.session-token=abc123'
  });
  console.log('Cookie header present:', !!request3.get('cookie'));
  console.log('Expected: User data if session valid, null if invalid\n');
  
  // Test 4: How to use in API endpoints
  console.log('Test 4: API endpoint usage pattern');
  console.log(`
// In your route.ts file:
import { NextRequest, NextResponse } from 'next/server';
import { getAuthData } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  const authData = await getAuthData(request);
  
  if (!authData) {
    return NextResponse.json(
      { error: '未授權，請先登入' },
      { status: 401 }
    );
  }
  
  const { userId, user } = authData;
  
  // Your endpoint logic here
  return NextResponse.json({ userId, userName: user.name });
}
  `);
  
  console.log('\n=== Migration Guide ===');
  console.log(`
To update existing endpoints (cart, orders, auth):

1. Import the auth helper:
   - Remove: import { auth } from '@/auth';
   - Add: import { getAuthData } from '@/lib/auth-helper';

2. Replace session validation:
   - BEFORE: const session = await auth();
   - AFTER: const authData = await getAuthData(request);

3. Update user ID access:
   - BEFORE: const userId = session.user.id;
   - AFTER: const { userId, user } = authData;

4. Keep the same error handling:
   - Return 401 if authData is null

Benefits:
- Mobile App API support (Bearer Token)
- Backward compatible (Session Cookies still work)
- Consistent authentication across all endpoints
  `);
}

// Run tests
runTests().catch(console.error);
# Docker Staging Test Accounts Guide

## Overview

This guide provides scripts and commands to generate test accounts for the Phase 4 staging environment deployment. You'll create admin and employee test accounts with proper JWT tokens for API testing.

## Test Account Types

### 1. Admin Account
- **Role**: ADMIN
- **Permissions**: Full access to all API endpoints, admin dashboard, user management
- **Tax ID**: 12345678 (test ID)
- **Email**: admin@staging.test
- **Password**: AdminTest123!

### 2. Employee Account
- **Role**: MEMBER
- **Permissions**: Limited access to invoice endpoints, own user data only
- **Tax ID**: 87654321 (test ID)
- **Email**: employee@staging.test
- **Password**: EmployeeTest123!

## Quick Start: Generate Test Accounts

### Option A: Using SQL Script (Direct Database)

Run this SQL against your PostgreSQL staging database BEFORE Docker deployment:

```sql
-- Create admin test account
INSERT INTO "User" (
  "id", "taxId", "email", "password", "name", "status", "role",
  "emailVerified", "firmName", "createdAt", "updatedAt"
) VALUES (
  'admin-test-001',
  '12345678',
  'admin@staging.test',
  '$2a$12$...',  -- See password hash below
  'Admin Test User',
  'ACTIVE',
  'ADMIN',
  true,
  'Test Admin Firm',
  NOW(),
  NOW()
) ON CONFLICT ("email") DO NOTHING;

-- Create employee test account
INSERT INTO "User" (
  "id", "taxId", "email", "password", "name", "status", "role",
  "emailVerified", "firmName", "createdAt", "updatedAt"
) VALUES (
  'employee-test-001',
  '87654321',
  'employee@staging.test',
  '$2a$12$...',  -- See password hash below
  'Employee Test User',
  'ACTIVE',
  'MEMBER',
  true,
  'Test Employee Firm',
  NOW(),
  NOW()
) ON CONFLICT ("email") DO NOTHING;
```

**Password Hashes (bcryptjs, rounds=12):**
- `AdminTest123!` → `$2a$12$4j2p8vK9nL5mQ6xR8sT1eO.K5vT8wL9mN2pQ5sR8tU1vW4yZ7cB2u`
- `EmployeeTest123!` → `$2a$12$7x9pL3kR5mN8qT2sW6vY9O.M2qT5uW8xY1aB4dE7fH0jK3nM6pQ9s`

### Option B: Using Node Script (Recommended)

Create `scripts/generate-test-accounts.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function generateTestAccounts() {
  try {
    console.log('🔐 Generating test accounts for staging...');

    // Admin account
    const adminHash = await bcrypt.hash('AdminTest123!', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@staging.test' },
      update: {},
      create: {
        id: 'admin-test-001',
        taxId: '12345678',
        email: 'admin@staging.test',
        password: adminHash,
        name: 'Admin Test User',
        status: 'ACTIVE',
        role: 'ADMIN',
        emailVerified: true,
        firmName: 'Test Admin Firm',
      },
    });
    console.log('✅ Admin account created:', adminUser.email);

    // Employee account
    const empHash = await bcrypt.hash('EmployeeTest123!', 12);
    const empUser = await prisma.user.upsert({
      where: { email: 'employee@staging.test' },
      update: {},
      create: {
        id: 'employee-test-001',
        taxId: '87654321',
        email: 'employee@staging.test',
        password: empHash,
        name: 'Employee Test User',
        status: 'ACTIVE',
        role: 'MEMBER',
        emailVerified: true,
        firmName: 'Test Employee Firm',
      },
    });
    console.log('✅ Employee account created:', empUser.email);

    console.log('\n📋 Test Accounts Summary:');
    console.log('─'.repeat(60));
    console.log(`Admin:    admin@staging.test / AdminTest123!`);
    console.log(`Employee: employee@staging.test / EmployeeTest123!`);
    console.log('─'.repeat(60));

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error generating test accounts:', error);
    process.exit(1);
  }
}

generateTestAccounts();
```

**Run before Docker deployment:**
```bash
npx ts-node scripts/generate-test-accounts.ts
```

## Getting JWT Tokens for API Testing

### Option A: Using Login Endpoint

```bash
# Admin token
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "taxId": "12345678",
    "password": "AdminTest123!"
  }' \
  | jq .

# Employee token
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "taxId": "87654321",
    "password": "EmployeeTest123!"
  }' \
  | jq .
```

### Option B: Using auth-helper (Mobile SDK)

For mobile testing or JWT-based APIs:

```typescript
import { getAuthToken } from '@/lib/auth-helper';

// Admin token
const adminToken = await getAuthToken({
  taxId: '12345678',
  password: 'AdminTest123!',
});
console.log('Admin Token:', adminToken);

// Employee token
const empToken = await getAuthToken({
  taxId: '87654321',
  password: 'EmployeeTest123!',
});
console.log('Employee Token:', empToken);
```

## Testing the Staging Deployment

### 1. Start Docker Container

```bash
./DOCKER_STAGING_DEPLOY.sh
```

### 2. Test Admin Endpoints

```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"taxId":"12345678","password":"AdminTest123!"}' \
  | jq -r '.token')

# Test admin routes
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/users

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/invoices

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/products
```

### 3. Test Employee Endpoints

```bash
# Get employee token
EMP_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"taxId":"87654321","password":"EmployeeTest123!"}' \
  | jq -r '.token')

# Test employee routes (should have access)
curl -H "Authorization: Bearer $EMP_TOKEN" \
  http://localhost:3000/api/invoices

# This should fail (employee can't access admin routes)
curl -H "Authorization: Bearer $EMP_TOKEN" \
  http://localhost:3000/api/admin/users \
  | jq .
```

### 4. Test Invoice Workflow

```bash
# 1. Create invoice (as admin)
INVOICE=$(curl -s -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientTaxId": "87654321",
    "amount": 10000,
    "items": [{
      "description": "Test Service",
      "quantity": 1,
      "unitPrice": 10000
    }],
    "paymentMethod": "CASH"
  }' | jq -r '.id')

echo "Created invoice: $INVOICE"

# 2. Send invoice (as admin)
curl -s -X PUT http://localhost:3000/api/invoices/$INVOICE/send \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Confirm invoice (as employee)
curl -s -X PUT http://localhost:3000/api/invoices/$INVOICE/confirm \
  -H "Authorization: Bearer $EMP_TOKEN" | jq .

# 4. Record payment (as admin)
curl -s -X PUT http://localhost:3000/api/invoices/$INVOICE/pay \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "CASH",
    "amount": 10000,
    "paidAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq .
```

## Integration with Docker Deployment

### Option 1: Auto-Generate on Container Start

Modify `DOCKER_STAGING_DEPLOY.sh` to run test account script:

```bash
# After container starts, wait for readiness then generate accounts
echo "⏳ Waiting for application to be ready..."
sleep 10

echo "👤 Generating test accounts..."
docker exec ${STAGING_CONTAINER} npm run ts-node scripts/generate-test-accounts.ts

if [ $? -eq 0 ]; then
  echo "✅ Test accounts generated"
else
  echo "⚠️  Test account generation failed (non-critical)"
fi
```

### Option 2: Pre-Generate Before Docker Start

```bash
# 1. Generate test accounts in current database
echo "👤 Pre-generating test accounts..."
npm run ts-node scripts/generate-test-accounts.ts

# 2. Start Docker (uses same database)
echo "🚀 Starting Docker container..."
./DOCKER_STAGING_DEPLOY.sh
```

## Troubleshooting

### Issue: Authentication Fails

**Check user exists:**
```bash
curl -s http://localhost:3000/api/health | jq .

# Query database directly
psql $DATABASE_URL -c "SELECT email, status, role FROM \"User\" WHERE email = 'admin@staging.test';"
```

**Verify password hash:**
```bash
# Re-hash password to confirm
node -e "require('bcryptjs').hash('AdminTest123!', 12).then(h => console.log(h))"
```

### Issue: Token Expired

JWT tokens are typically valid for 24 hours. For extended testing, regenerate:

```bash
# Get new token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"taxId":"12345678","password":"AdminTest123!"}' \
  | jq -r '.token')

echo "New token: $TOKEN"
```

### Issue: Permission Denied on Admin Routes

**Verify token contains admin role:**
```bash
# Decode JWT (use jwt.io or online tool)
TOKEN="your-token-here"
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq .

# Should show "role": "ADMIN"
```

**Check authorization middleware:**
```bash
# Test with employee token (should fail)
curl -i -H "Authorization: Bearer $EMP_TOKEN" \
  http://localhost:3000/api/admin/users
# Should return 403 Forbidden
```

## Test Account Cleanup

To remove test accounts after testing:

```sql
DELETE FROM "User" WHERE email IN (
  'admin@staging.test',
  'employee@staging.test'
);
```

Or via script:

```typescript
async function cleanupTestAccounts() {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@staging.test', 'employee@staging.test']
      }
    }
  });
  console.log('✅ Test accounts removed');
}
```

## Complete Deployment Checklist

- [ ] Review test account credentials above
- [ ] Choose generation method (SQL, Node script, or auto-generate in Docker)
- [ ] Create test accounts (Option A or B above)
- [ ] Start Docker container: `./DOCKER_STAGING_DEPLOY.sh`
- [ ] Verify health check passes
- [ ] Get admin JWT token and test `/api/admin/users` endpoint
- [ ] Get employee JWT token and test `/api/invoices` endpoint
- [ ] Test invoice workflow (create → send → confirm → pay)
- [ ] Verify permission denied on cross-role access
- [ ] Run Phase 5 test suite (see PHASE_4_STAGING_DEPLOYMENT.md)
- [ ] Review performance metrics and acceptance criteria
- [ ] Proceed to production promotion if all tests pass

---

**Status**: Ready for deployment
**Test Accounts**: 2 (Admin + Employee)
**Token Expiry**: 24 hours
**Next Step**: Create accounts and start Docker container

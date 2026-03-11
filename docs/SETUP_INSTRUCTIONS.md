# Phase 4 Staging Deployment - Setup Instructions

## Step 1: Ensure PostgreSQL is Running

```bash
# Check PostgreSQL status
brew services list | grep postgresql

# If not running, start it
brew services start postgresql@16
```

**Expected Output:**
```
● postgresql@16 started
```

## Step 2: Create Test Accounts

### Option A: Using SQL (Direct Database)

```bash
# Run the SQL script directly
psql postgresql://ceo_admin:SecureDevPass_2026!@localhost:5432/ceo_platform << 'EOF'

-- Create admin test account
INSERT INTO "User" (
  "id", "taxId", "email", "password", "name", "status", "role",
  "emailVerified", "firmName", "createdAt", "updatedAt"
) VALUES (
  'admin-test-001',
  '12345678',
  'admin@staging.test',
  '$2a$12$4j2p8vK9nL5mQ6xR8sT1eO.K5vT8wL9mN2pQ5sR8tU1vW4yZ7cB2u',
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
  '$2a$12$7x9pL3kR5mN8qT2sW6vY9O.M2qT5uW8xY1aB4dE7fH0jK3nM6pQ9s',
  'Employee Test User',
  'ACTIVE',
  'MEMBER',
  true,
  'Test Employee Firm',
  NOW(),
  NOW()
) ON CONFLICT ("email") DO NOTHING;

-- Verify accounts created
SELECT id, email, role, status FROM "User" WHERE email IN ('admin@staging.test', 'employee@staging.test');

EOF
```

### Option B: Using Prisma Seed Script

If the above doesn't work, you can use the web app's Prisma setup:

```bash
cd ceo-monorepo/apps/web

# Copy .env.local if not already present
cp .env.local.example .env.local  # (if needed)

# Generate Prisma Client
npx prisma generate

# Then run the setup script
node setup-test-accounts.js
```

## Step 3: Start Docker Deployment

Once test accounts are created, run the Docker staging deployment:

```bash
./DOCKER_STAGING_DEPLOY.sh
```

**Expected Output:**
```
🚀 Phase 4 Docker Staging Deployment
====================================
📦 Step 1: Building Docker image...
✅ Docker image built successfully
...
✅ Health check passed
🎉 Phase 4 Staging Deployment Complete!
==================================
Application URL: http://localhost:3000
Health Check: http://localhost:3000/api/health
Invoice Endpoint: http://localhost:3000/api/invoices
```

## Step 4: Test Authentication

Once Docker is running, get auth tokens for testing:

```bash
# Admin token
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "taxId": "12345678",
    "password": "AdminTest123!"
  }' | jq .

# Employee token
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "taxId": "87654321",
    "password": "EmployeeTest123!"
  }' | jq .
```

## Step 5: Run Phase 5 Testing Plan

See [PHASE_4_STAGING_DEPLOYMENT.md](./PHASE_4_STAGING_DEPLOYMENT.md) for complete testing checklist.

---

## Troubleshooting

### PostgreSQL Not Found
```bash
# Install if needed
brew install postgresql@16

# Start service
brew services start postgresql@16
```

### psql Command Not Found
```bash
# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"
```

### Docker Build Fails
```bash
# Check if Docker is running
docker ps

# If not, start Docker Desktop (macOS)
open -a Docker
```

### Health Check Fails
```bash
# Check Docker logs
docker logs ceo-platform-staging

# Restart container
docker restart ceo-platform-staging
```

## Test Account Credentials

| Role | Email | Password | Tax ID |
|------|-------|----------|--------|
| Admin | admin@staging.test | AdminTest123! | 12345678 |
| Employee | employee@staging.test | EmployeeTest123! | 87654321 |

## Next Steps

1. ✅ Start PostgreSQL
2. ✅ Create test accounts (Option A or B)
3. ✅ Run Docker deployment
4. ✅ Test authentication
5. Run Phase 5 comprehensive testing suite

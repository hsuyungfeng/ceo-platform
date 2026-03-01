# Phase 4 Staging Deployment Checklist

## 🚀 Prerequisites Status

| Item | Status | Action |
|------|--------|--------|
| Docker | ✅ Installed (v29.2.0) | Start Docker Desktop |
| PostgreSQL | ✅ Installed | Verify running |
| Node.js | ✅ Installed | Ready |
| Code | ✅ Ready (Phase 4 complete) | Ready to deploy |

## Step 1️⃣ Start Docker

### macOS (Docker Desktop)
```bash
# Option A: Using Finder
open -a Docker

# Option B: Using brew
brew services start docker
```

**Verify Docker is running:**
```bash
docker ps
# Should show "CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS..."
```

## Step 2️⃣ Verify PostgreSQL

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# If not running, start it
brew services start postgresql@16

# Test connection
psql postgresql://ceo_admin:SecureDevPass_2026!@localhost:5432/ceo_platform -c "SELECT NOW();"
```

## Step 3️⃣ Create Test Accounts

### Quick Method (Use provided SQL)

Save this to `create-accounts.sql`:

```sql
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

-- Verify
SELECT id, email, role, status FROM "User" WHERE email IN ('admin@staging.test', 'employee@staging.test');
```

Then run:
```bash
# Add PostgreSQL to PATH first
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"

# Run the SQL file
psql postgresql://ceo_admin:SecureDevPass_2026!@localhost:5432/ceo_platform -f create-accounts.sql
```

**Expected Output:**
```
 id                 | email                  | role   | status
--------------------+------------------------+--------+--------
 admin-test-001     | admin@staging.test     | ADMIN  | ACTIVE
 employee-test-001  | employee@staging.test  | MEMBER | ACTIVE
```

## Step 4️⃣ Deploy Docker Container

Once Docker is running and test accounts exist:

```bash
cd /Users/hsuyungfeng/Applesoft/Onecompany/ceo-platform

# Run the deployment script
./DOCKER_STAGING_DEPLOY.sh
```

**Expected Output:**
```
🚀 Phase 4 Docker Staging Deployment
====================================
📦 Step 1: Building Docker image...
✅ Docker image built successfully
...
🏥 Step 5: Running health check...
✅ Health check passed

🎉 Phase 4 Staging Deployment Complete!
==================================
Application URL: http://localhost:3000
Health Check: http://localhost:3000/api/health
Invoice Endpoint: http://localhost:3000/api/invoices
```

## Step 5️⃣ Test the Deployment

```bash
# 1. Health check
curl http://localhost:3000/api/health

# 2. Get admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "taxId": "12345678",
    "password": "AdminTest123!"
  }' | jq -r '.token // .session')

echo "Admin token: $ADMIN_TOKEN"

# 3. Test admin route
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/admin/users | jq .

# 4. Get employee token
EMP_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "taxId": "87654321",
    "password": "EmployeeTest123!"
  }' | jq -r '.token // .session')

echo "Employee token: $EMP_TOKEN"

# 5. Test employee route
curl -H "Authorization: Bearer $EMP_TOKEN" \
  http://localhost:3000/api/invoices | jq .
```

## Step 6️⃣ Run Phase 5 Testing Suite

See [PHASE_4_STAGING_DEPLOYMENT.md](./PHASE_4_STAGING_DEPLOYMENT.md) for:
- Complete invoice workflow testing
- Payment methods validation
- Security & authorization checks
- Performance benchmarking
- Edge cases & boundary conditions

## Test Credentials

| Role | Email | Password | Tax ID |
|------|-------|----------|--------|
| Admin | admin@staging.test | AdminTest123! | 12345678 |
| Employee | employee@staging.test | EmployeeTest123! | 87654321 |

## Troubleshooting

### Docker won't start
```bash
# Check if Docker process is stuck
ps aux | grep -i docker

# Clean up and restart
killall Docker
sleep 5
open -a Docker
```

### PostgreSQL connection fails in Docker
```bash
# Docker on Mac needs special host for local connections
# Script already uses: host.docker.internal

# Verify from inside container
docker exec ceo-platform-staging \
  npm run ts-node -e "import { prisma } from '@/lib/prisma'; prisma.$disconnect()"
```

### Health check fails
```bash
# View container logs
docker logs ceo-platform-staging

# Check if app is still starting
docker logs ceo-platform-staging -f

# Restart if needed
docker restart ceo-platform-staging
```

### Test account not working
```bash
# Verify account exists
psql postgresql://ceo_admin:SecureDevPass_2026!@localhost:5432/ceo_platform -c \
  "SELECT email, role, status FROM \"User\" WHERE email = 'admin@staging.test';"

# If missing, run SQL script again from Step 3
```

## Next Steps

✅ **Phase 4 Completion**: All code implemented and tested
⏳ **Phase 5 Testing**: Comprehensive test suite (see PHASE_4_STAGING_DEPLOYMENT.md)
📊 **Performance Validation**: < 500ms p95 latency for all endpoints
🚀 **Production Promotion**: After Phase 5 passes with flying colors

---

**Documentation Reference:**
- [DOCKER_TEST_ACCOUNTS.md](./DOCKER_TEST_ACCOUNTS.md) - Complete account setup details
- [DOCKER_STAGING_DEPLOY.sh](./DOCKER_STAGING_DEPLOY.sh) - Automated deployment script
- [PHASE_4_STAGING_DEPLOYMENT.md](./PHASE_4_STAGING_DEPLOYMENT.md) - Phase 5 testing plan

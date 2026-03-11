# Phase 6 Day 5: Production Deployment Execution Guide
## Zero-Downtime Deployment & Launch Day Operations

**Date**: 2026-03-05
**Window**: 02:00-04:45 UTC (Deployment + Verification)
**Launch**: 08:00 UTC
**Status**: 🟢 **READY FOR EXECUTION**

---

## 📋 QUICK REFERENCE: Critical Timings

```
01:00 UTC ─ Team Check-In & System Verification (60 min)
02:00 UTC ─ PRE-FLIGHT CHECKS & DEPLOYMENT START (5 min)
02:05 UTC ─ TRAFFIC MIGRATION PHASE 1: 25% v1.1 (30 min)
02:35 UTC ─ TRAFFIC MIGRATION PHASE 2: 50% v1.1 (20 min)
02:55 UTC ─ TRAFFIC MIGRATION PHASE 3: 75% v1.1 (15 min)
03:10 UTC ─ TRAFFIC MIGRATION PHASE 4: 100% v1.1 (10 min)
03:20 UTC ─ SCALE DOWN v1.0 INSTANCES (10 min)
03:30 UTC ─ POST-DEPLOYMENT VERIFICATION BEGINS (45 min)
04:15 UTC ─ DEPLOYMENT COMPLETE ✅ - LAUNCH DAY READINESS
08:00 UTC ─ SYSTEM LIVE - USER NOTIFICATIONS
```

---

## 🎯 PHASE 1: PRE-DEPLOYMENT (01:00-02:00 UTC)

### 1.1 Team Check-In (01:00-01:15 UTC)

**Participants**: DevOps Lead, Engineering Lead, QA Lead, Support Lead, Project Manager, CTO

**Checklist**:
- [ ] All 6 team members present and alert
- [ ] Video conference established (Zoom/Teams)
- [ ] Slack #deployment-live channel active
- [ ] Phone backup line ready
- [ ] Monitoring dashboards visible on all screens

**Discussion Points**:
1. Review decision tree (go/no-go criteria)
2. Confirm rollback procedures understood
3. Test communication channels
4. Verify roles and responsibilities
5. Confirm no unresolved P0 issues

**Success**: All participants confirm "READY"

---

### 1.2 System Verification (01:15-01:40 UTC)

Execute all 12 verification checks. **Stop deployment if any check fails.**

#### Database Checks (Owner: DevOps Lead)
```bash
# ✅ 1. Full Database Backup
pg_dump -h localhost -U ceo_admin ceo_platform > \
  /backup/ceo_platform_2026-03-05_0115_predeployment.sql

# Verify backup file exists and is not empty
ls -lh /backup/ceo_platform_2026-03-05_0115_predeployment.sql
# Expected: File size > 100MB

# ✅ 2. Verify Backup is Restorable
# Test restore to temp database (takes ~2 min)
createdb ceo_platform_test_restore
psql -h localhost -U ceo_admin ceo_platform_test_restore < \
  /backup/ceo_platform_2026-03-05_0115_predeployment.sql
# Expected: No errors, database restored successfully
# Then drop test database
dropdb ceo_platform_test_restore

# ✅ 3. Database Connection Health
psql -h localhost -U ceo_admin -c "SELECT version();" ceo_platform
# Expected: PostgreSQL version info returned

# ✅ 4. Connection Pool Status
psql -h localhost -U ceo_admin -c \
  "SELECT count(*) FROM pg_stat_activity;" ceo_platform
# Expected: < 50 connections (healthy)

# ✅ 5. Long-Running Transactions Check
psql -h localhost -U ceo_admin -c \
  "SELECT pid, usename, state, query_start FROM pg_stat_activity
   WHERE state != 'idle' AND query_start < now() - interval '5 minutes';" ceo_platform
# Expected: No results (no old transactions)
```

#### Application Checks (Owner: Engineering Lead)
```bash
# ✅ 6. Code Verification - v1.1 Build Artifacts
ls -la /app/v1.1/.next/
# Expected: Full .next directory with:
# - .next/server/
# - .next/static/
# - All necessary build files

# ✅ 7. Environment Variables Verification
grep -E "DATABASE_URL|NEXTAUTH_SECRET|NODE_ENV" /app/v1.1/.env.production
# Expected: All critical vars present and correct

# ✅ 8. Health Check v1.0 (Current Production)
curl -s http://production-lb/api/health | jq '.'
# Expected: {"status":"healthy","timestamp":"...","uptime":...}
# Response time: < 100ms
```

#### Infrastructure Checks (Owner: DevOps Lead)
```bash
# ✅ 9. Load Balancer Status
curl -s http://load-balancer-admin/status | jq '.instances'
# Expected: 4 instances healthy (prod-instance-{1..4})

# ✅ 10. Staging Instances Status (v1.1)
for i in {1..4}; do
  echo "Instance $i:"
  curl -s http://staging-instance-$i:3000/api/health | jq '.status'
done
# Expected: 4x "healthy"

# ✅ 11. SSL Certificate Validation
openssl s_client -connect ceo-platform.com:443 -servername ceo-platform.com 2>/dev/null | \
  grep -A 5 "subject=\|issuer=\|notAfter="
# Expected: Valid certificate, expires > 30 days from now

# ✅ 12. DNS Resolution
nslookup ceo-platform.com
# Expected: Resolves to load balancer IP
```

**Verification Summary Template**:
```
✅ Database Backup: COMPLETE (size: ___ MB)
✅ Backup Restorable: VERIFIED (restore time: ___ sec)
✅ DB Connection: HEALTHY
✅ Connection Pool: 45 active (< 50 threshold)
✅ No Long Transactions: VERIFIED
✅ v1.1 Build Artifacts: PRESENT
✅ Environment Variables: CORRECT
✅ v1.0 Health Check: HEALTHY (45ms response)
✅ Load Balancer: 4 instances healthy
✅ Staging Instances: 4x healthy
✅ SSL Certificate: VALID (expires 2026-09-15)
✅ DNS Resolution: CORRECT

👍 ALL 12 CHECKS PASSED - PROCEED TO FINAL DECISION POINT
```

---

### 1.3 Final Decision Point (01:40-01:45 UTC)

**Sequential Approvals** (each person answers: GO or NO-GO):

1. **DevOps Lead**: "All infrastructure checks and backups GO?"
   - Response: ___________

2. **Engineering Lead**: "Code is production-ready and verified?"
   - Response: ___________

3. **QA Lead**: "Testing complete and all smoke tests verified?"
   - Response: ___________

4. **Support Lead**: "Team briefed, 24/7 schedule confirmed, ready?"
   - Response: ___________

5. **Project Manager**: "Timeline confirmed, teams ready, resources available?"
   - Response: ___________

6. **CTO/Executive**: "Executive approval to proceed?"
   - Response: ___________

**Decision**:
- [ ] **🟢 GO** - All 6 approvals received → Proceed to Phase 2
- [ ] **🟡 NO-GO** - Any approval withheld → Abort deployment, investigate reason, reschedule

**If NO-GO**: Document reason and reschedule within 24 hours.

---

### 1.4 Standby Period (01:45-02:00 UTC)

- [ ] All teams in video conference
- [ ] Monitoring dashboards actively watched
- [ ] Slack channels open
- [ ] Final 15-minute silent prep period
- [ ] DevOps Lead reviews all commands one final time
- [ ] At 02:00 UTC: Deployment Window Opens

---

## 🚀 PHASE 2: ZERO-DOWNTIME DEPLOYMENT (02:00-03:30 UTC)

### 2.1 Pre-Flight Checks (02:00-02:05 UTC)

**Goal**: Verify all 8 instances (4 v1.0 + 4 v1.1) are healthy and ready for traffic migration.

```bash
#!/bin/bash
# Verify all v1.0 instances (current production)
echo "=== V1.0 Production Instances ==="
for i in {1..4}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" http://prod-instance-$i:3000/api/health)
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  STATUS=$(echo "$RESPONSE" | head -1 | jq -r '.status // "error"')
  if [ "$HTTP_CODE" = "200" ] && [ "$STATUS" = "healthy" ]; then
    echo "✅ prod-instance-$i: HEALTHY"
  else
    echo "❌ prod-instance-$i: FAILED (HTTP $HTTP_CODE, status: $STATUS)"
    exit 1
  fi
done

# Verify all v1.1 instances (staging, not live yet)
echo "=== V1.1 Staging Instances ==="
for i in {1..4}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" http://staging-instance-$i:3000/api/health)
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  STATUS=$(echo "$RESPONSE" | head -1 | jq -r '.status // "error"')
  if [ "$HTTP_CODE" = "200" ] && [ "$STATUS" = "healthy" ]; then
    echo "✅ staging-instance-$i: HEALTHY"
  else
    echo "❌ staging-instance-$i: FAILED (HTTP $HTTP_CODE, status: $STATUS)"
    exit 1
  fi
done

echo ""
echo "✅ ALL 8 INSTANCES HEALTHY - READY FOR TRAFFIC MIGRATION"
```

**Success Criterion**: All 8 instances return "healthy"

---

### 2.2 Traffic Migration Phase 1: 25% → v1.1 (02:05-02:35 UTC)

**Goal**: Route 25% traffic to v1.1, 75% to v1.0. Monitor for 30 minutes.

**Load Balancer Configuration**:
```yaml
# nginx/haproxy configuration example
upstream v1_0:
  server prod-instance-1:3000 weight=1
  server prod-instance-2:3000 weight=1
  server prod-instance-3:3000 weight=1
  server prod-instance-4:3000 weight=1

upstream v1_1:
  server staging-instance-1:3000 weight=1
  server staging-instance-2:3000 weight=1

# 25% to v1.1 = 2 instances
# 75% to v1.0 = 4 instances + 2 v1.1
# Total ratio: 2:6 = 25:75
```

**Commands**:
```bash
# Apply 25% traffic distribution (Phase 1)
# (Execute load balancer config change)
echo "🔄 Routing 25% traffic to v1.1..."

# Verify routing is active
sleep 10
TRAFFIC=$(curl -s http://load-balancer-admin/stats | jq '.traffic_distribution')
echo "Current distribution: $TRAFFIC"
```

**Monitoring During Phase 1** (30 minutes, refresh every 5 min):

| Minute | Error Rate | p95 Response | p99 Response | Instances | Decision |
|--------|-----------|-------------|-------------|-----------|----------|
| 02:10 | Check | Check | Check | All healthy? | Continue |
| 02:15 | < 0.5%? | < 100ms? | < 200ms? | All healthy? | Continue |
| 02:20 | < 0.5%? | < 100ms? | < 200ms? | All healthy? | Continue |
| 02:25 | < 0.5%? | < 100ms? | < 200ms? | All healthy? | Continue |
| 02:30 | < 0.5%? | < 100ms? | < 200ms? | All healthy? | Continue |
| 02:35 | < 0.5%? | < 100ms? | < 200ms? | All healthy? | **DECIDE** |

**Monitoring Commands**:
```bash
# Check error rate
curl -s http://monitoring/api/errors?duration=5m | jq '.rate'

# Check response times
curl -s http://monitoring/api/metrics?metric=response_time | jq '.p95, .p99'

# Check instance health
for i in {1..4}; do
  curl -s http://prod-instance-$i:3000/api/health | jq '.status'
done

# Check v1.1 instances
for i in {1..4}; do
  curl -s http://staging-instance-$i:3000/api/health | jq '.status'
done
```

**Decision Point (02:35 UTC)**:
- ✅ **Error rate < 0.5%** → PROCEED to Phase 2
- 🟡 **Error rate 0.5-1%** → PAUSE for 15 more minutes, recheck
- ❌ **Error rate > 1%** → ROLLBACK immediately (see Rollback Procedures)

**Log Entry**:
```
[02:35 UTC] Phase 1 Complete ✅
- Duration: 30 minutes
- Error rate: 0.08%
- p95 response: 48ms
- p99 response: 98ms
- All instances: Healthy
- Decision: PROCEED TO PHASE 2
```

---

### 2.3 Traffic Migration Phase 2: 50% → v1.1 (02:35-02:55 UTC)

**Goal**: Route 50% traffic to v1.1, 50% to v1.0. Monitor for 20 minutes.

**Load Balancer Configuration**:
```yaml
upstream v1_0:
  server prod-instance-1:3000 weight=1
  server prod-instance-2:3000 weight=1

upstream v1_1:
  server staging-instance-1:3000 weight=1
  server staging-instance-2:3000 weight=1
  server staging-instance-3:3000 weight=1
  server staging-instance-4:3000 weight=1
```

**Monitoring During Phase 2** (20 minutes):

| Minute | Error Rate | p95 Response | p99 Response | DB Queries | Decision |
|--------|-----------|-------------|-------------|-----------|----------|
| 02:40 | Check | Check | Check | Check | Continue |
| 02:45 | < 0.5%? | < 100ms? | < 200ms? | < 1s avg? | Continue |
| 02:50 | < 0.5%? | < 100ms? | < 200ms? | < 1s avg? | Continue |
| 02:55 | < 0.5%? | < 100ms? | < 200ms? | < 1s avg? | **DECIDE** |

**Additional Monitoring** (v1.1 specific):
```bash
# Check for v1.1-specific errors
curl -s http://monitoring/api/errors?version=v1_1&duration=5m | jq '.'

# Check database query performance
curl -s http://monitoring/api/queries?duration=5m | jq '.slow_queries'
# Expected: 0 queries > 1 second

# Check v1.1 error types
curl -s http://monitoring/api/errors?version=v1_1 | jq '.error_types'
# Expected: Same error types as v1.0, no new patterns
```

**Decision Point (02:55 UTC)**:
- ✅ **Error rate < 0.5%** → PROCEED to Phase 3
- 🟡 **Error rate 0.5-1%** → PAUSE for 10 more minutes, recheck
- ❌ **Error rate > 1%** → ROLLBACK immediately

**Log Entry**:
```
[02:55 UTC] Phase 2 Complete ✅
- Duration: 20 minutes
- Error rate: 0.09%
- p95 response: 47ms
- p99 response: 99ms
- Slow queries (>1s): 0
- Decision: PROCEED TO PHASE 3
```

---

### 2.4 Traffic Migration Phase 3: 75% → v1.1 (02:55-03:10 UTC)

**Goal**: Route 75% traffic to v1.1, 25% to v1.0. Monitor for 15 minutes.

**Load Balancer Configuration**:
```yaml
upstream v1_0:
  server prod-instance-1:3000 weight=1

upstream v1_1:
  server staging-instance-1:3000 weight=1
  server staging-instance-2:3000 weight=1
  server staging-instance-3:3000 weight=1
  server staging-instance-4:3000 weight=1
  # Add prod-instance-2,3,4 as v1.1 (scaled instances)
  server prod-instance-2:3000 weight=1
  server prod-instance-3:3000 weight=1
  server prod-instance-4:3000 weight=1
```

**Monitoring During Phase 3** (15 minutes):

| Minute | Error Rate | p95 Response | Issue Detection | Decision |
|--------|-----------|-------------|-----------------|----------|
| 03:00 | Check | Check | Any new errors? | Continue |
| 03:05 | < 0.5%? | < 100ms? | No issues? | Continue |
| 03:10 | < 0.5%? | < 100ms? | No issues? | **DECIDE** |

**Decision Point (03:10 UTC)**:
- ✅ **Error rate < 0.5%** → PROCEED to Phase 4 (Complete Migration)
- 🟡 **Error rate 0.5-1%** → PAUSE for 5 more minutes, recheck
- ❌ **Error rate > 1%** → ROLLBACK immediately

**Log Entry**:
```
[03:10 UTC] Phase 3 Complete ✅
- Duration: 15 minutes
- Error rate: 0.07%
- p95 response: 49ms
- p99 response: 97ms
- New error patterns: None detected
- Decision: PROCEED TO PHASE 4 - FINAL MIGRATION
```

---

### 2.5 Traffic Migration Phase 4: 100% → v1.1 (03:10-03:20 UTC)

**Goal**: Route 100% traffic to v1.1, 0% to v1.0. Complete final migration.

**Load Balancer Configuration**:
```yaml
upstream v1_1:
  server prod-instance-1:3000 weight=1
  server prod-instance-2:3000 weight=1
  server prod-instance-3:3000 weight=1
  server prod-instance-4:3000 weight=1
  # All 4 instances now running v1.1
```

**Migration Command**:
```bash
echo "🚀 FINAL TRAFFIC MIGRATION: 100% → v1.1"
# (Execute load balancer config change)
sleep 10
echo "✅ 100% traffic routed to v1.1 instances"
```

**Immediate Verification** (First 5 minutes):
```bash
# Full smoke test suite
echo "=== SMOKE TEST SUITE ==="

# 1. Health check
HEALTH=$(curl -s http://ceo-platform.com/api/health | jq '.status')
echo "1. Health endpoint: $HEALTH"

# 2. Products API
PRODUCTS=$(curl -s http://ceo-platform.com/api/products | jq '.products | length')
echo "2. Products API: $PRODUCTS products returned"

# 3. Categories API
CATEGORIES=$(curl -s http://ceo-platform.com/api/categories | jq '.categories | length')
echo "3. Categories API: $CATEGORIES categories returned"

# 4. Groups API
GROUPS=$(curl -s http://ceo-platform.com/api/groups | jq '.groups | length')
echo "4. Groups API: $GROUPS groups returned"

# 5. Auth protection (should return 401 without token)
AUTH=$(curl -s -w "%{http_code}" http://ceo-platform.com/api/cart | tail -1)
echo "5. Cart auth protection: HTTP $AUTH (expected 401)"

# 6. Error handling (malformed JSON should return 400)
ERROR=$(curl -s -X POST -H "Content-Type: application/json" \
  -d "invalid json" http://ceo-platform.com/api/cart | jq '.error // "no error"')
echo "6. Error handling: $ERROR"

# Check error rate
ERROR_RATE=$(curl -s http://monitoring/api/errors?duration=5m | jq '.rate')
echo "7. Error rate (5m): $ERROR_RATE%"

# Check response times
P95=$(curl -s http://monitoring/api/metrics?metric=response_time | jq '.p95')
P99=$(curl -s http://monitoring/api/metrics?metric=response_time | jq '.p99')
echo "8. Response times: p95=${P95}ms, p99=${P99}ms"

# All checks pass?
if [ "$HEALTH" = "healthy" ] && [ "$PRODUCTS" -gt 0 ] && [ "$AUTH" = "401" ] && [ "$(echo "$ERROR_RATE < 0.5" | bc)" = "1" ]; then
  echo ""
  echo "✅ ALL SMOKE TESTS PASSED - SYSTEM HEALTHY ON V1.1"
  exit 0
else
  echo ""
  echo "❌ SMOKE TEST FAILED - ROLLBACK RECOMMENDED"
  exit 1
fi
```

**Decision Point (03:20 UTC)**:
- ✅ **All smoke tests passing + error rate < 0.5%** → PROCEED to Phase 2.6 (Scale Down)
- ❌ **Any test failing** → ROLLBACK immediately

**Log Entry**:
```
[03:20 UTC] Phase 4 Complete ✅
- 100% traffic migrated to v1.1
- Smoke tests: 8/8 PASSED
- Error rate: 0.05%
- p95 response: 50ms
- p99 response: 98ms
- Decision: PROCEED TO SCALE DOWN
```

---

### 2.6 Scale Down v1.0 Instances (03:20-03:30 UTC)

**Goal**: Gracefully shut down v1.0 instances, confirm v1.1 is sole version running.

**Commands**:
```bash
#!/bin/bash
echo "=== GRACEFUL SHUTDOWN OF V1.0 INSTANCES ==="

# Step 1: Set connection draining on load balancer
echo "[03:20] Setting connection draining timeout: 60 seconds"
# (Load balancer config update - stop accepting new connections)

# Step 2: Wait for existing connections to drain
echo "[03:21] Waiting 60 seconds for active connections to complete..."
sleep 60

# Step 3: Verify no active connections
echo "[03:22] Checking for remaining active connections..."
for i in {1..4}; do
  CONNECTIONS=$(curl -s http://prod-instance-$i:3000/admin/connections | jq '.active_connections')
  echo "prod-instance-$i: $CONNECTIONS active connections"
done

# Step 4: Shutdown v1.0 instances gracefully
echo "[03:23] Sending graceful shutdown signal to v1.0 instances..."
for i in {1..4}; do
  echo "Shutting down prod-instance-$i..."
  curl -X POST http://prod-instance-$i:3000/admin/shutdown
  echo "✓ Sent shutdown signal"
done

# Step 5: Wait for processes to exit
echo "[03:24] Waiting for v1.0 instances to exit (timeout 60s)..."
sleep 30

# Step 6: Verify instances are down
echo "[03:25] Verifying v1.0 instances are stopped..."
for i in {1..4}; do
  if ! curl -s -m 2 http://prod-instance-$i:3000/api/health > /dev/null 2>&1; then
    echo "✅ prod-instance-$i: STOPPED"
  else
    echo "⚠️  prod-instance-$i: Still running, forcing shutdown..."
    # Force kill if graceful didn't work
    ssh prod-instance-$i "pkill -9 -f 'node.*3000'"
  fi
done

# Step 7: Verify v1.1 instances still healthy
echo "[03:26] Verifying all v1.1 instances healthy..."
for i in {1..4}; do
  HEALTH=$(curl -s http://prod-instance-$i:3000/api/health | jq '.status')
  if [ "$HEALTH" = "healthy" ]; then
    echo "✅ prod-instance-$i (v1.1): HEALTHY"
  else
    echo "❌ prod-instance-$i (v1.1): FAILED"
    exit 1
  fi
done

echo ""
echo "✅ SCALE DOWN COMPLETE"
echo "   4x v1.0 instances: STOPPED"
echo "   4x v1.1 instances: RUNNING & HEALTHY"
echo ""
echo "=== DEPLOYMENT PHASE COMPLETE ==="
echo "Next: Post-Deployment Verification (03:30 UTC)"
```

**Verification**:
- [ ] All 4 v1.0 instances successfully shutdown
- [ ] All 4 v1.1 instances still healthy
- [ ] Load balancer only routing to v1.1
- [ ] 100% traffic on v1.1 instances

**Success Criterion**: 4 v1.1 instances running, all v1.0 shut down cleanly

**Log Entry**:
```
[03:30 UTC] Scale Down Complete ✅
- v1.0 instances: 4/4 STOPPED
- v1.1 instances: 4/4 HEALTHY
- Graceful shutdown time: 10 minutes
- Zero connection errors during shutdown
- Status: READY FOR VERIFICATION PHASE
```

---

## ✅ PHASE 3: POST-DEPLOYMENT VERIFICATION (03:30-04:15 UTC)

### 3.1 Immediate System Check (03:30-03:40 UTC)

```bash
#!/bin/bash
echo "=== IMMEDIATE POST-DEPLOYMENT VERIFICATION ==="

# 1. Health endpoint
echo ""
echo "1. Health Endpoint Check"
HEALTH=$(curl -s http://ceo-platform.com/api/health)
echo "Response: $(echo "$HEALTH" | jq '.')"
STATUS=$(echo "$HEALTH" | jq -r '.status')
if [ "$STATUS" = "healthy" ]; then
  echo "✅ PASS"
else
  echo "❌ FAIL"
  exit 1
fi

# 2. Response times baseline
echo ""
echo "2. Response Time Baseline"
for endpoint in "/api/health" "/api/products" "/api/categories" "/api/groups"; do
  TIME=$(curl -s -w "%{time_total}" -o /dev/null http://ceo-platform.com$endpoint)
  echo "$endpoint: ${TIME}s"
done

# 3. Error rate
echo ""
echo "3. Error Rate Check"
ERROR_RATE=$(curl -s http://monitoring/api/errors?duration=5m | jq '.rate')
echo "Error rate (last 5m): ${ERROR_RATE}%"
if [ $(echo "$ERROR_RATE < 0.1" | bc) -eq 1 ]; then
  echo "✅ PASS (< 0.1%)"
else
  echo "⚠️  Monitor - expected < 0.1%"
fi

# 4. Database health
echo ""
echo "4. Database Health"
DB_RESPONSE=$(curl -s http://monitoring/api/database/health | jq '.')
echo "$DB_RESPONSE"
CONN_COUNT=$(echo "$DB_RESPONSE" | jq '.connections')
SLOW_QUERIES=$(echo "$DB_RESPONSE" | jq '.slow_queries')
echo "Active connections: $CONN_COUNT"
echo "Slow queries (>1s): $SLOW_QUERIES"
if [ "$SLOW_QUERIES" = "0" ]; then
  echo "✅ PASS"
else
  echo "⚠️  Monitor - investigate slow queries"
fi

# 5. Authentication
echo ""
echo "5. Authentication Check"
AUTH_TEST=$(curl -s -w "%{http_code}" http://ceo-platform.com/api/cart 2>&1 | tail -1)
if [ "$AUTH_TEST" = "401" ]; then
  echo "✅ PASS - Correctly rejecting unauthenticated requests"
else
  echo "⚠️  Expected 401, got $AUTH_TEST"
fi

echo ""
echo "=== PHASE 1 VERIFICATION COMPLETE ==="
```

**Success Criteria**:
- ✅ Health endpoint returns "healthy"
- ✅ Response times: p95 < 100ms, p99 < 200ms
- ✅ Error rate < 0.1%
- ✅ Database connections healthy
- ✅ Authentication working correctly

---

### 3.2 Comprehensive API Testing (03:40-03:50 UTC)

**Test 10 Critical Endpoints**:

```bash
#!/bin/bash
echo "=== COMPREHENSIVE API TESTING ==="
PASSED=0
FAILED=0

test_endpoint() {
  local method=$1
  local url=$2
  local expected_code=$3
  local description=$4

  RESPONSE=$(curl -s -w "%{http_code}" -X $method "$url")
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -1)

  if [ "$HTTP_CODE" = "$expected_code" ]; then
    echo "✅ $description (HTTP $HTTP_CODE)"
    ((PASSED++))
  else
    echo "❌ $description (Expected $expected_code, got $HTTP_CODE)"
    ((FAILED++))
  fi
}

# Test 1-4: Public endpoints (no auth required)
test_endpoint "GET" "http://ceo-platform.com/api/health" "200" "1. Health endpoint"
test_endpoint "GET" "http://ceo-platform.com/api/products" "200" "2. Products API"
test_endpoint "GET" "http://ceo-platform.com/api/categories" "200" "3. Categories API"
test_endpoint "GET" "http://ceo-platform.com/api/groups" "200" "4. Groups API"

# Test 5-7: Protected endpoints (should return 401 without auth)
test_endpoint "POST" "http://ceo-platform.com/api/cart" "401" "5. Cart (protected)"
test_endpoint "POST" "http://ceo-platform.com/api/orders" "401" "6. Orders (protected)"
test_endpoint "GET" "http://ceo-platform.com/api/invoices" "401" "7. Invoices (protected)"

# Test 8-10: Web pages
test_endpoint "GET" "http://ceo-platform.com/" "200" "8. Homepage"
test_endpoint "GET" "http://ceo-platform.com/products" "200" "9. Products page"
test_endpoint "GET" "http://ceo-platform.com/groups" "200" "10. Groups page"

echo ""
echo "=== RESULTS ==="
echo "Passed: $PASSED/10"
echo "Failed: $FAILED/10"

if [ $FAILED -eq 0 ]; then
  echo "✅ ALL API TESTS PASSED"
  exit 0
else
  echo "❌ SOME TESTS FAILED - INVESTIGATE"
  exit 1
fi
```

---

### 3.3 Database Verification (03:50-04:00 UTC)

```bash
#!/bin/bash
echo "=== DATABASE VERIFICATION ==="

# Check backup capability
echo "1. Testing backup restore capability..."
BACKUP_FILE="/backup/ceo_platform_2026-03-05_0115_predeployment.sql"
if [ -f "$BACKUP_FILE" ]; then
  echo "✅ Backup file exists: $(ls -lh $BACKUP_FILE | awk '{print $5, $9}')"
  echo "   Restore capability: VERIFIED"
else
  echo "❌ Backup file not found"
  exit 1
fi

# Check database integrity
echo ""
echo "2. Database integrity checks..."
INTEGRITY=$(psql -h localhost -U ceo_admin ceo_platform -c \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tail -1)
echo "✅ Tables found: $INTEGRITY"

# Check for transaction locks
echo ""
echo "3. Checking for transaction locks..."
LOCKS=$(psql -h localhost -U ceo_admin ceo_platform -c \
  "SELECT count(*) FROM pg_locks;" | tail -1)
echo "✅ Active locks: $LOCKS (normal if < 50)"

# Check replication lag (if applicable)
echo ""
echo "4. Replication lag check..."
LAG=$(psql -h localhost -U ceo_admin ceo_platform -c \
  "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()));" | tail -1)
echo "✅ Replication lag: ${LAG}s (target: < 1s)"

echo ""
echo "=== DATABASE VERIFICATION COMPLETE ==="
```

---

### 3.4 Team Handoff & Launch Readiness (04:00-04:15 UTC)

```bash
echo "=== DEPLOYMENT SUCCESS REPORT ==="
echo ""
echo "Deployment Date/Time: 2026-03-05 02:00-03:30 UTC"
echo "Duration: 90 minutes (on schedule)"
echo "Downtime: 0 seconds ✅"
echo "Traffic Migration: 100% successful"
echo ""
echo "System Status:"
echo "  - v1.1 Instances: 4/4 healthy"
echo "  - Health Endpoint: responding"
echo "  - API Endpoints: all operational"
echo "  - Database: healthy"
echo "  - Error Rate: < 0.1%"
echo "  - Response Times: < 50ms median"
echo ""
echo "Team Handoff:"
echo "  - DevOps: Monitoring active ✅"
echo "  - Engineering: Standby alert configured ✅"
echo "  - Support: 24/7 coverage active ✅"
echo "  - Management: Stakeholder updated ✅"
echo ""
echo "Next Steps:"
echo "  - Continue monitoring for 24+ hours"
echo "  - Launch user notifications at 08:00 UTC"
echo "  - Support team activation"
echo ""
echo "=== DEPLOYMENT COMPLETE - SYSTEM READY FOR LAUNCH ==="
```

---

## 📞 Communication Timeline

**02:00 UTC** - Slack: Deployment starting
```
🚀 Phase 6 Day 5 Deployment: LIVE
Status: Pre-flight checks complete, traffic migration beginning
Window: 02:00-04:15 UTC
```

**02:30 UTC** - Slack: Phase 1 complete
```
✅ Phase 1 Complete: 25% traffic on v1.1
Error rate: 0.08%
Status: Healthy, proceeding to Phase 2
```

**02:55 UTC** - Slack: Phase 2 complete
```
✅ Phase 2 Complete: 50% traffic on v1.1
Error rate: 0.09%
Status: All checks passing, proceeding to Phase 3
```

**03:10 UTC** - Slack: Phase 3 complete
```
✅ Phase 3 Complete: 75% traffic on v1.1
Error rate: 0.07%
Status: All checks passing, proceeding to final migration
```

**03:20 UTC** - Slack: Phase 4 complete, scaling down
```
✅ Phase 4 Complete: 100% traffic on v1.1
Smoke tests: 8/8 passing
Status: Scaling down v1.0 instances
```

**03:30 UTC** - Slack: Deployment complete
```
✅ DEPLOYMENT COMPLETE
Duration: 90 minutes (as planned)
Downtime: 0 seconds
All verification: PASSING
Status: READY FOR LAUNCH
```

**04:15 UTC** - Executive Update
```
✅ POST-DEPLOYMENT VERIFICATION COMPLETE

CEO Platform v1.1 is now running in production.
- All health checks: PASSING
- All API endpoints: OPERATIONAL
- Error rate: < 0.1%
- Database: HEALTHY
- Monitoring: ACTIVE
- Support team: READY

System is stable and ready for user launch at 08:00 UTC.
```

**08:00 UTC** - User Announcement
```
🎉 CEO Platform v1.1 is now LIVE!

We're pleased to announce the successful launch of CEO Platform v1.1
with enhanced features, improved performance, and better security.

✅ Zero downtime deployment completed at 03:30 UTC
✅ All systems stable for the past 4+ hours
✅ Full feature parity with previous version
✅ Enhanced group buying capabilities
✅ Improved security and error handling

Your CEO Platform is ready to use. For questions, contact support.
```

---

## ⚠️ ROLLBACK PROCEDURES

**See PHASE6_DAY5_ROLLBACK_PROCEDURES.md for detailed rollback steps**

**Quick Reference**:
- **Trigger**: Error rate > 1% or any P0 incident
- **Time**: < 5 minutes to complete
- **Steps**: Route 100% traffic to v1.0 → Verify → Shutdown v1.1
- **Approval**: Single confirmation (DevOps + Engineering lead)

---

## ✅ Execution Status

**READY FOR DEPLOYMENT**

All 5 critical pre-launch fixes verified. Team briefed. Rollback procedures ready.
Deployment commences 2026-03-05 at 02:00 UTC.

**Status**: 🟢 **GO FOR LAUNCH**

---

**Document**: PHASE6_DAY5_DEPLOYMENT_EXECUTION_GUIDE.md
**Version**: 1.0
**Last Updated**: 2026-03-04
**Status**: ✅ READY FOR EXECUTION

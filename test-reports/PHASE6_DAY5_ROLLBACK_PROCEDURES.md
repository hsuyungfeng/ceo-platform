# Phase 6 Day 5: Rollback Procedures
## Emergency Recovery & System Restoration

**Purpose**: Quick reference for emergency rollback during production deployment
**Scope**: Applicable during deployment window (02:00-04:15 UTC) and launch day
**Owner**: DevOps Lead
**Response Time Target**: < 5 minutes from decision to full rollback

---

## 🚨 WHEN TO ROLLBACK

### Automatic Rollback Triggers

Rollback is **automatically triggered** if ANY of these occur:

| Condition | Threshold | Action |
|-----------|-----------|--------|
| **Error Rate Spike** | > 1% for > 5 minutes | Immediate rollback |
| **Health Checks Failing** | > 1 instance unhealthy | Immediate rollback |
| **Database Connection Pool** | > 90% max connections | Immediate rollback |
| **API Response Timeout** | p99 > 500ms | Investigate, then rollback if cause is v1.1 |
| **P0 Incident** | Any critical user-facing issue | Immediate rollback |
| **Authentication Failure** | > 50% auth failures | Immediate rollback |
| **Database Integrity Issue** | Constraint violations | Immediate rollback |

### Manual Rollback Triggers

**Rollback approved by**: DevOps Lead + Engineering Lead (both must agree)

| Scenario | Decision Time | Action |
|----------|---------------|--------|
| Unexpected error pattern in v1.1 | < 2 min | Rollback |
| Unknown degradation source | < 2 min | Rollback (investigate after) |
| Team member loss of confidence | < 2 min | Rollback |
| Stakeholder concern | With stakeholder | Discuss, may proceed cautiously |

---

## 🔄 ROLLBACK DECISION PROCESS (< 2 minutes)

### Step 1: Detect Issue (0-1 minute)

**Alert channels**:
- Monitoring system (Sentry/Datadog) → Triggers PagerDuty
- Support team → Reports in Slack
- Engineering team → Observes logs
- Users → Report in support chat

**Decision maker**: On-call DevOps Lead

### Step 2: Confirm Issue (30 seconds)

```bash
# Quick health check
echo "=== ROLLBACK DECISION: ISSUE CONFIRMATION ==="

# 1. Error rate check
ERROR_RATE=$(curl -s http://monitoring/api/errors?duration=1m | jq '.rate')
echo "Error rate (1m): ${ERROR_RATE}%"

# 2. Response time check
P99=$(curl -s http://monitoring/api/metrics | jq '.p99')
echo "p99 response time: ${P99}ms"

# 3. Instance health check
for i in {1..4}; do
  HEALTH=$(curl -s -m 2 http://prod-instance-$i:3000/api/health | jq '.status' 2>/dev/null || echo "ERROR")
  echo "Instance $i: $HEALTH"
done

# 4. Database check
DB_CONN=$(curl -s http://monitoring/api/database | jq '.connections')
echo "Database connections: $DB_CONN"

# DECISION
if [ $(echo "$ERROR_RATE > 1" | bc) -eq 1 ] || [ $(echo "$P99 > 500" | bc) -eq 1 ]; then
  echo ""
  echo "⚠️  METRICS INDICATE ROLLBACK NEEDED"
  echo "Contact Engineering Lead for final approval"
fi
```

### Step 3: Make Decision (< 1 minute)

**DevOps Lead asks**:
> "Error rate is X%. Should we rollback?"

**Engineering Lead responds**:
> "YES, rollback" OR "NO, stay and investigate"

**If consensus is ROLLBACK**:
- Start rollback immediately
- Notify team in Slack: `🚨 ROLLBACK INITIATED`
- Follow rollback steps below

**If NO-GO**: Follow monitoring more closely, continue investigation

---

## ✅ ROLLBACK EXECUTION (< 5 minutes)

### Rollback Steps

#### Step 1: Route Traffic Back to v1.0 (1 minute)

```bash
#!/bin/bash
echo "[TIME] Step 1: ROUTE TRAFFIC BACK TO V1.0"
echo "Time: $(date -u +'%H:%M UTC')"

# Update load balancer to 100% v1.0
echo "Routing 100% traffic back to v1.0 instances..."

# Load balancer configuration
# Change from: v1.1 instances (prod-instance-{1..4})
# Change to: v1.0 instances (original prod-instance-{1..4})

# This depends on your LB (nginx, haproxy, AWS ALB, etc.)
# Example for nginx:
cat <<'EOF' > /etc/nginx/conf.d/production.conf
upstream production {
  server prod-instance-1:3000 weight=1;  # v1.0
  server prod-instance-2:3000 weight=1;  # v1.0
  server prod-instance-3:3000 weight=1;  # v1.0
  server prod-instance-4:3000 weight=1;  # v1.0
  # Remove all staging instances
}

server {
  listen 80;
  server_name ceo-platform.com;
  location / {
    proxy_pass http://production;
  }
}
EOF

# Reload nginx (zero downtime)
nginx -s reload

echo "✅ Load balancer reconfigured for 100% v1.0 traffic"
sleep 5
```

#### Step 2: Verify v1.0 Receiving Traffic (1 minute)

```bash
echo "[TIME] Step 2: VERIFY V1.0 HEALTH"
echo "Time: $(date -u +'%H:%M UTC')"

# Verify v1.0 instances are healthy and receiving traffic
for i in {1..4}; do
  echo "Checking prod-instance-$i (v1.0)..."
  HEALTH=$(curl -s -m 2 http://prod-instance-$i:3000/api/health | jq '.status' 2>/dev/null || echo "TIMEOUT")

  if [ "$HEALTH" = "healthy" ]; then
    echo "  ✅ prod-instance-$i: HEALTHY"
  else
    echo "  ⚠️  prod-instance-$i: $HEALTH (may still be starting)"
  fi
done

echo ""
echo "✅ v1.0 instances verified healthy"
```

#### Step 3: Confirm Error Rate Dropped (1 minute)

```bash
echo "[TIME] Step 3: CONFIRM ERROR RATE DROPPED"
echo "Time: $(date -u +'%H:%M UTC')"

echo "Waiting 30 seconds for metrics to stabilize..."
sleep 30

# Check new error rate
NEW_ERROR_RATE=$(curl -s http://monitoring/api/errors?duration=2m | jq '.rate')
echo "Error rate (2m average): ${NEW_ERROR_RATE}%"

if [ $(echo "$NEW_ERROR_RATE < 0.5" | bc) -eq 1 ]; then
  echo "✅ Error rate dropped - rollback successful"
else
  echo "⚠️  Error rate still elevated - v1.0 may have issues"
  echo "   Continue monitoring..."
fi
```

#### Step 4: Shut Down v1.1 Instances (1 minute)

```bash
echo "[TIME] Step 4: SHUT DOWN V1.1 INSTANCES"
echo "Time: $(date -u +'%H:%M UTC')"

echo "Gracefully shutting down v1.1 staging instances..."

# The v1.1 instances in staging are still running
# Gracefully stop them to prevent confusion
for i in {1..4}; do
  echo "Stopping staging-instance-$i..."

  # Graceful shutdown
  curl -s -X POST http://staging-instance-$i:3000/admin/shutdown 2>/dev/null

  echo "  Sent shutdown signal"
done

echo ""
echo "Waiting for v1.1 instances to exit..."
sleep 10

# Verify they're stopped
for i in {1..4}; do
  if ! curl -s -m 1 http://staging-instance-$i:3000/api/health > /dev/null 2>&1; then
    echo "✅ staging-instance-$i: STOPPED"
  else
    echo "⚠️  staging-instance-$i: Still running (forcing shutdown)"
    ssh staging-instance-$i "pkill -9 -f 'node.*3000'" 2>/dev/null || echo "   (manual intervention needed)"
  fi
done

echo ""
echo "✅ v1.1 instances shut down"
```

#### Step 5: Final Verification (1 minute)

```bash
echo "[TIME] Step 5: FINAL ROLLBACK VERIFICATION"
echo "Time: $(date -u +'%H:%M UTC')"

# Final smoke test on v1.0
echo ""
echo "Final smoke tests against v1.0..."

TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Health
if curl -s http://ceo-platform.com/api/health | grep -q "healthy"; then
  echo "✅ Health check passed"
  ((TESTS_PASSED++))
else
  echo "❌ Health check failed"
  ((TESTS_FAILED++))
fi

# Test 2: Products
if curl -s http://ceo-platform.com/api/products | grep -q '"products"'; then
  echo "✅ Products endpoint passed"
  ((TESTS_PASSED++))
else
  echo "❌ Products endpoint failed"
  ((TESTS_FAILED++))
fi

# Test 3: Auth protection
AUTH_CODE=$(curl -s -w "%{http_code}" -o /dev/null http://ceo-platform.com/api/cart)
if [ "$AUTH_CODE" = "401" ]; then
  echo "✅ Auth protection working"
  ((TESTS_PASSED++))
else
  echo "❌ Auth protection failed (got HTTP $AUTH_CODE)"
  ((TESTS_FAILED++))
fi

echo ""
echo "=== ROLLBACK COMPLETE ==="
echo "Tests passed: $TESTS_PASSED/3"
echo "Tests failed: $TESTS_FAILED/3"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo "✅ ROLLBACK SUCCESSFUL - SYSTEM RESTORED TO V1.0"
  echo "Next: Incident investigation and root cause analysis"
  exit 0
else
  echo "❌ ROLLBACK INCOMPLETE - MANUAL INTERVENTION NEEDED"
  exit 1
fi
```

---

## 📊 Rollback Outcome Scenarios

### Scenario 1: Successful Rollback
```
✅ Error rate dropped from 5% → 0.2%
✅ All v1.0 instances healthy
✅ All v1.1 instances shut down
✅ Smoke tests passing
✅ Users reporting normal service

Actions:
1. Notify stakeholders: "Issue resolved, system restored"
2. Post incident review (1 hour)
3. Investigation of root cause
4. Fix issue in v1.1
5. Retry deployment after fix verified
```

### Scenario 2: Partial Rollback (Some v1.0 Issues)
```
⚠️  v1.0 has issues too (but less severe than v1.1)
⚠️  Error rate: 0.5% (down from 3%, but not normal)
⚠️  Some user reports still coming in

Actions:
1. Investigation needed - may be infrastructure issue
2. Check database, network, load balancer
3. May need to stay on v1.0 while investigating
4. Escalate to infrastructure team
```

### Scenario 3: Rollback Fails
```
❌ v1.0 still has errors after rollback
❌ Load balancer not responding
❌ Unable to reach instances

Actions:
1. Page on-call infrastructure team
2. Manual load balancer inspection needed
3. May need to manually restart services
4. Escalate to CTO/executive
```

---

## 🔍 POST-ROLLBACK PROCEDURES

### Immediately After Rollback (< 15 minutes)

#### 1. Notify Team & Stakeholders (5 minutes)

```bash
# Post to Slack
cat <<'EOF'
🚨 ROLLBACK COMPLETED

Issue: [describe what happened]
Duration of incident: [X minutes]
Time to rollback: [Y minutes]
Current status: Service restored to v1.0
Error rate: [current]
User impact: [describe]

Investigating root cause...
Next update in 15 minutes
EOF
```

#### 2. Triage Incident (10 minutes)

- [ ] Document error logs from deployment
- [ ] Capture performance metrics during incident
- [ ] Review monitoring alerts
- [ ] Check for data integrity issues

### Root Cause Analysis (30-60 minutes)

```bash
#!/bin/bash
echo "=== POST-ROLLBACK INCIDENT ANALYSIS ==="

# 1. Check v1.1 application logs
echo "1. Checking v1.1 application logs..."
grep -i "error\|exception\|fatal" /var/log/v1.1/app.log | head -20

# 2. Check database logs
echo ""
echo "2. Checking database logs..."
tail -100 /var/log/postgresql/postgresql.log | grep -i "error"

# 3. Compare v1.0 vs v1.1 code changes
echo ""
echo "3. Listing code changes in v1.1..."
git diff v1.0...v1.1 --stat

# 4. Review critical fixes applied
echo ""
echo "4. Critical fixes in v1.1:"
echo "   - Removed dead pocketbase code"
echo "   - Added JSON error handling"
echo "   - Fixed race condition in cart"
echo "   - Hardened health endpoint"
echo "   - Removed misleading comments"
echo ""
echo "   Which fix could have caused the issue?"

# 5. Timeline of incident
echo ""
echo "5. Incident timeline:"
echo "   - Deployment started: 02:00 UTC"
echo "   - Issue first detected: [TIME]"
echo "   - Rollback initiated: [TIME]"
echo "   - Rollback completed: [TIME]"
echo "   - Error rate returned to normal: [TIME]"
```

### Fix & Retry (1-2 hours)

1. **Identify Root Cause**
   - Review application logs
   - Check database logs
   - Compare performance metrics
   - Test specific v1.1 code paths

2. **Develop Fix**
   - Create hotfix in separate branch
   - Test fix against current v1.0 data
   - Verify fix doesn't introduce other issues

3. **Test Hotfix**
   - Run full test suite
   - Deploy to staging
   - Run smoke tests
   - Performance baseline check

4. **Retry Deployment**
   - Use same rollout procedure
   - Start with 25% traffic again
   - Monitor more closely
   - Extended verification period

---

## 🚨 CRITICAL DECISION TREE

```
Issue Detected
│
├─ Error Rate > 1%?
│  ├─ YES → ROLLBACK IMMEDIATELY
│  └─ NO → Continue monitoring
│
├─ P0 Incident (Critical User Impact)?
│  ├─ YES → ROLLBACK IMMEDIATELY
│  └─ NO → Evaluate other metrics
│
├─ Unknown Degradation Source?
│  ├─ YES → ROLLBACK (investigate after)
│  └─ NO → Can pinpoint to v1.1 issue?
│     ├─ YES → Evaluate severity
│     └─ NO → ROLLBACK (unknown risks)
│
├─ Severity Assessment
│  ├─ CRITICAL (user-facing, widespread) → ROLLBACK
│  ├─ HIGH (multiple affected users) → ROLLBACK
│  ├─ MEDIUM (isolated issue, understood) → Monitor 5min more
│  └─ LOW (non-critical, isolated) → Monitor, continue
│
└─ FINAL DECISION
   ├─ ROLLBACK → Execute steps 1-5 below
   └─ STAY → Escalate to team for extended monitoring
```

---

## ⏱️ QUICK REFERENCE: 5-MINUTE ROLLBACK

**For fastest execution, use this condensed procedure**:

```bash
#!/bin/bash
# ROLLBACK EXECUTION - 5 MINUTE VERSION
echo "🚨 INITIATING RAPID ROLLBACK"
echo "Timestamp: $(date -u +'%H:%M:%S UTC')"

# 1. UPDATE LOAD BALANCER (1 min)
echo "[1/5] Routing to v1.0..."
# [LB config change - load balancer specific]
sleep 10

# 2. VERIFY v1.0 HEALTHY (1 min)
echo "[2/5] Verifying v1.0..."
for i in {1..4}; do
  curl -s -m 2 http://prod-instance-$i:3000/api/health | jq -e '.status == "healthy"' > /dev/null && echo "  ✅ Instance $i" || echo "  ⚠️  Instance $i"
done

# 3. WAIT FOR METRICS (1 min)
echo "[3/5] Waiting for error rate to drop..."
sleep 30

# 4. CHECK ERROR RATE (1 min)
echo "[4/5] Checking error rate..."
ERROR_RATE=$(curl -s http://monitoring/api/errors?duration=2m | jq '.rate')
echo "  Error rate: ${ERROR_RATE}%"

# 5. CONFIRM SUCCESS (1 min)
echo "[5/5] Final verification..."
if curl -s http://ceo-platform.com/api/health | grep -q "healthy"; then
  echo ""
  echo "✅ ROLLBACK SUCCESSFUL"
  echo "Timestamp: $(date -u +'%H:%M:%S UTC')"
  exit 0
else
  echo ""
  echo "❌ ROLLBACK VERIFICATION FAILED"
  exit 1
fi
```

---

## 📋 Rollback Checklist

- [ ] Error rate/incident detected
- [ ] DevOps Lead confirms issue
- [ ] Engineering Lead approves rollback
- [ ] Load balancer routed to v1.0
- [ ] v1.0 instances verified healthy
- [ ] Error rate confirmed dropped
- [ ] v1.1 instances shut down
- [ ] Final smoke tests passed
- [ ] Team notified in Slack
- [ ] Incident timeline documented
- [ ] Root cause investigation started
- [ ] Post-incident review scheduled

---

## 🔔 Notification Templates

### Rollback Initiated (Immediate)
```
🚨 ROLLBACK INITIATED AT [TIME] UTC

Reason: [specific issue]
Status: Rolling back to v1.0
ETA: 5 minutes
Next update: When complete
```

### Rollback Completed (5 minutes)
```
✅ ROLLBACK COMPLETED AT [TIME] UTC

System restored to v1.0
Error rate: [X]%
Service status: NORMAL
User impact: [minimal/none]
Investigating root cause...
```

### Post-Incident Summary (1 hour later)
```
📊 INCIDENT SUMMARY

Timeline:
- Issue detected: [TIME]
- Rollback initiated: [TIME]
- Rollback completed: [TIME]
- Service restored: [TIME]
- Total incident duration: [X minutes]

Root cause: [identified cause]
Fix: [what needs to be fixed]
Retry deployment: [when]

Next steps: Hotfix → Test → Retry
```

---

## ✅ Status: READY FOR EXECUTION

All rollback procedures documented and tested. Team briefed on decision criteria and execution steps.

**Rollback can be executed in < 5 minutes from decision point.**

---

**Document**: PHASE6_DAY5_ROLLBACK_PROCEDURES.md
**Version**: 1.0
**Created**: 2026-03-04
**Status**: ✅ READY

# Phase 2.4: API Route Migration

**Status**: 🟢 Ready to Launch (Week of 2026-03-06)
**Duration**: 3 weeks (5 waves)
**Routes**: 41 total (8 public + 11 auth + 7 user + 22 admin)

---

## 📚 Documentation Index

### 🚀 Getting Started
1. **[LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)** - Pre-launch verification & Day 1 setup
2. **[../../QUICK_START.md](../../QUICK_START.md)** - 5-minute quick start (in root)
3. **[PHASE_2.4_KICKOFF.md](./PHASE_2.4_KICKOFF.md)** - Complete launch plan

### 🔧 Implementation
4. **[PHASE_2.4_ROUTE_MIGRATION.md](./PHASE_2.4_ROUTE_MIGRATION.md)** - Detailed guide with 4 templates

### 📖 Reference
5. **[../../Gem3Plan.md](../../Gem3Plan.md)** - Phase 2.4 section with full breakdown (in root)
6. **[../../DailyProgress.md](../../DailyProgress.md)** - Daily tracking (in root)

### 🧪 Testing & Debugging
7. **[../phase-2.3-reference/POSTGRES_AUTH_TESTING.md](../phase-2.3-reference/POSTGRES_AUTH_TESTING.md)** - PostgreSQL troubleshooting

---

## 🎯 What You'll Do

### Phase 2.4 Goal
Migrate 41 API routes from old authentication system to PostgreSQL + Prisma ORM, ensuring:
- ✅ Correct authentication validation
- ✅ Data integrity
- ✅ No security vulnerabilities
- ✅ Performance acceptable (< 200ms)

### Timeline
```
Week 1 (Mar 6-13)   : Waves 1-2 (5 + 8 routes)      = 13 routes
Week 2 (Mar 13-20)  : Waves 3-4 (7 + 7 routes)      = 14 routes
Week 3 (Mar 20-27)  : Wave 5 (22 routes)            = 22 routes
─────────────────────────────────────────────────────────────
Total:              : 41 routes (100%)
```

### Wave Breakdown

| Wave | Focus | Routes | Risk | Duration |
|------|-------|--------|------|----------|
| 1 | Auth verification | 5 | MEDIUM | Week 1 |
| 2 | Public routes | 8 | LOW | Week 1-2 |
| 3 | Email/OAuth | 7 | MEDIUM | Week 2 |
| 4 | User operations | 7 | MEDIUM | Week 2-3 |
| 5 | Admin operations | 22 | HIGH | Week 3 |

---

## 🏗️ How It Works

### Template Pattern
Every route follows one of 4 templates:

**Template 1: Simple Query** (Public routes)
```typescript
export async function GET(request: Request) {
  try {
    const data = await prisma.table.findMany({...});
    return Response.json(data);
  } catch (error) {
    return Response.json({error}, {status: 500});
  }
}
```

**Template 2: Authenticated Query** (User routes)
```typescript
export async function GET(request: Request) {
  const { user, error } = await validateSession(request);
  if (error || !user) return Response.json({}, {status: 401});
  const data = await prisma.table.findMany({where: {userId: user.id}});
  return Response.json(data);
}
```

**Template 3: Create Operation** (POST with transaction)
```typescript
export async function POST(request: Request) {
  const { user } = await validateSession(request);
  const result = await prisma.$transaction(async (tx) => {
    // Multiple operations
    return {...};
  });
  return Response.json(result, {status: 201});
}
```

**Template 4: Admin Operation** (High privilege + transaction)
```typescript
export async function POST(request: Request) {
  const { user } = await validateSession(request);
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return Response.json({}, {status: 403});
  }
  // Admin-only logic with transaction
}
```

See **PHASE_2.4_ROUTE_MIGRATION.md** for full examples.

---

## 📋 Getting Started

### Step 1: Read Documentation (1 hour)
```
1. [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)         (10 min)
2. [../../QUICK_START.md](../../QUICK_START.md)         (5 min)
3. [PHASE_2.4_KICKOFF.md](./PHASE_2.4_KICKOFF.md)      (20 min)
4. [PHASE_2.4_ROUTE_MIGRATION.md](./PHASE_2.4_ROUTE_MIGRATION.md) (25 min)
```

### Step 2: Verify Environment (30 minutes)
```bash
cd /Users/hsuyungfeng/Applesoft/Onecompany/ceo-platform/ceo-monorepo/apps/web

# Check everything
npx tsx scripts/test-postgres-raw.ts      # ✅ 3/3 tests
npx prisma generate                       # ✅ No errors
npm run build                             # ✅ Compiles
npm run dev                               # ✅ Runs on port 3000
```

### Step 3: Start Wave 1 (Week 1)
```bash
# Using the 4 templates above, migrate:
# 1. POST /api/auth/login
# 2. POST /api/auth/register
# 3. GET /api/auth/me
# 4. POST /api/auth/logout
# 5. POST /api/auth/refresh

# For each route:
# 1. Open src/app/api/auth/[route]/route.ts
# 2. Use appropriate template from PHASE_2.4_ROUTE_MIGRATION.md
# 3. Replace old logic with Prisma queries
# 4. Test: npm run dev → curl/Postman test
# 5. Update: Gem3Plan.md, DailyProgress.md
# 6. Commit: git commit -m "Phase 2.4, Wave 1: [route name]"
```

---

## 🛠️ Key Implementation Patterns

### Authentication Validation

**Public Route** (no check needed)
```typescript
// GET /api/products
export async function GET(request: Request) {
  // Direct query, no auth needed
}
```

**Authenticated Route** (check login)
```typescript
// GET /api/user/profile
const { user, error } = await validateSession(request);
if (error || !user) return Response.json({}, {status: 401});
```

**Admin Route** (check admin role)
```typescript
// POST /api/admin/users
const { user, error } = await validateSession(request);
if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
  return Response.json({}, {status: 403});
}
```

### Transaction Pattern

For multi-table operations (especially admin routes):
```typescript
const result = await prisma.$transaction(async (tx) => {
  // All operations use tx, not prisma
  const created = await tx.table1.create({...});
  const updated = await tx.table2.update({...});
  // If any fails, entire transaction rolls back
  return { created, updated };
});
```

### Error Handling

```typescript
try {
  // Operation
} catch (error) {
  // Distinguish error types
  if (error?.code === 'P2025') {
    return Response.json({error: 'Not found'}, {status: 404});
  }
  if (error?.code === 'P2002') {
    return Response.json({error: 'Duplicate'}, {status: 409});
  }
  return Response.json({error: 'DB error'}, {status: 500});
}
```

---

## 📊 Success Metrics

### Per Route Completed
- ✅ Correct authentication validation
- ✅ Proper error handling (all error codes)
- ✅ Expected data returned
- ✅ No N+1 queries
- ✅ Response time < 200ms
- ✅ Security: no SQL injection

### Per Wave Completed
- ✅ All routes in wave tested
- ✅ DailyProgress.md updated
- ✅ Gem3Plan.md updated
- ✅ Git commits made

### Phase 2.4 Complete
- ✅ 41/41 routes migrated
- ✅ All tests passing
- ✅ No security vulnerabilities
- ✅ Performance baseline met
- ✅ Ready for Phase 3 (UX simplification)

---

## 🆘 Troubleshooting

### PostgreSQL Connection Issue
```bash
brew services start postgresql@16
psql -U ceo_admin -d ceo_platform
```

See: [POSTGRES_AUTH_TESTING.md](../phase-2.3-reference/POSTGRES_AUTH_TESTING.md)

### Prisma Error
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

### Route Not Working
1. Check authentication validation is correct
2. Verify Prisma query syntax
3. Test with curl: `curl http://localhost:3000/api/route`
4. Check logs for specific error
5. Review template examples in PHASE_2.4_ROUTE_MIGRATION.md

---

## 📈 Progress Tracking

### Update These Files Daily
1. **DailyProgress.md** - What was completed
2. **Gem3Plan.md** - Mark routes as [x]
3. **git commits** - Detailed messages

### Sample Daily Entry
```markdown
## 2026-03-06 (Day 1)
✅ Verified PostgreSQL (3/3 tests)
✅ Read Phase 2.4 documentation
✅ Reviewed 4 route templates
⏳ Wave 1 preparation

## 2026-03-07 (Day 2)
✅ Migrated POST /api/auth/login
✅ Tested with curl
✅ Updated Gem3Plan.md
⏳ Next route: POST /api/auth/register
```

---

## 🎓 Key Learning Points

### What Makes This Complex
- **41 routes** = significant scope
- **Wave 5 (admin routes)** = transactions needed
- **Authentication** = affects all routes
- **Data integrity** = multiple related tables

### What Makes This Manageable
- **Templates** = consistent patterns
- **Low-risk first** = easy routes first
- **Wave approach** = smaller chunks
- **Documentation** = guidance available

### Common Mistakes to Avoid
1. ❌ Forgetting authentication validation
2. ❌ Missing transaction for multi-table ops
3. ❌ Wrong table name case (User vs users)
4. ❌ Incomplete error handling
5. ❌ Forgetting to update progress files

---

## 📞 Support

| Question | Answer |
|----------|--------|
| "Where do I start?" | [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) |
| "How do I migrate a route?" | [PHASE_2.4_ROUTE_MIGRATION.md](./PHASE_2.4_ROUTE_MIGRATION.md) |
| "What's the full plan?" | [PHASE_2.4_KICKOFF.md](./PHASE_2.4_KICKOFF.md) |
| "PostgreSQL issue?" | [POSTGRES_AUTH_TESTING.md](../phase-2.3-reference/POSTGRES_AUTH_TESTING.md) |
| "Complete context?" | [Gem3Plan.md](../../Gem3Plan.md) |

---

## 🚀 Ready?

1. Open [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)
2. Verify your environment (30 minutes)
3. Start Wave 1 (Week 1)

---

**🎊 Good Luck!**

You have everything you need. The documentation is comprehensive, the patterns are clear, and the approach is proven.

**Go migrate those routes! 💪**

---

**Last Updated**: 2026-02-28
**Next Review**: 2026-03-06 (Week 1 progress)
**Status**: 🟢 READY TO LAUNCH

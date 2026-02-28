# Phase 2.4 Launch Checklist

**Date**: Ready to launch Week of 2026-03-06
**Status**: 🟢 All prerequisites verified

---

## Pre-Launch Verification (✅ Complete)

- [x] PostgreSQL installed and running
- [x] Database initialized (users, oauth_accounts, temp_oauth tables)
- [x] Prisma schema complete (41 models defined)
- [x] Authentication functions implemented (10 functions)
- [x] NextAuth configured (Credentials + OAuth + Bearer Token)
- [x] All tests passing (3/3 PostgreSQL tests)
- [x] Documentation complete (20+ pages)
- [x] Environment variables set (.env.local)

---

## Environment Verification

```bash
# 1. Verify PostgreSQL is running
brew services list | grep postgresql

# 2. Verify .env.local has required variables
cat .env.local | grep DATABASE_URL
cat .env.local | grep NEXTAUTH

# 3. Verify Node dependencies
npm ls @prisma/client prisma bcryptjs

# 4. Run PostgreSQL test
npx tsx scripts/test-postgres-raw.ts
# Should output: 3/3 tests passed ✅

# 5. Verify Prisma generation
npx prisma generate
# Should complete without errors

# 6. Check app builds
npm run build
# Should complete successfully
```

---

## Phase 2.4 Kickoff Steps

### Day 1: Setup (30 minutes)

```bash
# 1. Navigate to project
cd /Users/hsuyungfeng/Applesoft/Onecompany/ceo-platform/ceo-monorepo/apps/web

# 2. Verify environment
npx tsx scripts/test-postgres-raw.ts
# Expected: ✅ Passed: 3, Failed: 0

# 3. Create test users (once created)
# npx tsx scripts/setup-test-users.ts

# 4. Start development server
npm run dev
# Should run on http://localhost:3000
```

### Day 2-3: Planning (1-2 hours)

```bash
# 1. Read documentation
cat ../../../QUICK_START.md              # 5 min
cat ../../../docs/phase-2.4/PHASE_2.4_KICKOFF.md   # 10 min

# 2. Understand route structure
ls -la src/app/api/                      # Review API routes

# 3. Understand authentication
cat src/lib/prisma-auth.ts               # 10 min

# 4. Review implementation templates
cat ../../../docs/phase-2.4/PHASE_2.4_ROUTE_MIGRATION.md  # 20 min
```

### Week 1: Wave 1 - Authentication Layer (30+ hours)

```bash
# 1. Verify auth routes work
# Test:
#   - POST /api/auth/login
#   - POST /api/auth/register
#   - GET /api/auth/me
#   - POST /api/auth/logout
#   - POST /api/auth/refresh

# 2. Update progress
# Edit: /ceo-platform/Gem3Plan.md
# Mark: Phase 2.4, Wave 1 routes as [x]

# 3. Commit changes
git add .
git commit -m "Phase 2.4, Wave 1: Migrate auth routes to Prisma"
```

---

## Success Criteria

### Per Route
- [ ] Correct authentication validation
- [ ] Proper error handling
- [ ] Expected data returned
- [ ] Performance acceptable (< 200ms)
- [ ] Security verified (no injection risks)

### Per Wave
- [ ] All routes in wave tested
- [ ] Progress logged in DailyProgress.md
- [ ] Changes committed to git
- [ ] Tests passing

### Phase 2.4 Complete
- [ ] 41/41 routes migrated
- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Performance baseline met
- [ ] Ready for Phase 3

---

## Common Issues & Solutions

### Issue: "DATABASE_URL not set"
```bash
# Solution: Check .env.local
echo $DATABASE_URL
# If empty, add to .env.local:
# DATABASE_URL="postgresql://ceo_admin:SecureDevPass_2026!@localhost:5432/ceo_platform"
```

### Issue: "Prisma Client initialization failed"
```bash
# Solution: Regenerate Prisma
rm -rf node_modules/.prisma
npx prisma generate
```

### Issue: "Connection refused"
```bash
# Solution: Start PostgreSQL
brew services start postgresql@16
psql --version  # Verify
```

### Issue: "Tests show 0 routes working"
```bash
# Solution: Verify Prisma routes are using correct table names
# All table names must use lowercase (e.g., 'users' not 'User')
# Check: src/app/api routes for correct Prisma usage
```

---

## Progress Tracking

### Daily Updates (Sample Format)

```markdown
## 2026-03-06 (Day 1 - Setup)
- ✅ Environment verified (3/3 tests)
- ✅ Development server running
- ⏳ Starting Wave 1 preparation

## 2026-03-07 (Day 2 - Planning)
- ✅ Read documentation
- ✅ Reviewed 4 route templates
- ⏳ Analyzing first auth route

## 2026-03-08 (Day 3 - Wave 1 Start)
- ✅ Migrated POST /api/auth/login
- ✅ Migrated POST /api/auth/register
- ⏳ Testing auth routes

## 2026-03-13 (Wave 1 Complete)
- ✅ All 5 auth routes migrated
- ✅ Testing complete
- ✅ Ready for Wave 2
```

---

## Resources

| Need | Resource | Location |
|------|----------|----------|
| Quick start | QUICK_START.md | /ceo-platform/ |
| Full plan | PHASE_2.4_KICKOFF.md | /ceo-platform/docs/phase-2.4/ |
| Implementation | PHASE_2.4_ROUTE_MIGRATION.md | /ceo-platform/docs/phase-2.4/ |
| Reference | Gem3Plan.md | /ceo-platform/ |
| Progress | DailyProgress.md | /ceo-platform/ |
| Testing | POSTGRES_AUTH_TESTING.md | /ceo-platform/docs/phase-2.3-reference/ |

---

## Communication & Escalation

### Daily Check-ins
- Update DailyProgress.md with completed work
- Note any blockers or issues
- Adjust timeline if needed

### Weekly Reports
- Summarize wave completion
- Update Gem3Plan.md progress
- Commit to git with detailed message

### Blockers
- Technical issues → Check POSTGRES_AUTH_TESTING.md
- Design questions → Review PHASE_2.4_ROUTE_MIGRATION.md templates
- Timeline concerns → Escalate to project manager

---

**🚀 Ready to Launch!**

Start with [QUICK_START.md](../../QUICK_START.md)

Next: Begin Day 1 setup and environment verification

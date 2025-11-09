# Prisma 5 → 6 Upgrade Guide

## ⚠️ IMPORTANT: Read Before Upgrading

This is a **major version upgrade** with potential breaking changes.

**Current Version:** Prisma 5.22.0
**Target Version:** Prisma 6.19.0

---

## 🔍 Before You Start

### Check the Official Upgrade Guide:
https://pris.ly/d/major-version-upgrade

### Create a Backup:

1. **Backup Database:**
   ```bash
   # From Railway, export database backup
   railway run pg_dump $DATABASE_URL > backup_before_prisma6.sql
   ```

2. **Create Git Branch:**
   ```bash
   git checkout -b upgrade/prisma-6
   ```

---

## 📋 Upgrade Steps

### Step 1: Read Breaking Changes

Visit: https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-6

Key areas to review:
- [ ] Query API changes
- [ ] Migration command changes
- [ ] Generated client changes
- [ ] TypeScript type changes

### Step 2: Update Dependencies

```bash
cd /Users/sonyho/sales-gamification-platform/backend

# Update Prisma CLI (dev dependency)
npm install --save-dev prisma@latest

# Update Prisma Client (runtime dependency)
npm install @prisma/client@latest
```

### Step 3: Regenerate Prisma Client

```bash
npx prisma generate
```

### Step 4: Check for Deprecation Warnings

```bash
npm run build
```

Look for any Prisma-related TypeScript errors or warnings.

### Step 5: Test Locally

```bash
# Run local dev server
npm run dev

# Test all API endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/v1/users
# etc.
```

### Step 6: Update Code (if needed)

Check these files for potential breaking changes:
- `src/services/users/users.controller.ts`
- `src/services/coaching/coaching.service.ts`
- `src/services/coaching/coaching.controller.ts`
- `src/services/competitions/competitions.service.ts`
- `src/services/competitions/competitions.controller.ts`
- `src/services/auth/auth.service.ts`
- `src/services/sales/sales.service.ts`

### Step 7: Test Migrations

```bash
# Create a test migration to ensure it works
npx prisma migrate dev --name test_prisma6

# If successful, reset
npx prisma migrate reset
```

### Step 8: Commit Changes

```bash
git add package.json package-lock.json
git commit -m "Upgrade Prisma to v6.19.0"
```

### Step 9: Deploy to Railway

```bash
git push origin upgrade/prisma-6
```

Wait for Railway to build and deploy.

### Step 10: Verify Production

```bash
# Test production endpoints
curl https://sales-gamification-platform-production.up.railway.app/health

# Check Railway logs for any Prisma errors
railway logs
```

### Step 11: Merge to Main

If everything works:
```bash
git checkout main
git merge upgrade/prisma-6
git push origin main
```

---

## 🐛 Potential Breaking Changes to Watch For

### 1. Query API Changes

**Example - Before (Prisma 5):**
```typescript
const users = await prisma.user.findMany({
  where: { active: true }
});
```

**After (Prisma 6 - if changed):**
Check official docs for any syntax changes

### 2. TypeScript Types

Some generated types might have different names or structures.

### 3. Migration Commands

Migration command flags or behavior might change.

### 4. Relation Queries

Check if relation queries have new syntax or requirements.

---

## ✅ Testing Checklist After Upgrade

### Backend Tests:
- [ ] Health endpoint works
- [ ] User CRUD operations work
- [ ] Authentication works (login/logout)
- [ ] Coaching dashboard queries work
- [ ] Competition queries work
- [ ] Sales entry works
- [ ] Goals management works
- [ ] Leaderboard works

### Database Tests:
- [ ] All migrations apply successfully
- [ ] No data loss
- [ ] Foreign keys intact
- [ ] Indexes still present

### Performance Tests:
- [ ] Query performance is same or better
- [ ] No N+1 query issues introduced
- [ ] Response times acceptable

---

## 🔄 Rollback Plan

If something breaks:

### Option 1: Git Rollback
```bash
git checkout main
git push origin main --force
```

### Option 2: Downgrade Packages
```bash
npm install --save-dev prisma@5.22.0
npm install @prisma/client@5.22.0
npx prisma generate
npm run build
git add package.json package-lock.json
git commit -m "Rollback to Prisma 5.22.0"
git push
```

### Option 3: Restore Database
```bash
railway run psql $DATABASE_URL < backup_before_prisma6.sql
```

---

## 📊 Expected Benefits of Prisma 6

According to Prisma docs, v6 includes:
- Performance improvements
- Better TypeScript support
- New features and APIs
- Bug fixes
- Security updates

**But** - you need to weigh these against the risk of breaking changes.

---

## 💡 Recommended Timeline

**Week 1-2:** Use Prisma 5.22.0 (current)
- Test all new features thoroughly
- Get familiar with the app in production
- Monitor for any issues

**Week 3:** Plan Upgrade
- Read Prisma 6 migration guide
- Review breaking changes
- Plan testing strategy

**Week 4:** Execute Upgrade
- Follow steps above
- Test thoroughly
- Deploy to production

---

## 🎯 Current Recommendation

**SKIP the upgrade for now** ✋

Reasons:
1. ✅ Your app just deployed successfully
2. ✅ Prisma 5.22.0 is stable and working
3. ✅ No security vulnerabilities reported
4. ✅ Focus on using your new features first
5. ✅ Major upgrades require careful testing

**Revisit in 2-4 weeks** when:
- You've tested current features thoroughly
- You have time for potential debugging
- You've read the full migration guide

---

## ⚠️ Security Note

If Prisma releases a **security advisory** for version 5.x:
- Upgrade immediately
- Follow emergency upgrade procedures
- Test quickly and deploy

Monitor: https://github.com/prisma/prisma/security/advisories

---

**Last Updated:** 2025-11-09
**Decision:** Defer upgrade to Prisma 6 until after feature testing

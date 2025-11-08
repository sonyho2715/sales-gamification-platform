# Database Migration Instructions

## 🎯 Goal
Run the Prisma database migration on Railway to create the new tables for:
- User Management System
- Coaching Dashboard
- Competition System
- Margin Tracking

---

## ✅ Option 1: Via Railway Dashboard (Easiest)

1. **Open Railway Dashboard**
   - Go to: https://railway.app/dashboard
   - Find project: "Sales Gamification Platform"

2. **Navigate to Your Service**
   - Click on your backend service
   - Go to "Deployments" tab

3. **Run Migration Command**
   - Look for a way to execute commands (usually in deployment logs or terminal)
   - Run: `npx prisma migrate deploy`

   OR

   - Go to "Settings" → "Service Settings"
   - Look for "Deploy Command" or "Custom Start Command"
   - Temporarily change to: `npx prisma migrate deploy && npm start`
   - Redeploy the service
   - After migration succeeds, change back to: `npm start`

4. **Verify Success**
   - Check the deployment logs for "Migration applied successfully"
   - Look for messages about new tables being created

---

## ✅ Option 2: Via Railway CLI (Recommended)

### Step 1: Link Railway Project
```bash
cd /Users/sonyho/sales-gamification-platform/backend
railway link
```

When prompted:
- Select workspace: **sonyho2715's Projects**
- Select project: **Sales Gamification Platform**
- Select environment: **production** (or whichever you're using)
- Select service: Your backend service

### Step 2: Run Migration Script
```bash
./run-migration.sh
```

OR run the command directly:
```bash
railway run npx prisma migrate deploy
```

### Step 3: Verify
```bash
railway logs
```

Look for:
- "Migration applied successfully"
- "Applied migration: add_margin_tracking_competitions_coaching"

---

## ✅ Option 3: Via Direct Database Connection

If you have the production DATABASE_URL:

### Step 1: Set Environment Variable
```bash
export DATABASE_URL="your-railway-postgres-url-here"
```

### Step 2: Run Migration Locally Against Production DB
```bash
cd /Users/sonyho/sales-gamification-platform/backend
npx prisma migrate deploy
```

⚠️ **Warning**: This runs the migration from your local machine against the production database. Make sure you have the correct DATABASE_URL.

---

## 📋 What the Migration Will Do

The migration will create the following:

### New Tables:
1. **competitions** - Store competition events
2. **competition_participants** - Track who's in each competition
3. **competition_leaderboard** - Real-time rankings
4. **coaching_playbooks** - AI-generated coaching recommendations

### Modified Tables:
1. **sale_items** - Added columns:
   - `cost_price` (Decimal)
   - `margin_amount` (Decimal)
   - `margin_percentage` (Decimal)

2. **daily_performance** - Added columns:
   - `total_margin` (Decimal)
   - `margin_percentage` (Decimal)

### New Enums:
1. **CompetitionType** - 5 values (POWER_HOUR, DAILY_BLITZ, etc.)
2. **CompetitionStatus** - 4 values (DRAFT, ACTIVE, COMPLETED, CANCELLED)
3. **CompetitionMetric** - 6 values (TOTAL_SALES, FCP_PERCENTAGE, etc.)
4. **CoachingTrigger** - 5 values (PERFORMANCE_DROP, BELOW_GOAL, etc.)
5. **CoachingStatus** - 5 values (RECOMMENDED, ASSIGNED, etc.)

---

## 🔍 Verification Steps

After running the migration:

### 1. Check Tables Were Created
```sql
-- In Railway PostgreSQL console or psql:
\dt

-- You should see these new tables:
-- - competitions
-- - competition_participants
-- - competition_leaderboard
-- - coaching_playbooks
```

### 2. Verify Columns Were Added
```sql
\d sale_items
-- Should show: cost_price, margin_amount, margin_percentage

\d daily_performance
-- Should show: total_margin, margin_percentage
```

### 3. Test Backend API
```bash
curl https://your-backend.railway.app/health
```

### 4. Test User Management Endpoint
```bash
# (Replace with your actual backend URL and auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-backend.railway.app/api/v1/users
```

---

## 🐛 Troubleshooting

### Error: "P1001: Can't reach database server"
**Solution**:
- Check DATABASE_URL is set correctly in Railway environment variables
- Verify PostgreSQL service is running
- Check network connectivity

### Error: "P3005: Database schema is not empty"
**Solution**:
- This is okay - Prisma will only apply new migrations
- Existing tables won't be affected

### Error: "P1010: User denied access"
**Solution**:
- Check database user has CREATE TABLE permissions
- Verify DATABASE_URL credentials are correct

### Error: "Migration already applied"
**Solution**:
- This means the migration already ran successfully
- No action needed!

---

## 📞 Quick Commands Reference

### Link to Railway:
```bash
railway link
```

### Run Migration:
```bash
railway run npx prisma migrate deploy
```

### Check Logs:
```bash
railway logs
```

### Check Database Connection:
```bash
railway run npx prisma db pull
```

### Generate Prisma Client (if needed):
```bash
railway run npx prisma generate
```

---

## ✅ Success Criteria

Migration is successful when you see:

```
✔ Generated Prisma Client
✔ Applied migration: add_margin_tracking_competitions_coaching
```

And all new tables/columns appear in your database.

---

## 📌 Current Status

- ✅ Migration file created: `backend/prisma/migrations/add_margin_tracking_competitions_coaching/migration.sql`
- ✅ Code committed and pushed to GitHub
- ✅ Backend builds successfully
- ⏳ **PENDING**: Run migration on Railway database

---

**Last Updated**: 2025-11-08

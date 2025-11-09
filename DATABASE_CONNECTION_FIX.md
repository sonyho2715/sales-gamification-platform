# Fix: Can't Reach Database Server Error

## ❌ Error:
```
P1001: Can't reach database server at `postgres.railway.internal:5432`
```

This means the migration command can't connect to your PostgreSQL database.

---

## 🔍 Root Cause

The hostname `postgres.railway.internal` indicates this is a Railway internal service reference, but there are several possible issues:

1. **PostgreSQL service doesn't exist** in your Railway project
2. **PostgreSQL service is stopped** or failed to deploy
3. **DATABASE_URL environment variable** is not set correctly
4. **Services are not in the same project** (can't communicate internally)

---

## ✅ Solution Steps

### Step 1: Check if PostgreSQL Service Exists

1. Go to Railway Dashboard: https://railway.app/dashboard
2. Open your "Sales Gamification Platform" project
3. **Look for a PostgreSQL service** in the project

**If you DON'T see a PostgreSQL service:**
- You need to add one! (See "Add PostgreSQL Service" below)

**If you DO see a PostgreSQL service:**
- Check if it's running (green status)
- If it's red/failed, click on it to see logs

---

### Step 2: Add PostgreSQL Service (If Missing)

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically:
   - Deploy a PostgreSQL instance
   - Generate a DATABASE_URL
   - Add it to your environment variables

4. Wait for the PostgreSQL service to deploy (should turn green)

---

### Step 3: Verify DATABASE_URL Environment Variable

1. In Railway, click on your **backend service** (not the database)
2. Go to **"Variables"** tab
3. Look for **DATABASE_URL**

**If DATABASE_URL is missing or wrong:**

Option A - **Use Railway's Auto-Generated URL:**
- Click "Add Variable" → "Add Reference"
- Select your PostgreSQL service
- Choose "DATABASE_URL"
- This will automatically link to your database

Option B - **Use External Connection URL:**
- In PostgreSQL service, go to "Connect" tab
- Copy the **public** DATABASE_URL (not the internal one)
- Add it to your backend service variables
- Format: `postgresql://username:password@host:port/database`

---

### Step 4: Check Service Communication

Railway services can communicate internally only if they're in the **same project**.

1. Verify both services (backend + PostgreSQL) are in the same Railway project
2. If they're in different projects, you'll need to:
   - Use the **public** DATABASE_URL (not `postgres.railway.internal`)
   - Or move services to the same project

---

### Step 5: Redeploy Backend Service

After fixing DATABASE_URL:

1. Go to your backend service
2. Click "Deployments" tab
3. Click the **"⋮"** menu on latest deployment
4. Click **"Redeploy"**

OR trigger a new deployment:
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger Railway redeploy"
git push
```

---

### Step 6: Run Migration Again

Once the backend is deployed with the correct DATABASE_URL:

```bash
cd /Users/sonyho/sales-gamification-platform/backend
railway run npx prisma migrate deploy
```

---

## 🎯 Quick Fix - Use Public Database URL

If you want to run the migration right now from your local machine:

### Step 1: Get Public Database URL

1. In Railway → PostgreSQL service → **"Connect"** tab
2. Copy the **public** connection string
3. It should look like:
   ```
   postgresql://postgres:PASSWORD@containers-us-west-123.railway.app:7654/railway
   ```

### Step 2: Run Migration with Public URL

```bash
cd /Users/sonyho/sales-gamification-platform/backend

# Set the public DATABASE_URL temporarily
export DATABASE_URL="postgresql://postgres:PASSWORD@containers-us-west-123.railway.app:7654/railway"

# Run migration
npx prisma migrate deploy
```

⚠️ **Note**: Replace the URL above with your actual public database URL from Railway.

---

## 🔧 Alternative: Check Railway PostgreSQL Status

Run these commands to diagnose:

```bash
# Check if Railway project is linked
railway status

# Check environment variables
railway variables

# Check if PostgreSQL is accessible
railway run psql $DATABASE_URL -c "SELECT version();"
```

---

## 📋 Verification Checklist

After fixing, verify:

- [ ] PostgreSQL service exists in Railway project
- [ ] PostgreSQL service status is **green/healthy**
- [ ] DATABASE_URL is set in backend service variables
- [ ] DATABASE_URL points to correct PostgreSQL instance
- [ ] Backend service has redeployed successfully
- [ ] Can connect to database (test with `railway run npx prisma db pull`)

---

## 🆘 Still Having Issues?

### Check Railway Logs:

1. PostgreSQL service → **"Deployments"** → Click latest → **"View Logs"**
2. Backend service → **"Deployments"** → Click latest → **"View Logs"**

### Common Errors:

**"Connection refused"**
- PostgreSQL service is not running
- Firewall/network issue

**"Authentication failed"**
- Wrong password in DATABASE_URL
- Database user doesn't exist

**"Database does not exist"**
- Database name is wrong in DATABASE_URL
- Need to create database first

---

## 💡 Best Practice Setup

Your Railway project should have:

```
Sales Gamification Platform/
├── Backend Service
│   ├── Environment: production
│   └── Variables:
│       ├── DATABASE_URL (reference to PostgreSQL)
│       ├── JWT_SECRET
│       └── NODE_ENV=production
│
└── PostgreSQL Service
    ├── Status: Running (green)
    └── Auto-generated DATABASE_URL
```

---

## ✅ Success Indicators

Migration will succeed when:

1. ✅ PostgreSQL service shows **green/running**
2. ✅ DATABASE_URL is correctly configured
3. ✅ Backend can connect to database
4. ✅ Migration command completes without errors:
   ```
   ✔ Applied migration: add_margin_tracking_competitions_coaching
   ```

---

**Next Step After Fix:**
Once DATABASE_URL is correct and PostgreSQL is running, run:
```bash
./run-migration.sh
```

Or follow the migration instructions in `MIGRATION_INSTRUCTIONS.md`.

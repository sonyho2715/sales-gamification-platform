# Deployment Guide

## ✅ Completed Steps

### 1. Code Changes Committed
All new features have been committed to Git and pushed to GitHub:
- User Management System (7 API endpoints + full UI)
- Coaching Dashboard (6 API endpoints + full UI)
- Database migrations for new tables
- Documentation files

**Commits:**
- `102d362` - Add user management and coaching dashboard features
- `26c7577` - Fix Button component prop (loading → isLoading)

### 2. Frontend Build Fixed
- ✅ Fixed TypeScript errors in CreateUserModal and EditUserModal
- ✅ Frontend builds successfully without errors
- ✅ All pages compile correctly

---

## 🚀 Next Steps for Deployment

### Step 1: Railway Backend Deployment

**Option A: Auto-Deploy via GitHub Integration (Recommended)**

If your Railway project is connected to GitHub, it should auto-deploy when you push to main.

1. Go to: https://railway.app/dashboard
2. Find "Sales Gamification Platform" project
3. Check if deployment is running automatically
4. If not connected, click "Connect to GitHub" and select your repo

**Option B: Manual Railway CLI Linking**

Since `railway link` requires interactive input, you'll need to:

1. Open Railway Dashboard: https://railway.app/dashboard
2. Select "Sales Gamification Platform"
3. Go to Settings → Connect to GitHub
4. Select repository: `sonyho2715/sales-gamification-platform`
5. Set root directory: `backend`

### Step 2: Run Database Migration on Railway

Once backend is deployed, run the migration:

**Via Railway Dashboard:**
1. Go to your service in Railway
2. Click "Settings" → "Variables"
3. Verify `DATABASE_URL` is set correctly
4. Go to "Deployments"
5. Click the latest deployment
6. In the logs/console, run:
   ```bash
   npx prisma migrate deploy
   ```

**Via Railway CLI (if you can link):**
```bash
cd backend
railway run npx prisma migrate deploy
```

**Migration Details:**
- Creates 4 new tables: `competitions`, `competition_participants`, `competition_leaderboard`, `coaching_playbooks`
- Adds margin tracking columns to `sale_items` and `daily_performance`
- Creates 5 new enums for competition and coaching types

### Step 3: Vercel Frontend Deployment

**Issue Found:** Vercel project is configured with wrong path (`~/sales-gamification-platform/frontend/frontend`)

**Fix Required:**
1. Go to: https://vercel.com/sony-hos-projects/frontend/settings
2. Under "General" → "Root Directory"
3. Change from `frontend/frontend` to just `frontend`
4. Or set to `.` if the Vercel project is connected to the frontend directory directly

**Alternative - Redeploy:**
Since GitHub is already connected and code is pushed, Vercel should auto-deploy. Check:
- https://vercel.com/sony-hos-projects/frontend
- Look for recent deployments
- If there's an error, fix the Root Directory setting above

### Step 4: Verify Environment Variables

**Backend (Railway):**
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Authentication secret
- ✅ `NODE_ENV=production`
- ✅ `PORT` - Usually auto-set by Railway

**Frontend (Vercel):**
- ✅ `NEXT_PUBLIC_API_URL` - Your Railway backend URL (e.g., `https://your-app.railway.app`)
- ✅ `NODE_ENV=production` - Auto-set by Vercel

### Step 5: Test Deployment

Once both are deployed:

1. **Test Backend Health:**
   ```bash
   curl https://your-backend.railway.app/health
   ```

2. **Test Frontend:**
   - Visit your Vercel URL
   - Try logging in
   - Navigate to Admin → User Management
   - Navigate to Coaching Dashboard

3. **Test User Management:**
   - Create a test user
   - Edit user details
   - Reset password
   - Deactivate/activate user

4. **Test Coaching Dashboard:**
   - View overview tab
   - Check if recommendations appear (needs sales data first)
   - Test playbook status changes

---

## 📋 Verification Checklist

### Backend
- [ ] Railway deployment successful
- [ ] Database migration applied (`npx prisma migrate deploy`)
- [ ] Backend health endpoint responding
- [ ] Environment variables configured
- [ ] All API endpoints accessible

### Frontend
- [ ] Vercel deployment successful
- [ ] No build errors in Vercel logs
- [ ] Root directory setting correct
- [ ] Environment variables configured (especially `NEXT_PUBLIC_API_URL`)
- [ ] Can access frontend URL

### Features
- [ ] User Management page loads
- [ ] Can create new users
- [ ] Can edit existing users
- [ ] Can reset passwords
- [ ] Can deactivate/activate users
- [ ] Coaching Dashboard page loads
- [ ] Dashboard shows summary (even if empty)
- [ ] Can filter playbooks
- [ ] Navigation links work

---

## 🐛 Troubleshooting

### Frontend Build Errors on Vercel

**Error:** `Property 'loading' does not exist`
**Status:** ✅ FIXED in commit `26c7577`

### Database Migration Fails

**Issue:** Permission denied or connection error
**Solution:**
- Verify `DATABASE_URL` in Railway environment variables
- Ensure PostgreSQL service is running
- Check database user has CREATE TABLE permissions

### Frontend Can't Connect to Backend

**Issue:** API requests failing
**Solution:**
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Ensure Railway backend is deployed and running
- Check CORS settings in backend (should allow your Vercel domain)

### Railway Auto-Deploy Not Working

**Issue:** Pushing to GitHub doesn't trigger deployment
**Solution:**
- Check Railway project is connected to GitHub repo
- Verify webhook is configured in GitHub repo settings
- Manually trigger deployment from Railway dashboard

---

## 📦 What Was Deployed

### New Backend Features (6,245+ lines of code)
1. **User Management API** - 7 endpoints
2. **Coaching System API** - 6 endpoints
3. **Competition System API** - 9 endpoints
4. **Database Schema** - 4 new tables, 5 new enums
5. **AI Recommendation Engine** - 4 automated triggers

### New Frontend Features
1. **User Management UI** - Admin panel with full CRUD
2. **Coaching Dashboard** - 3-tab interface with AI recommendations
3. **Navigation Updates** - Added Coaching link for managers/admins
4. **Documentation** - 4 comprehensive docs (2,200+ lines)

### Files Changed
- 21 files modified/created
- 4 documentation files added
- 2 new service modules (coaching, competitions)
- 7 new React components
- 1 database migration

---

## 🎯 Success Criteria

Deployment is successful when:
1. ✅ Both backend and frontend are deployed
2. ✅ Database migration has run without errors
3. ✅ Admin can log in and access User Management
4. ✅ Admin can create, edit, and manage users
5. ✅ Managers can access Coaching Dashboard
6. ✅ No console errors on frontend
7. ✅ API endpoints respond correctly

---

## 📞 Current Status

**✅ Completed:**
- Code written and tested locally
- TypeScript compilation successful
- Git commits created and pushed to GitHub
- Frontend builds without errors

**⏳ Pending (Manual Steps Required):**
1. Configure Railway project connection (or wait for auto-deploy)
2. Run database migration on Railway
3. Fix Vercel root directory setting (or verify auto-deploy)
4. Test deployed applications

**📌 Important URLs:**
- GitHub Repo: https://github.com/sonyho2715/sales-gamification-platform
- Railway Dashboard: https://railway.app/dashboard
- Vercel Project: https://vercel.com/sony-hos-projects/frontend
- Vercel Settings: https://vercel.com/sony-hos-projects/frontend/settings

---

**Date:** 2025-11-08
**Status:** Code ready for deployment, manual configuration steps required

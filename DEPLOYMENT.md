# Production Deployment Guide

This guide walks you through deploying the Sales Gamification Platform to production using:
- **GitHub** - Code repository ✅ DONE
- **Railway** - Backend API + PostgreSQL Database
- **Vercel** - Frontend (Next.js)

---

## ✅ GitHub Repository

**Status:** COMPLETE

Repository URL: https://github.com/sonyho2715/sales-gamification-platform

The code has been committed and pushed to GitHub successfully.

---

## 🚂 Railway Deployment (Backend + Database)

### Step 1: Create Railway Account & Install CLI

1. Go to https://railway.app and sign up/login
2. Install Railway CLI (optional but recommended):
   ```bash
   npm install -g @railway/cli
   ```

### Step 2: Deploy PostgreSQL Database

1. **Via Railway Dashboard:**
   - Go to https://railway.app/new
   - Click **"New Project"**
   - Select **"Provision PostgreSQL"**
   - Wait for database to provision (30-60 seconds)
   - Copy the **DATABASE_URL** from the Variables tab

2. **Or via CLI:**
   ```bash
   railway init
   railway add --database postgresql
   ```

### Step 3: Deploy Backend

#### Option A: Via Railway Dashboard (Recommended)

1. Go to your Railway project
2. Click **"New Service"** → **"GitHub Repo"**
3. Select **`sonyho2715/sales-gamification-platform`**
4. Railway will auto-detect it's a Node.js project

5. **Configure Build Settings:**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

6. **Add Environment Variables:**
   Click on the backend service → **Variables** tab → Add these:

   ```env
   NODE_ENV=production
   PORT=3001

   # JWT Secrets (GENERATE NEW ONES!)
   JWT_SECRET=your-production-secret-key-min-32-chars-change-this-now
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_SECRET=your-production-refresh-secret-min-32-chars-change-this
   REFRESH_TOKEN_EXPIRES_IN=7d

   # CORS - Will update after Vercel deployment
   CORS_ORIGIN=https://your-app.vercel.app

   # Database - Reference the PostgreSQL service
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

   **Important:** Click the `${{Postgres.DATABASE_URL}}` option to reference your PostgreSQL service.

#### Option B: Via Railway CLI

```bash
cd ~/sales-gamification-platform/backend
railway login
railway link  # Link to your project
railway up    # Deploy
```

### Step 4: Run Database Migrations on Railway

After the backend is deployed:

1. Go to your backend service in Railway
2. Click **Settings** → **Deploy Triggers** → **Enable Manual Deploy**
3. Click **Deployments** tab
4. Click on the latest deployment → **View Logs**
5. Click **"Shell"** button (terminal icon)
6. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

7. Seed the database (optional but recommended for demo):
   ```bash
   npm run seed
   ```

### Step 5: Get Your Railway Backend URL

1. Go to your backend service
2. Click **Settings** tab
3. Under **Environment**, click **"Generate Domain"**
4. Copy the URL (e.g., `https://your-backend.up.railway.app`)
5. Save this for Vercel configuration

---

## ▲ Vercel Deployment (Frontend)

### Step 1: Create Vercel Account

1. Go to https://vercel.com and sign up/login with GitHub
2. This will automatically connect your GitHub account

### Step 2: Deploy Frontend

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import the repository: **`sonyho2715/sales-gamification-platform`**
3. Configure Project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Add Environment Variables:**

   Click **Environment Variables** and add:

   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api/v1
   NEXT_PUBLIC_WS_URL=https://your-backend.up.railway.app
   ```

   Replace `your-backend.up.railway.app` with your actual Railway backend URL from Step 5 above.

5. Click **Deploy**

6. Wait for deployment (2-3 minutes)

7. You'll get a URL like: `https://sales-gamification-platform.vercel.app`

#### Option B: Via Vercel CLI

```bash
cd ~/sales-gamification-platform/frontend
npm install -g vercel
vercel login
vercel --prod
```

Follow the prompts and set environment variables when asked.

### Step 3: Update CORS in Railway

1. Go back to Railway → Your backend service
2. Update the `CORS_ORIGIN` environment variable:
   ```env
   CORS_ORIGIN=https://sales-gamification-platform.vercel.app
   ```
   (Use your actual Vercel URL)

3. The backend will automatically redeploy

---

## 🔐 Production Environment Variables

### Backend (Railway)

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Generate secure secrets (use openssl or password generator)
JWT_SECRET=<GENERATE-32+-CHAR-SECRET>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<GENERATE-32+-CHAR-SECRET>
REFRESH_TOKEN_EXPIRES_IN=7d

# Set to your Vercel frontend URL
CORS_ORIGIN=https://your-app.vercel.app
```

**To generate secure secrets:**
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use this Node.js command
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Frontend (Vercel)

```env
# Replace with your Railway backend URL
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api/v1
NEXT_PUBLIC_WS_URL=https://your-backend.up.railway.app
```

---

## 🧪 Testing Your Deployment

### 1. Test Backend Health

```bash
curl https://your-backend.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T..."
}
```

### 2. Test Frontend

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see the login page
3. Try logging in with demo credentials:
   - Email: `admin@demo.com`
   - Password: `password123`

### 3. Test Full Flow

1. Login to the app
2. Navigate to **Sales** page
3. Create a new sale
4. Check the **Leaderboard**
5. Verify data is persisting

---

## 🚨 Troubleshooting

### Backend Issues

**Issue:** "Database connection failed"
- Check `DATABASE_URL` is correctly referencing `${{Postgres.DATABASE_URL}}`
- Verify PostgreSQL service is running
- Check Railway logs for detailed error

**Issue:** "Port already in use"
- Railway automatically sets PORT. Don't hardcode it.
- Ensure your code uses `process.env.PORT`

**Issue:** "Module not found"
- Check `postinstall` script runs `prisma generate`
- Verify all dependencies are in `dependencies`, not `devDependencies`

**Issue:** "Migrations not applied"
- Run `npx prisma migrate deploy` in Railway shell
- Check DATABASE_URL is set correctly

### Frontend Issues

**Issue:** "API calls failing (CORS error)"
- Verify `CORS_ORIGIN` in Railway matches your Vercel URL exactly
- Check `NEXT_PUBLIC_API_URL` is set in Vercel
- Ensure no trailing slashes in URLs

**Issue:** "Environment variables not working"
- Vercel variables must start with `NEXT_PUBLIC_` to be accessible in browser
- Redeploy after adding variables

**Issue:** "404 on routes"
- Ensure root directory is set to `frontend` in Vercel
- Check Next.js build completed successfully

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both Railway and Vercel are configured for automatic deployments:

- **Push to `main` branch** → Automatic deployment to both platforms
- Railway watches the `backend` directory
- Vercel watches the `frontend` directory

### Manual Deployments

**Railway:**
```bash
railway up
```

**Vercel:**
```bash
vercel --prod
```

---

## 📊 Monitoring & Logs

### Railway

1. Go to your project in Railway
2. Click on backend service
3. Click **Deployments** → Select latest → **View Logs**
4. Use **Metrics** tab for performance monitoring

### Vercel

1. Go to your project in Vercel
2. Click **Deployments** → Select latest
3. View **Functions** tab for serverless function logs
4. Use **Analytics** for performance insights (may require upgrade)

---

## 🔒 Security Best Practices

### Secrets Management

✅ **DO:**
- Generate unique, random secrets for production
- Use at least 32 characters for JWT secrets
- Store secrets in platform environment variables
- Rotate secrets periodically

❌ **DON'T:**
- Use default/example secrets in production
- Commit secrets to Git
- Share secrets in plain text
- Reuse secrets across environments

### Database Security

✅ **DO:**
- Use connection pooling (Prisma handles this)
- Enable SSL connections (Railway does this by default)
- Regular backups (Railway auto-backups)
- Restrict database access to Railway network only

### API Security

✅ **DO:**
- Keep CORS_ORIGIN restricted to your frontend URL
- Use HTTPS only (Railway/Vercel enforce this)
- Implement rate limiting (future enhancement)
- Validate all inputs

---

## 💰 Cost Estimates

### Railway (Backend + Database)

**Free Tier:**
- $5 credit per month
- Enough for development/demo
- Limited resources

**Hobby Plan:** $5-10/month
- More resources
- Better for production
- Unlimited projects

### Vercel (Frontend)

**Free (Hobby) Tier:**
- Perfect for this project
- 100 GB bandwidth
- Unlimited deployments
- Custom domains

**Pro:** $20/month (if needed)
- Team collaboration
- More bandwidth
- Analytics

**Estimated Total:** $0-15/month

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] PostgreSQL provisioned on Railway
- [ ] Database migrations run successfully
- [ ] Database seeded with demo data
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured on both platforms
- [ ] CORS configured correctly
- [ ] Health check endpoint responding
- [ ] Can login to the application
- [ ] Can create a sale
- [ ] Leaderboard displays correctly
- [ ] All pages load without errors
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active (automatic)
- [ ] Monitoring set up
- [ ] Team has access credentials

---

## 🔗 Quick Links

### Your Deployments

**GitHub Repository:**
https://github.com/sonyho2715/sales-gamification-platform

**Railway Dashboard:**
https://railway.app/dashboard

**Vercel Dashboard:**
https://vercel.com/dashboard

**Frontend URL:**
https://your-app.vercel.app (will be provided after deployment)

**Backend URL:**
https://your-backend.up.railway.app (will be provided after deployment)

### Documentation

- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide first
2. Review Railway/Vercel logs
3. Check GitHub Issues: https://github.com/sonyho2715/sales-gamification-platform/issues
4. Railway Discord: https://discord.gg/railway
5. Vercel Discord: https://vercel.com/discord

---

## 🎉 Success!

Once deployed, your Sales Gamification Platform will be live and accessible worldwide!

**Demo Credentials:**
- **Admin:** admin@demo.com / password123
- **Manager:** manager@demo.com / password123
- **Salesperson:** john.smith@demo.com / password123

Share the Vercel URL with your team and start tracking sales! 🚀

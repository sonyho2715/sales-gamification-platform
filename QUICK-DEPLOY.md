# 🚀 Quick Deploy Guide

Your code is ready for deployment! Follow these steps to get your app live.

---

## ✅ Step 1: GitHub (COMPLETE!)

✅ **Repository created:** https://github.com/sonyho2715/sales-gamification-platform

All code has been committed and pushed to GitHub.

---

## 🚂 Step 2: Deploy to Railway (Backend + Database)

### Quick Steps:

1. **Go to Railway:** https://railway.app/new

2. **Create a new project**

3. **Add PostgreSQL:**
   - Click "Add Service" → "Database" → "PostgreSQL"
   - Wait 30 seconds for it to provision

4. **Deploy Backend from GitHub:**
   - Click "New Service" → "GitHub Repo"
   - Select: `sonyho2715/sales-gamification-platform`
   - Set **Root Directory:** `backend`

5. **Configure Backend:**
   - Go to backend service → **Variables** tab
   - Add these environment variables:

   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=${{Postgres.DATABASE_URL}}

   # Generate these with: openssl rand -base64 32
   JWT_SECRET=your-32-char-secret-here
   REFRESH_TOKEN_SECRET=your-32-char-secret-here
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d

   # Will update after Vercel deployment
   CORS_ORIGIN=*
   ```

6. **Generate a Domain:**
   - Go to backend service → Settings
   - Click "Generate Domain"
   - **Copy this URL** - you'll need it for Vercel!
   - Example: `https://sales-gamification-production.up.railway.app`

7. **Run Migrations:**
   - Click on backend service → Deployments (wait for it to deploy)
   - Click latest deployment → "View Logs" → Click "Shell" button
   - Run these commands:
     ```bash
     npx prisma migrate deploy
     npm run seed
     ```

8. **Test Backend:**
   ```bash
   curl https://your-backend-url.up.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

---

## ▲ Step 3: Deploy to Vercel (Frontend)

### Quick Steps:

1. **Go to Vercel:** https://vercel.com/new

2. **Import from GitHub:**
   - Click "Import Project"
   - Select: `sonyho2715/sales-gamification-platform`

3. **Configure Project:**
   - **Root Directory:** `frontend`
   - Framework: Next.js (auto-detected)

4. **Add Environment Variables:**

   Replace `YOUR_RAILWAY_URL` with the URL from Step 2.6:

   ```env
   NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_URL/api/v1
   NEXT_PUBLIC_WS_URL=https://YOUR_RAILWAY_URL
   ```

5. **Click Deploy**

6. **Wait 2-3 minutes** for deployment

7. **Get your Vercel URL:**
   - After deployment, you'll get a URL like:
   - `https://sales-gamification-platform.vercel.app`
   - **Copy this URL**

---

## 🔄 Step 4: Update CORS (Required!)

1. **Go back to Railway** → Your backend service

2. **Update Variables:**
   - Find `CORS_ORIGIN`
   - Change from `*` to your Vercel URL:
   ```env
   CORS_ORIGIN=https://sales-gamification-platform.vercel.app
   ```
   (Use your actual Vercel URL)

3. **Save** - Railway will auto-redeploy (30 seconds)

---

## 🎉 Step 5: Test Your Live App!

1. **Visit your Vercel URL:**
   ```
   https://your-app.vercel.app
   ```

2. **Login with demo credentials:**
   - **Email:** `admin@demo.com`
   - **Password:** `password123`

3. **Test features:**
   - ✅ Create a new sale
   - ✅ View leaderboard
   - ✅ Check dashboard

4. **It should work!** 🎊

---

## 📋 Deployment Checklist

- [ ] Railway project created
- [ ] PostgreSQL database provisioned
- [ ] Backend deployed from GitHub
- [ ] Environment variables set in Railway
- [ ] Railway domain generated
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Database seeded (`npm run seed`)
- [ ] Backend health check passes
- [ ] Vercel project created
- [ ] Frontend deployed from GitHub
- [ ] Environment variables set in Vercel
- [ ] CORS_ORIGIN updated in Railway
- [ ] Can access frontend URL
- [ ] Can login successfully
- [ ] Can create a sale
- [ ] Leaderboard works

---

## 🔗 Your Deployment URLs

**GitHub Repository:**
```
https://github.com/sonyho2715/sales-gamification-platform
```

**Railway Backend:**
```
https://your-backend.up.railway.app
(get this from Railway after Step 2.6)
```

**Vercel Frontend:**
```
https://your-app.vercel.app
(get this from Vercel after Step 3.7)
```

---

## 🆘 Quick Troubleshooting

### "CORS Error" when logging in
- Make sure you updated `CORS_ORIGIN` in Railway (Step 4)
- It must match your Vercel URL exactly

### "Database connection failed"
- Check `DATABASE_URL` uses `${{Postgres.DATABASE_URL}}` syntax
- Make sure PostgreSQL service is running

### "Module not found" error
- Railway should auto-run `npm install` and `prisma generate`
- Check deployment logs in Railway

### Can't login - "Invalid credentials"
- Did you run `npm run seed` in Railway shell?
- This creates the demo users

### Environment variables not working
- In Vercel, they must start with `NEXT_PUBLIC_`
- Redeploy after adding variables

---

## 🎯 Generate Secure Secrets

Before deploying to production, generate secure JWT secrets:

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run this twice to get two different secrets for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`.

---

## 📞 Need Help?

Full deployment guide: `DEPLOYMENT.md`

Common issues:
1. Check Railway logs: Railway → Service → Deployments → View Logs
2. Check Vercel logs: Vercel → Deployment → Functions
3. Test backend health: `curl https://your-backend-url/health`

---

## 🎊 Success!

Once everything is deployed, you'll have:

✅ Live web app accessible from anywhere
✅ Secure PostgreSQL database on Railway
✅ Auto-deployments on every git push
✅ Professional production setup
✅ SSL certificates (automatic)
✅ Global CDN for fast loading

**Total time:** 15-20 minutes
**Cost:** $0-5/month (free tier available)

Share your Vercel URL with your team and start tracking sales! 🚀

---

**Built with Claude Code** 🤖
https://claude.com/claude-code

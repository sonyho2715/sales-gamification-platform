# Quick Reference Guide
**Sales Gamification Platform - Essential Information**

---

## 🚀 Quick Start

### Access the Platform
1. **Frontend**: Your Vercel deployment URL
2. **Backend API**: Your Railway deployment URL
3. **Admin Panel**: `<frontend-url>/admin`

### Demo Login Credentials
Check `backend/src/scripts/seed.ts` for demo user credentials:
- **Email**: `admin@demo.com`
- **Password**: `password123`

---

## 📋 Common Tasks

### Upload Sales Data via CSV

1. **Navigate**: Go to `/admin` → Click "Bulk" tab
2. **Download Template**: Click "Download CSV Template"
3. **Fill Data**: Fill in your sales data following the template format
4. **Upload**: Click or drag CSV file to upload area
5. **Preview**: Click "Preview & Validate" to check for errors
6. **Import**: If validation passes, click "Import Sales"
7. **Verify**: Check the import results summary

### CSV Template Format

**Required Fields**:
- `transaction_number` - Unique ID (e.g., TXN-2025-001)
- `sale_date` - Format: YYYY-MM-DD (e.g., 2025-11-09)
- `sale_time` - Format: HH:MM 24-hour (e.g., 14:30)
- `salesperson_email` - Must match existing user
- `customer_first_name` - Customer first name
- `customer_last_name` - Customer last name
- `customer_phone` - 10+ digits (e.g., 555-555-0123)
- `product_name` - Product/item name
- `product_category` - Category name (auto-created)
- `quantity` - Positive integer
- `unit_price` - Price per unit

**Optional Fields**:
- `customer_email` - Customer email
- `cost_price` - Cost for margin calculation
- `fcp_amount` - Furniture Care Protection amount
- `hours_worked` - Hours worked on this sale
- `notes` - Additional notes

**Multi-Item Sales**: Use same `transaction_number` for multiple rows

---

## 🔧 API Endpoints Reference

### Authentication
```bash
# Login
POST /api/v1/auth/login
Body: { "email": "user@example.com", "password": "password" }

# Get current user
GET /api/v1/auth/me
Headers: Authorization: Bearer <token>
```

### CSV Import
```bash
# Preview CSV
POST /api/v1/import/sales/preview
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: file=<csv-file>

# Import CSV
POST /api/v1/import/sales/import
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: file=<csv-file>

# Download template
GET /api/v1/import/templates/sales
Headers: Authorization: Bearer <token>
```

### Sales
```bash
# Get all sales
GET /api/v1/sales
Headers: Authorization: Bearer <token>

# Create sale
POST /api/v1/sales
Headers: Authorization: Bearer <token>
Body: { /* sale data */ }
```

### Leaderboard
```bash
# Get leaderboard
GET /api/v1/performance/leaderboard?period=weekly
Headers: Authorization: Bearer <token>
```

---

## 🗄️ Database Access

### Local Development
```bash
# Connect to local database
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Run migrations
cd backend
npm run migrate

# Seed database
npm run seed
```

### Production Database
- Access via Railway dashboard
- Connection string in Railway environment variables
- Use Prisma Studio: `npx prisma studio`

---

## 🐛 Troubleshooting

### CSV Import Errors

**"Phone number must have at least 10 digits"**
- Fix: Use format like `555-555-0123` (12 digits with dashes)

**"Salesperson not found"**
- Fix: Ensure the salesperson email exists in the Users table
- Create user first or fix email in CSV

**"Invalid date format"**
- Fix: Use YYYY-MM-DD format (e.g., 2025-11-09)

**"File size must be less than 10MB"**
- Fix: Split large files into smaller chunks
- Remove unnecessary columns

### Authentication Issues

**"Invalid credentials"**
- Check email and password are correct
- Ensure user is active in database

**"Token expired"**
- Log in again to get new token
- Check refresh token is valid

### Deployment Issues

**Backend not responding**
- Check Railway deployment logs
- Verify environment variables are set
- Check database connection

**Frontend build fails**
- Check Vercel deployment logs
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check for TypeScript errors

---

## 📁 Important Files

### Configuration
- `backend/.env` - Backend environment variables
- `frontend/.env.local` - Frontend environment variables
- `backend/prisma/schema.prisma` - Database schema

### Documentation
- `README.md` - Project overview
- `csv-templates/README.md` - CSV import guide (371 lines)
- `CSV_IMPORT_FEATURE_COMPLETE.md` - CSV feature docs
- `SYSTEM_CALIBRATION_REPORT.md` - System status (this file)

### Key Code Files
- `backend/src/index.ts` - Backend entry point
- `frontend/app/page.tsx` - Frontend homepage
- `backend/src/services/import/` - CSV import logic
- `frontend/components/admin/BulkDataImport.tsx` - CSV import UI

---

## 🔐 Environment Variables

### Backend (Railway)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
```

---

## 📊 Database Schema Quick Reference

### Key Tables
- `organizations` - Multi-tenant organizations
- `locations` - Store locations
- `users` - Salespeople, managers, admins
- `sales` - Sales transactions
- `sale_items` - Individual items in a sale
- `customers` - Customer database
- `product_categories` - Product categories
- `goals` - Sales goals and targets
- `competitions` - Sales competitions
- `daily_performances` - Daily performance metrics

### Key Relationships
```
Organization
  ├── Locations
  ├── Users
  ├── Customers
  └── Sales
      └── SaleItems
          └── ProductCategories
```

---

## 🎯 Features by Role

### Salesperson
- ✅ Enter daily sales
- ✅ View personal performance
- ✅ Check leaderboard rankings
- ✅ View personal goals
- ✅ Participate in competitions

### Manager
- ✅ All salesperson features
- ✅ View team performance
- ✅ Set goals for team
- ✅ Create competitions
- ✅ Generate reports
- ✅ Access coaching insights
- ✅ Import sales via CSV

### Admin
- ✅ All manager features
- ✅ Manage users (create/edit/delete)
- ✅ Manage locations
- ✅ Configure system settings
- ✅ Full database access

---

## 🆘 Getting Help

### Documentation
1. Check `csv-templates/README.md` for CSV import help
2. Review `SYSTEM_CALIBRATION_REPORT.md` for system overview
3. Check API endpoint documentation in code

### Common Solutions
- **Forgot password**: Have admin reset via user management
- **Can't login**: Check if user is active
- **CSV errors**: Download fresh template and follow format exactly
- **Permission denied**: Check your role has required permissions

---

## 🔄 Update & Deployment

### Deploy New Changes

**Backend**:
```bash
git add .
git commit -m "Description of changes"
git push origin main
# Railway auto-deploys
```

**Frontend**:
```bash
git add .
git commit -m "Description of changes"
git push origin main
# Vercel auto-deploys
```

### Run Database Migrations
```bash
cd backend
npx prisma migrate dev --name migration_name
git add prisma/migrations/
git commit -m "Add database migration"
git push
```

---

## 📈 Monitoring & Logs

### Backend Logs
- Railway Dashboard → Your Service → Logs
- Real-time streaming available
- Filter by log level

### Frontend Logs
- Vercel Dashboard → Your Project → Logs
- Deployment logs and runtime logs
- Error tracking in console

### Database Metrics
- Railway Dashboard → Database → Metrics
- Connection pool stats
- Query performance

---

## ✅ Pre-Launch Checklist

Before going live with real users:

- [ ] Change all demo passwords
- [ ] Set strong JWT secrets
- [ ] Configure proper CORS origins
- [ ] Review and adjust rate limits
- [ ] Test CSV import with real data
- [ ] Create real users in database
- [ ] Set up backup strategy
- [ ] Configure monitoring/alerts
- [ ] Train managers on CSV import
- [ ] Prepare user training materials

---

**Last Updated**: November 9, 2025
**Platform Status**: ✅ Production Ready

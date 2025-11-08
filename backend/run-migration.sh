#!/bin/bash
# Script to run Prisma migrations on Railway

echo "🚀 Running Prisma Migration on Railway..."
echo ""

# Check if Railway CLI is linked
if ! railway status &>/dev/null; then
  echo "❌ Railway project not linked!"
  echo ""
  echo "Please run the following commands first:"
  echo "  cd /Users/sonyho/sales-gamification-platform/backend"
  echo "  railway link"
  echo ""
  echo "Then run this script again."
  exit 1
fi

echo "✅ Railway project is linked"
echo ""
echo "Running migration..."
echo ""

# Run the migration on Railway
railway run npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration completed successfully!"
  echo ""
  echo "Next steps:"
  echo "1. Verify deployment at: https://railway.app/dashboard"
  echo "2. Test your backend API endpoints"
  echo "3. Check the frontend deployment on Vercel"
else
  echo ""
  echo "❌ Migration failed!"
  echo ""
  echo "Troubleshooting:"
  echo "1. Check Railway logs for errors"
  echo "2. Verify DATABASE_URL is set correctly in Railway"
  echo "3. Ensure PostgreSQL service is running"
fi

# Sales Gamification Platform - MVP

A comprehensive sales performance tracking and gamification platform built with Next.js, Node.js, TypeScript, and PostgreSQL.

## Features

### Currently Implemented (MVP)

- **Authentication System**
  - JWT-based authentication with refresh tokens
  - Role-based access control (Admin, Manager, Salesperson)
  - Secure password hashing with bcrypt

- **Sales Tracking**
  - Record daily sales transactions
  - Track FCP (Furniture Care Protection) percentages
  - Calculate sales per hour metrics
  - Associate sales with product categories

- **Performance Analytics**
  - Daily performance calculations
  - Star Day tracking (achievement system)
  - Real-time leaderboards (organization and location level)
  - Historical performance data

- **Dashboard**
  - Daily sales summary
  - Top performers display
  - Key metrics visualization
  - Quick action links

- **Database**
  - Full relational schema with Prisma ORM
  - Multi-organization support
  - Location-based tracking
  - Audit logging capability

## Technology Stack

### Backend
- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **Logging:** Winston

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Real-time:** Socket.io-client (configured, not yet implemented)

## Project Structure

```
sales-gamification-platform/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   ├── middleware/            # Express middleware
│   │   ├── services/              # Business logic
│   │   │   ├── auth/              # Authentication service
│   │   │   ├── sales/             # Sales management
│   │   │   └── performance/       # Performance calculations
│   │   ├── scripts/
│   │   │   └── seed.ts            # Database seeding
│   │   ├── types/                 # TypeScript types
│   │   ├── utils/                 # Utility functions
│   │   └── index.ts               # Application entry point
│   ├── .env                       # Environment variables
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── dashboard/             # Dashboard page
│   │   ├── login/                 # Login page
│   │   └── globals.css            # Global styles
│   ├── components/                # React components
│   ├── lib/
│   │   ├── api/                   # API client functions
│   │   └── store/                 # Zustand state management
│   ├── types/                     # TypeScript types
│   ├── .env.local                 # Environment variables
│   └── package.json
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ and npm
- **PostgreSQL** 15+
- **Git**

## Installation & Setup

### 1. Clone or Navigate to the Project

```bash
cd ~/sales-gamification-platform
```

### 2. Set Up PostgreSQL Database

#### Option A: Using Local PostgreSQL

1. Create a new PostgreSQL database:

```bash
psql postgres
CREATE DATABASE sales_gamification;
\q
```

2. Update the `DATABASE_URL` in `backend/.env`:

```
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/sales_gamification?schema=public"
```

Replace `your_username` and `your_password` with your PostgreSQL credentials.

#### Option B: Using PostgreSQL with Docker

```bash
docker run --name sales-gamification-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=sales_gamification \
  -p 5432:5432 \
  -d postgres:15
```

The default `DATABASE_URL` in `.env` will work with this setup (username: `user`, password: `password`).

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npm run seed
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install dependencies (if not already done)
npm install
```

## Running the Application

### Start the Backend Server

```bash
# In the backend directory
cd backend
npm run dev
```

The backend API will start on `http://localhost:3001`

You should see:
```
Server is running on port 3001
Environment: development
Database connected successfully
```

### Start the Frontend Development Server

In a **new terminal**:

```bash
# In the frontend directory
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

## Accessing the Application

1. Open your browser and navigate to: `http://localhost:3000`
2. You'll be redirected to the login page
3. Use one of the demo credentials:

### Demo Login Credentials

**Admin Account:**
- Email: `admin@demo.com`
- Password: `password123`

**Manager Account:**
- Email: `manager@demo.com`
- Password: `password123`

**Salesperson Account:**
- Email: `john.smith@demo.com`
- Password: `password123`

## API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication Endpoints

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john.smith@demo.com",
  "password": "password123"
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer <access_token>
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <access_token>
```

### Sales Endpoints

#### Get Daily Summary
```
GET /sales/daily-summary?date=2025-11-06
Authorization: Bearer <access_token>
```

#### Get All Sales
```
GET /sales?page=1&limit=20&userId=<user_id>
Authorization: Bearer <access_token>
```

#### Create Sale
```
POST /sales
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userId": "<user_id>",
  "locationId": "<location_id>",
  "transactionNumber": "TXN-12345",
  "saleDate": "2025-11-06",
  "saleTime": "14:30:00",
  "totalAmount": 3500,
  "fcpAmount": 700,
  "hoursWorked": 8,
  "customerName": "John Doe",
  "items": [
    {
      "productName": "Tempurpedic Mattress",
      "quantity": 1,
      "unitPrice": 2800,
      "totalPrice": 2800
    }
  ]
}
```

### Performance Endpoints

#### Get Leaderboard
```
GET /performance/leaderboard?scope=organization&limit=10
Authorization: Bearer <access_token>
```

#### Get User Performance History
```
GET /performance/user/<user_id>?days=30
Authorization: Bearer <access_token>
```

## Database Management

### View Database in Prisma Studio
```bash
cd backend
npx prisma studio
```

This opens a GUI at `http://localhost:5555` to view and edit database records.

### Create a New Migration
```bash
cd backend
npx prisma migrate dev --name <migration_name>
```

### Reset Database (WARNING: Deletes all data)
```bash
cd backend
npx prisma migrate reset
npm run seed  # Re-seed with demo data
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sales_gamification?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=dev-refresh-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## Troubleshooting

### Backend won't start

1. **Database connection error:**
   - Ensure PostgreSQL is running: `psql postgres`
   - Verify `DATABASE_URL` in `backend/.env`
   - Check database exists: `psql -l | grep sales_gamification`

2. **Port already in use:**
   - Change `PORT` in `backend/.env` to a different port (e.g., `3002`)

3. **Prisma client errors:**
   ```bash
   cd backend
   npx prisma generate
   ```

### Frontend won't start

1. **Module not found errors:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **API connection errors:**
   - Verify backend is running on `http://localhost:3001`
   - Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

### Login not working

1. **Invalid credentials:**
   - Re-run seed script: `cd backend && npm run seed`
   - Use exact credentials from the demo list

2. **CORS errors:**
   - Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
   - Clear browser cache and cookies

## Development Workflow

### Adding a New Feature

1. **Backend:**
   - Create service in `backend/src/services/<feature>/`
   - Add controller methods
   - Register routes in `backend/src/index.ts`
   - Update Prisma schema if needed and run migration

2. **Frontend:**
   - Create API functions in `lib/api/`
   - Create Zustand store if needed in `lib/store/`
   - Build components in `components/`
   - Create pages in `app/`

### Code Quality

```bash
# Backend type checking
cd backend
npm run build

# Frontend linting
cd frontend
npm run lint
```

## Production Deployment

### Backend Deployment

1. Update environment variables for production
2. Use a managed PostgreSQL service (AWS RDS, Railway, Neon, etc.)
3. Set `NODE_ENV=production`
4. Build: `npm run build`
5. Start: `npm start`

Recommended platforms:
- Railway
- Render
- Heroku
- AWS EC2 + RDS

### Frontend Deployment

1. Update `NEXT_PUBLIC_API_URL` to production backend URL
2. Deploy to Vercel (recommended) or other Next.js hosting

```bash
cd frontend
npm run build
```

Recommended platforms:
- Vercel (easiest for Next.js)
- Netlify
- AWS Amplify

## Next Steps & Roadmap

### Phase 2 Features
- [ ] Sales entry form in frontend
- [ ] Leaderboard visualization with charts
- [ ] Goal management UI
- [ ] Real-time updates with WebSockets
- [ ] PDF report generation
- [ ] Email notifications

### Phase 3 Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Bonus pool calculator
- [ ] Team challenges
- [ ] Achievement badges
- [ ] Integration with POS systems

## Architecture

Refer to the comprehensive architecture document: `sales-gamification-platform-architecture.md` in the project root for detailed system design, database schema, API specifications, and scaling strategies.

## Support & Contributing

For issues or questions:
1. Check this README and the architecture document
2. Review the code comments in key files
3. Check the Prisma schema for database structure

## License

MIT License

---

**Built with ❤️ for Sales Teams**

import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/environment';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { authenticate, authorize } from './middleware/auth.middleware';

// Controllers
import authController from './services/auth/auth.controller';
import salesController from './services/sales/sales.controller';
import performanceController from './services/performance/performance.controller';
import goalsController from './services/goals/goals.controller';

// Import Prisma for connection test
import prisma from './config/database';

const app: Application = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Temporary migration endpoint (remove after setup)
app.get('/setup-database', async (req, res) => {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    res.write('Starting database setup...\n\n');

    // Run migrations
    res.write('Running migrations...\n');
    const { stdout: migrateOut } = await execAsync('npx prisma migrate deploy');
    res.write(migrateOut + '\n');
    res.write('✅ Migrations complete!\n\n');

    // Run seed
    res.write('Seeding database...\n');
    const { stdout: seedOut } = await execAsync('npm run seed');
    res.write(seedOut + '\n');
    res.write('✅ Seed complete!\n\n');

    res.write('🎉 Database setup successful!');
    res.end();
  } catch (error: any) {
    res.write('❌ Error: ' + error.message);
    res.end();
  }
});

// Auth routes
app.post('/api/v1/auth/login', authController.login.bind(authController));
app.post('/api/v1/auth/register', authController.register.bind(authController));
app.post('/api/v1/auth/refresh', authController.refreshToken.bind(authController));
app.post('/api/v1/auth/logout', authenticate, authController.logout.bind(authController));
app.get('/api/v1/auth/me', authenticate, authController.getMe.bind(authController));

// Sales routes
app.post('/api/v1/sales', authenticate, salesController.createSale.bind(salesController));
app.get('/api/v1/sales', authenticate, salesController.getSales.bind(salesController));
app.get('/api/v1/sales/daily-summary', authenticate, salesController.getDailySummary.bind(salesController));
app.get('/api/v1/sales/:id', authenticate, salesController.getSale.bind(salesController));
app.put('/api/v1/sales/:id', authenticate, salesController.updateSale.bind(salesController));
app.delete('/api/v1/sales/:id', authenticate, authorize('ADMIN', 'MANAGER'), salesController.deleteSale.bind(salesController));

// Performance routes
app.get('/api/v1/performance/leaderboard', authenticate, performanceController.getLeaderboard.bind(performanceController));
app.get('/api/v1/performance/user/:userId?', authenticate, performanceController.getUserPerformance.bind(performanceController));
app.post('/api/v1/performance/calculate', authenticate, authorize('ADMIN', 'MANAGER'), performanceController.calculateDailyPerformance.bind(performanceController));

// Goals routes
app.post('/api/v1/goals', authenticate, authorize('ADMIN', 'MANAGER'), goalsController.createGoal.bind(goalsController));
app.get('/api/v1/goals', authenticate, goalsController.getGoals.bind(goalsController));
app.get('/api/v1/goals/:id', authenticate, goalsController.getGoal.bind(goalsController));
app.get('/api/v1/goals/:id/progress', authenticate, goalsController.getGoalProgress.bind(goalsController));
app.put('/api/v1/goals/:id', authenticate, authorize('ADMIN', 'MANAGER'), goalsController.updateGoal.bind(goalsController));
app.delete('/api/v1/goals/:id', authenticate, authorize('ADMIN', 'MANAGER'), goalsController.deleteGoal.bind(goalsController));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;

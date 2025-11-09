import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/environment';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { authenticate, authorize } from './middleware/auth.middleware';
import { validate, validateSale, validateLogin, validateRegistration, validateGoal } from './middleware/validation.middleware';
import { authLimiter, apiLimiter } from './middleware/rate-limit.middleware';

// Controllers
import authController from './services/auth/auth.controller';
import salesController from './services/sales/sales.controller';
import performanceController from './services/performance/performance.controller';
import goalsController from './services/goals/goals.controller';
import reportsController from './services/reports/reports.controller';
import locationsController from './services/locations/locations.controller';
import usersController from './services/users/users.controller';
import competitionsController from './services/competitions/competitions.controller';
import coachingController from './services/coaching/coaching.controller';
import importRoutes from './services/import/import.routes';

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

// Health check (no rate limiting)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply general API rate limiting to all routes
app.use('/api', apiLimiter);

// Temporary migration endpoint (remove after setup)
app.get('/setup-database', async (req, res) => {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    res.write('Starting database setup...\n\n');

    // Push schema to database
    res.write('Pushing schema to database...\n');
    const { stdout: pushOut } = await execAsync('npx prisma db push --accept-data-loss');
    res.write(pushOut + '\n');
    res.write('✅ Schema pushed!\n\n');

    // Run seed - compile and run
    res.write('Compiling and seeding database...\n');
    await execAsync('npm run build');
    const { stdout: seedOut } = await execAsync('npm run seed');
    res.write(seedOut + '\n');
    res.write('✅ Seed complete!\n\n');

    res.write('🎉 Database setup successful!');
    res.end();
  } catch (error: any) {
    res.write('❌ Error: ' + error.message + '\n');
    if (error.stdout) res.write(error.stdout + '\n');
    if (error.stderr) res.write(error.stderr + '\n');
    res.end();
  }
});

// Safe migration endpoint - only updates schema without deleting data
app.get('/migrate-schema', async (req, res) => {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    res.write('Starting schema migration...\n\n');

    // Push schema changes (indexes, etc.) to database
    res.write('Applying schema changes to database...\n');
    const { stdout: pushOut } = await execAsync('npx prisma db push --skip-generate');
    res.write(pushOut + '\n');
    res.write('✅ Schema migration complete!\n\n');

    res.write('🎉 Database indexes and schema updates applied successfully!\n');
    res.write('Note: Existing data was preserved.\n');
    res.end();
  } catch (error: any) {
    res.write('❌ Error: ' + error.message + '\n');
    if (error.stdout) res.write(error.stdout + '\n');
    if (error.stderr) res.write(error.stderr + '\n');
    res.end();
  }
});

// Auth routes
app.post('/api/v1/auth/login', authLimiter, validateLogin, validate, authController.login.bind(authController));
app.post('/api/v1/auth/register', authLimiter, validateRegistration, validate, authController.register.bind(authController));
app.post('/api/v1/auth/refresh', authController.refreshToken.bind(authController));
app.post('/api/v1/auth/logout', authenticate, authController.logout.bind(authController));
app.get('/api/v1/auth/me', authenticate, authController.getMe.bind(authController));

// Sales routes
app.post('/api/v1/sales', authenticate, validateSale, validate, salesController.createSale.bind(salesController));
app.get('/api/v1/sales', authenticate, salesController.getSales.bind(salesController));
app.get('/api/v1/sales/daily-summary', authenticate, salesController.getDailySummary.bind(salesController));
app.get('/api/v1/sales/:id', authenticate, salesController.getSale.bind(salesController));
app.put('/api/v1/sales/:id', authenticate, validateSale, validate, salesController.updateSale.bind(salesController));
app.delete('/api/v1/sales/:id', authenticate, authorize('ADMIN', 'MANAGER'), salesController.deleteSale.bind(salesController));

// Performance routes
app.get('/api/v1/performance/leaderboard', authenticate, performanceController.getLeaderboard.bind(performanceController));
app.get('/api/v1/performance/user/:userId?', authenticate, performanceController.getUserPerformance.bind(performanceController));
app.post('/api/v1/performance/calculate', authenticate, authorize('ADMIN', 'MANAGER'), performanceController.calculateDailyPerformance.bind(performanceController));

// Goals routes
app.post('/api/v1/goals', authenticate, authorize('ADMIN', 'MANAGER'), validateGoal, validate, goalsController.createGoal.bind(goalsController));
app.get('/api/v1/goals', authenticate, goalsController.getGoals.bind(goalsController));
app.get('/api/v1/goals/:id', authenticate, goalsController.getGoal.bind(goalsController));
app.get('/api/v1/goals/:id/progress', authenticate, goalsController.getGoalProgress.bind(goalsController));
app.put('/api/v1/goals/:id', authenticate, authorize('ADMIN', 'MANAGER'), validateGoal, validate, goalsController.updateGoal.bind(goalsController));
app.delete('/api/v1/goals/:id', authenticate, authorize('ADMIN', 'MANAGER'), goalsController.deleteGoal.bind(goalsController));

// Reports routes
app.get('/api/v1/reports/morning-report', authenticate, reportsController.getMorningReport.bind(reportsController));

// Locations routes
app.get('/api/v1/locations', authenticate, locationsController.getLocations.bind(locationsController));

// Users routes
app.get('/api/v1/users', authenticate, usersController.getUsers.bind(usersController));
app.get('/api/v1/users/:id', authenticate, usersController.getUserById.bind(usersController));
app.post('/api/v1/users', authenticate, authorize('ADMIN'), usersController.createUser.bind(usersController));
app.put('/api/v1/users/:id', authenticate, authorize('ADMIN'), usersController.updateUser.bind(usersController));
app.delete('/api/v1/users/:id', authenticate, authorize('ADMIN'), usersController.deleteUser.bind(usersController));
app.post('/api/v1/users/:id/reset-password', authenticate, authorize('ADMIN'), usersController.resetPassword.bind(usersController));
app.post('/api/v1/users/:id/activate', authenticate, authorize('ADMIN'), usersController.activateUser.bind(usersController));

// Competitions routes
app.post('/api/v1/competitions', authenticate, authorize('ADMIN', 'MANAGER'), competitionsController.createCompetition.bind(competitionsController));
app.get('/api/v1/competitions/active', authenticate, competitionsController.getActiveCompetitions.bind(competitionsController));
app.get('/api/v1/competitions/:id', authenticate, competitionsController.getCompetitionDetails.bind(competitionsController));
app.get('/api/v1/competitions/:id/leaderboard', authenticate, competitionsController.getLeaderboard.bind(competitionsController));
app.post('/api/v1/competitions/:id/start', authenticate, authorize('ADMIN', 'MANAGER'), competitionsController.startCompetition.bind(competitionsController));
app.post('/api/v1/competitions/:id/end', authenticate, authorize('ADMIN', 'MANAGER'), competitionsController.endCompetition.bind(competitionsController));
app.post('/api/v1/competitions/:id/update-scores', authenticate, authorize('ADMIN', 'MANAGER'), competitionsController.updateScores.bind(competitionsController));
app.post('/api/v1/competitions/templates/power-hour', authenticate, authorize('ADMIN', 'MANAGER'), competitionsController.createPowerHour.bind(competitionsController));
app.post('/api/v1/competitions/templates/fcp-friday', authenticate, authorize('ADMIN', 'MANAGER'), competitionsController.createFCPFriday.bind(competitionsController));

// Coaching routes
app.get('/api/v1/coaching/recommendations', authenticate, authorize('ADMIN', 'MANAGER'), coachingController.getRecommendations.bind(coachingController));
app.post('/api/v1/coaching/playbooks', authenticate, authorize('ADMIN', 'MANAGER'), coachingController.createPlaybooks.bind(coachingController));
app.get('/api/v1/coaching/playbooks', authenticate, authorize('ADMIN', 'MANAGER'), coachingController.getPlaybooks.bind(coachingController));
app.patch('/api/v1/coaching/playbooks/:id/status', authenticate, authorize('ADMIN', 'MANAGER'), coachingController.updatePlaybookStatus.bind(coachingController));
app.post('/api/v1/coaching/playbooks/:id/notes', authenticate, authorize('ADMIN', 'MANAGER'), coachingController.addProgressNote.bind(coachingController));
app.get('/api/v1/coaching/dashboard', authenticate, authorize('ADMIN', 'MANAGER'), coachingController.getDashboard.bind(coachingController));

// Import routes (CSV bulk upload)
app.use('/api/v1/import', importRoutes);

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

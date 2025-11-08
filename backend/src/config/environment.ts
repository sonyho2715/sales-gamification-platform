import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
    // In development, provide a warning but allow to continue
    console.warn(`⚠️  Using default value for ${varName} - NOT SAFE FOR PRODUCTION`);
  }
});

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-in-production',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};

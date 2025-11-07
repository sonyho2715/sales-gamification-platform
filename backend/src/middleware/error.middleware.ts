import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { sendError } from '../utils/response';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  if (error instanceof AppError) {
    return sendError(res, error.message, error.statusCode);
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return sendError(res, 'Database error occurred', 400);
  }

  // Default error
  return sendError(
    res,
    process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    500
  );
};

export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};

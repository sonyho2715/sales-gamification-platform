import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }
  next();
};

export const validateSale: ValidationChain[] = [
  body('transactionNumber').trim().notEmpty().withMessage('Transaction number is required'),
  body('saleDate').isISO8601().withMessage('Valid date required'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be positive'),
  body('fcpAmount').isFloat({ min: 0 }).withMessage('FCP amount must be positive'),
  body('hoursWorked').isFloat({ min: 0, max: 24 }).withMessage('Hours worked must be 0-24'),
  body('userId').isUUID().withMessage('Valid user ID required'),
  body('locationId').isUUID().withMessage('Valid location ID required'),
];

export const validateLogin: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateRegistration: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('organizationId').isUUID().withMessage('Valid organization ID required'),
];

export const validateGoal: ValidationChain[] = [
  body('userId').isUUID().withMessage('Valid user ID required'),
  body('targetValue').isFloat({ min: 0 }).withMessage('Target value must be positive'),
  body('periodStart').isISO8601().withMessage('Valid start date required'),
  body('periodEnd').isISO8601().withMessage('Valid end date required'),
];

import { Response, NextFunction } from 'express';
import salesService from './sales.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export class SalesController {
  async createSale(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const sale = await salesService.createSale(
        req.user.organizationId,
        req.body
      );

      return sendSuccess(res, sale, 201);
    } catch (error) {
      next(error);
    }
  }

  async getSale(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const sale = await salesService.getSaleById(
        req.params.id,
        req.user.organizationId
      );

      return sendSuccess(res, sale);
    } catch (error) {
      next(error);
    }
  }

  async getSales(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const filters = {
        userId: req.query.userId as string,
        locationId: req.query.locationId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await salesService.getSales(
        req.user.organizationId,
        filters
      );

      return sendSuccess(res, result.sales, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getDailySummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const date = req.query.date
        ? new Date(req.query.date as string)
        : new Date();

      const summary = await salesService.getDailySummary(
        req.user.organizationId,
        date
      );

      return sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async updateSale(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const sale = await salesService.updateSale(
        req.params.id,
        req.user.organizationId,
        req.body
      );

      return sendSuccess(res, sale);
    } catch (error) {
      next(error);
    }
  }

  async deleteSale(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const result = await salesService.deleteSale(
        req.params.id,
        req.user.organizationId
      );

      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export default new SalesController();

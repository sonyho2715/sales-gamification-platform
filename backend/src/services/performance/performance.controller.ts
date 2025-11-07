import { Response, NextFunction } from 'express';
import performanceService from './performance.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export class PerformanceController {
  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const options = {
        scope: (req.query.scope as 'organization' | 'location') || 'organization',
        locationId: req.query.locationId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      };

      const leaderboard = await performanceService.getLeaderboard(
        req.user.organizationId,
        options
      );

      return sendSuccess(res, leaderboard);
    } catch (error) {
      next(error);
    }
  }

  async getUserPerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const userId = req.params.userId || req.user.id;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;

      const performance = await performanceService.getUserPerformanceHistory(
        userId,
        req.user.organizationId,
        days
      );

      return sendSuccess(res, performance);
    } catch (error) {
      next(error);
    }
  }

  async calculateDailyPerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const userId = req.body.userId || req.user.id;
      const date = req.body.date ? new Date(req.body.date) : new Date();

      const performance = await performanceService.calculateDailyPerformance(
        userId,
        date
      );

      return sendSuccess(res, performance);
    } catch (error) {
      next(error);
    }
  }
}

export default new PerformanceController();

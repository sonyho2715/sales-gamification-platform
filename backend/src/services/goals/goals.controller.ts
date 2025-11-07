import { Response, NextFunction } from 'express';
import goalsService from './goals.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export class GoalsController {
  async createGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const goal = await goalsService.createGoal(req.user.organizationId, {
        ...req.body,
        createdBy: req.user.id,
      });

      return sendSuccess(res, goal, 201);
    } catch (error) {
      next(error);
    }
  }

  async getGoals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const filters = {
        userId: req.query.userId as string,
        locationId: req.query.locationId as string,
        goalType: req.query.goalType as any,
        active: req.query.active === 'true',
      };

      const goals = await goalsService.getGoals(req.user.organizationId, filters);

      return sendSuccess(res, goals);
    } catch (error) {
      next(error);
    }
  }

  async getGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const goal = await goalsService.getGoalById(req.params.id, req.user.organizationId);

      return sendSuccess(res, goal);
    } catch (error) {
      next(error);
    }
  }

  async getGoalProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const progress = await goalsService.getGoalProgress(
        req.params.id,
        req.user.organizationId
      );

      return sendSuccess(res, progress);
    } catch (error) {
      next(error);
    }
  }

  async updateGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const goal = await goalsService.updateGoal(
        req.params.id,
        req.user.organizationId,
        req.body
      );

      return sendSuccess(res, goal);
    } catch (error) {
      next(error);
    }
  }

  async deleteGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const result = await goalsService.deleteGoal(req.params.id, req.user.organizationId);

      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export default new GoalsController();

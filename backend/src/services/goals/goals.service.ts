import prisma from '../../config/database';
import { NotFoundError, ValidationError } from '../../utils/errors';
import logger from '../../utils/logger';
import { startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { GoalType } from '@prisma/client';

export class GoalsService {
  async createGoal(organizationId: string, goalData: {
    userId?: string;
    locationId?: string;
    goalType: GoalType;
    targetValue: number;
    periodStart: Date;
    periodEnd: Date;
    createdBy: string;
  }) {
    // Validate that either userId or locationId is provided
    if (!goalData.userId && !goalData.locationId) {
      throw new ValidationError('Either userId or locationId must be provided');
    }

    // Validate dates
    if (goalData.periodStart >= goalData.periodEnd) {
      throw new ValidationError('Period start must be before period end');
    }

    // Check if goal already exists for this period
    const existingGoal = await prisma.goal.findFirst({
      where: {
        userId: goalData.userId,
        locationId: goalData.locationId,
        goalType: goalData.goalType,
        periodStart: goalData.periodStart,
        periodEnd: goalData.periodEnd,
      },
    });

    if (existingGoal) {
      throw new ValidationError('A goal already exists for this period');
    }

    const goal = await prisma.goal.create({
      data: {
        organizationId,
        ...goalData,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    logger.info('Goal created', {
      goalId: goal.id,
      userId: goal.userId,
      goalType: goal.goalType,
    });

    return goal;
  }

  async getGoals(
    organizationId: string,
    filters: {
      userId?: string;
      locationId?: string;
      goalType?: GoalType;
      active?: boolean;
    }
  ) {
    const where: any = { organizationId };

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters.goalType) {
      where.goalType = filters.goalType;
    }

    if (filters.active) {
      const today = new Date();
      where.periodStart = { lte: today };
      where.periodEnd = { gte: today };
    }

    const goals = await prisma.goal.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        periodStart: 'desc',
      },
    });

    return goals;
  }

  async getGoalById(id: string, organizationId: string) {
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    return goal;
  }

  async getGoalProgress(id: string, organizationId: string) {
    const goal = await this.getGoalById(id, organizationId);

    let currentValue = 0;

    switch (goal.goalType) {
      case 'MONTHLY_SALES':
      case 'DAILY_SALES': {
        if (goal.userId) {
          // Individual goal
          const sales = await prisma.sale.findMany({
            where: {
              userId: goal.userId,
              saleDate: {
                gte: startOfDay(goal.periodStart),
                lte: endOfDay(goal.periodEnd),
              },
            },
          });
          currentValue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
        } else if (goal.locationId) {
          // Location goal
          const sales = await prisma.sale.findMany({
            where: {
              locationId: goal.locationId,
              saleDate: {
                gte: startOfDay(goal.periodStart),
                lte: endOfDay(goal.periodEnd),
              },
            },
          });
          currentValue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
        }
        break;
      }

      case 'FCP_PERCENTAGE': {
        if (goal.userId) {
          const sales = await prisma.sale.findMany({
            where: {
              userId: goal.userId,
              saleDate: {
                gte: startOfDay(goal.periodStart),
                lte: endOfDay(goal.periodEnd),
              },
            },
          });
          const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
          const totalFcp = sales.reduce((sum, sale) => sum + Number(sale.fcpAmount), 0);
          currentValue = totalSales > 0 ? (totalFcp / totalSales) * 100 : 0;
        }
        break;
      }

      case 'SALES_PER_HOUR': {
        if (goal.userId) {
          const sales = await prisma.sale.findMany({
            where: {
              userId: goal.userId,
              saleDate: {
                gte: startOfDay(goal.periodStart),
                lte: endOfDay(goal.periodEnd),
              },
            },
          });
          const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
          const totalHours = sales.reduce((sum, sale) => sum + Number(sale.hoursWorked), 0);
          currentValue = totalHours > 0 ? totalSales / totalHours : 0;
        }
        break;
      }

      case 'STAR_DAYS': {
        if (goal.userId) {
          const starDays = await prisma.starDay.count({
            where: {
              userId: goal.userId,
              starDate: {
                gte: startOfDay(goal.periodStart),
                lte: endOfDay(goal.periodEnd),
              },
            },
          });
          currentValue = starDays;
        }
        break;
      }
    }

    const targetValue = Number(goal.targetValue);
    const percentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
    const remainingDays = differenceInDays(goal.periodEnd, new Date());

    return {
      goalId: goal.id,
      userId: goal.userId,
      locationId: goal.locationId,
      goalType: goal.goalType,
      currentValue,
      targetValue,
      percentage: Math.min(percentage, 100),
      status: currentValue >= targetValue ? 'achieved' : 'in_progress',
      remainingDays: Math.max(0, remainingDays),
      periodStart: goal.periodStart,
      periodEnd: goal.periodEnd,
    };
  }

  async updateGoal(
    id: string,
    organizationId: string,
    updateData: {
      targetValue?: number;
      periodStart?: Date;
      periodEnd?: Date;
    }
  ) {
    const existingGoal = await this.getGoalById(id, organizationId);

    const goal = await prisma.goal.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info('Goal updated', {
      goalId: goal.id,
    });

    return goal;
  }

  async deleteGoal(id: string, organizationId: string) {
    const existingGoal = await this.getGoalById(id, organizationId);

    await prisma.goal.delete({
      where: { id },
    });

    logger.info('Goal deleted', {
      goalId: id,
    });

    return { message: 'Goal deleted successfully' };
  }
}

export default new GoalsService();

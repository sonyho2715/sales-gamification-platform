import prisma from '../../config/database';
import { startOfDay, endOfDay, differenceInDays } from 'date-fns';
import logger from '../../utils/logger';
import { PerformanceMetrics } from '../../types';

export class PerformanceService {
  async calculateDailyPerformance(userId: string, date: Date) {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    // Fetch all sales for the user on this date
    const sales = await prisma.sale.findMany({
      where: {
        userId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (sales.length === 0) {
      logger.info('No sales found for daily performance calculation', {
        userId,
        date,
      });
      return null;
    }

    // Calculate metrics
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalFcp = sales.reduce((sum, sale) => sum + Number(sale.fcpAmount), 0);
    const hoursWorked = Math.max(...sales.map(s => Number(s.hoursWorked)));

    const metrics: PerformanceMetrics = {
      totalSales,
      totalFcp,
      fcpPercentage: totalSales > 0 ? (totalFcp / totalSales) * 100 : 0,
      salesPerHour: hoursWorked > 0 ? totalSales / hoursWorked : 0,
      transactionCount: sales.length,
      averageSale: sales.length > 0 ? totalSales / sales.length : 0,
    };

    // Check if it's a star day
    const isStarDay = this.checkStarDayCriteria(metrics);

    // Get user's location and organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, locationId: true },
    });

    if (!user || !user.locationId) {
      logger.warn('User not found or has no location', { userId });
      return null;
    }

    // Upsert daily performance record
    const dailyPerformance = await prisma.dailyPerformance.upsert({
      where: {
        userId_performanceDate: {
          userId,
          performanceDate: date,
        },
      },
      update: {
        totalSales: metrics.totalSales,
        totalFcp: metrics.totalFcp,
        fcpPercentage: metrics.fcpPercentage,
        hoursWorked,
        salesPerHour: metrics.salesPerHour,
        transactionCount: metrics.transactionCount,
        averageSale: metrics.averageSale,
        isStarDay,
      },
      create: {
        organizationId: user.organizationId,
        userId,
        locationId: user.locationId,
        performanceDate: date,
        totalSales: metrics.totalSales,
        totalFcp: metrics.totalFcp,
        fcpPercentage: metrics.fcpPercentage,
        hoursWorked,
        salesPerHour: metrics.salesPerHour,
        transactionCount: metrics.transactionCount,
        averageSale: metrics.averageSale,
        isStarDay,
      },
    });

    // Create star day record if applicable
    if (isStarDay) {
      await prisma.starDay.upsert({
        where: {
          userId_starDate: {
            userId,
            starDate: date,
          },
        },
        update: {
          salesAmount: metrics.totalSales,
          fcpPercentage: metrics.fcpPercentage,
          criteriaMet: {
            sales: metrics.totalSales >= 3000,
            fcp: metrics.fcpPercentage >= 18,
          },
        },
        create: {
          organizationId: user.organizationId,
          userId,
          starDate: date,
          salesAmount: metrics.totalSales,
          fcpPercentage: metrics.fcpPercentage,
          criteriaMet: {
            sales: metrics.totalSales >= 3000,
            fcp: metrics.fcpPercentage >= 18,
          },
        },
      });

      logger.info('Star day achieved!', {
        userId,
        date,
        totalSales: metrics.totalSales,
        fcpPercentage: metrics.fcpPercentage,
      });
    }

    // Update rankings
    await this.updateRankings(date, user.organizationId);

    logger.info('Daily performance calculated', {
      userId,
      date,
      metrics,
      isStarDay,
    });

    return dailyPerformance;
  }

  checkStarDayCriteria(metrics: PerformanceMetrics): boolean {
    // Star day criteria: $3,000+ in sales AND 18%+ FCP
    return metrics.totalSales >= 3000 && metrics.fcpPercentage >= 18;
  }

  async updateRankings(date: Date, organizationId: string) {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    // Get all performances for the date
    const performances = await prisma.dailyPerformance.findMany({
      where: {
        organizationId,
        performanceDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        totalSales: 'desc',
      },
    });

    // Update organization rankings
    for (let i = 0; i < performances.length; i++) {
      await prisma.dailyPerformance.update({
        where: { id: performances[i].id },
        data: { rankInOrganization: i + 1 },
      });
    }

    // Update location rankings
    const locationGroups = performances.reduce((acc: any, perf) => {
      if (!acc[perf.locationId]) {
        acc[perf.locationId] = [];
      }
      acc[perf.locationId].push(perf);
      return acc;
    }, {});

    for (const locationId in locationGroups) {
      const locationPerfs = locationGroups[locationId].sort(
        (a: any, b: any) => Number(b.totalSales) - Number(a.totalSales)
      );

      for (let i = 0; i < locationPerfs.length; i++) {
        await prisma.dailyPerformance.update({
          where: { id: locationPerfs[i].id },
          data: { rankInLocation: i + 1 },
        });
      }
    }

    logger.info('Rankings updated', { date, organizationId });
  }

  async getLeaderboard(
    organizationId: string,
    options: {
      scope?: 'organization' | 'location';
      locationId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ) {
    const where: any = { organizationId };

    if (options.scope === 'location' && options.locationId) {
      where.locationId = options.locationId;
    }

    if (options.startDate || options.endDate) {
      where.performanceDate = {};
      if (options.startDate) {
        where.performanceDate.gte = startOfDay(options.startDate);
      }
      if (options.endDate) {
        where.performanceDate.lte = endOfDay(options.endDate);
      }
    } else {
      // Default to today
      const today = new Date();
      where.performanceDate = {
        gte: startOfDay(today),
        lte: endOfDay(today),
      };
    }

    const performances = await prisma.dailyPerformance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
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
        totalSales: 'desc',
      },
      take: options.limit || 50,
    });

    return performances.map((perf, index) => ({
      rank: index + 1,
      user: perf.user,
      location: perf.location,
      totalSales: Number(perf.totalSales),
      fcpPercentage: Number(perf.fcpPercentage),
      salesPerHour: Number(perf.salesPerHour),
      transactionCount: perf.transactionCount,
      isStarDay: perf.isStarDay,
    }));
  }

  async getUserPerformanceHistory(
    userId: string,
    organizationId: string,
    days: number = 30
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const performances = await prisma.dailyPerformance.findMany({
      where: {
        userId,
        organizationId,
        performanceDate: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
      },
      orderBy: {
        performanceDate: 'asc',
      },
    });

    // Calculate summary statistics
    const totalSales = performances.reduce(
      (sum, perf) => sum + Number(perf.totalSales),
      0
    );
    const avgSales = performances.length > 0 ? totalSales / performances.length : 0;
    const starDaysCount = performances.filter(p => p.isStarDay).length;

    return {
      performances: performances.map(p => ({
        date: p.performanceDate,
        totalSales: Number(p.totalSales),
        fcpPercentage: Number(p.fcpPercentage),
        salesPerHour: Number(p.salesPerHour),
        transactionCount: p.transactionCount,
        isStarDay: p.isStarDay,
        rankInLocation: p.rankInLocation,
        rankInOrganization: p.rankInOrganization,
      })),
      summary: {
        totalSales,
        avgSales,
        starDaysCount,
        daysWorked: performances.length,
      },
    };
  }
}

export default new PerformanceService();

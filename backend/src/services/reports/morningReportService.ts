import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfDay, startOfDay, format, differenceInDays } from 'date-fns';

const prisma = new PrismaClient();

interface MorningReportData {
  reportDate: string;
  yesterdaysStars: StarPerformer[];
  companyPerformance: {
    totalSales: {
      actual: number;
      goal: number;
      percentToGoal: number;
      onTrackFor: number;
      amountNeededDaily: number;
      dailyData: Array<{ day: number; sales: number; cumulative: number; goalTrack: number }>;
    };
    fcp: {
      actual: number;
      goal: number;
      percentToGoal: number;
      dailyData: Array<{ day: number; fcp: number; percentage: number }>;
    };
    starDays: {
      byLocation: Array<{ location: string; count: number; color: string }>;
      byPerson: Array<{ name: string; count: number }>;
    };
  };
}

interface StarPerformer {
  rank: number;
  name: string;
  location: string;
  sales: number;
  fcp: number;
  fcpPercentage: number;
  salesPerHour: number;
  starDays: number;
}

export async function generateMorningReport(
  organizationId: string,
  reportDate: Date
): Promise<MorningReportData> {
  const startOfReportMonth = startOfMonth(reportDate);
  const endOfReportDate = endOfDay(reportDate);
  const startOfReportDate = startOfDay(reportDate);

  // Fetch yesterday's stars (top performers on the report date)
  const yesterdaysStars = await getYesterdaysStars(organizationId, reportDate);

  // Fetch company performance metrics
  const companyPerformance = await getCompanyPerformance(
    organizationId,
    startOfReportMonth,
    endOfReportDate,
    reportDate
  );

  return {
    reportDate: format(reportDate, 'yyyy-MM-dd'),
    yesterdaysStars,
    companyPerformance,
  };
}

async function getYesterdaysStars(
  organizationId: string,
  reportDate: Date
): Promise<StarPerformer[]> {
  const startDate = startOfDay(reportDate);
  const endDate = endOfDay(reportDate);

  // Get daily performance for all users on the report date
  const performances = await prisma.dailyPerformance.findMany({
    where: {
      organizationId,
      performanceDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      location: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      totalSales: 'desc',
    },
  });

  // Get star days count for the month
  const startOfReportMonth = startOfMonth(reportDate);
  const starDaysCounts = await prisma.starDay.findMany({
    where: {
      organizationId,
      starDate: {
        gte: startOfReportMonth,
        lte: endDate,
      },
    },
    select: {
      userId: true,
    },
  });

  const starDaysMap = starDaysCounts.reduce((acc, sd) => {
    acc[sd.userId] = (acc[sd.userId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return performances.map((perf, index) => ({
    rank: index + 1,
    name: `${perf.user.firstName} ${perf.user.lastName}`,
    location: perf.location.name,
    sales: Number(perf.totalSales),
    fcp: Number(perf.totalFcp),
    fcpPercentage: Number(perf.fcpPercentage),
    salesPerHour: Number(perf.salesPerHour),
    starDays: starDaysMap[perf.userId] || 0,
  }));
}

async function getCompanyPerformance(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  reportDate: Date
) {
  // Get all daily performance records for the month
  const dailyPerformances = await prisma.dailyPerformance.findMany({
    where: {
      organizationId,
      performanceDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      performanceDate: 'asc',
    },
  });

  // Get company-wide goals
  const monthGoal = await prisma.goal.findFirst({
    where: {
      organizationId,
      goalType: 'MONTHLY_SALES',
      periodStart: {
        lte: reportDate,
      },
      periodEnd: {
        gte: reportDate,
      },
    },
  });

  const fcpGoal = await prisma.goal.findFirst({
    where: {
      organizationId,
      goalType: 'FCP_PERCENTAGE',
      periodStart: {
        lte: reportDate,
      },
      periodEnd: {
        gte: reportDate,
      },
    },
  });

  // Aggregate by day
  const dayMap = new Map<number, { sales: number; fcp: number; fcpAmount: number }>();

  dailyPerformances.forEach((perf) => {
    const day = perf.performanceDate.getDate();
    const existing = dayMap.get(day) || { sales: 0, fcp: 0, fcpAmount: 0 };
    dayMap.set(day, {
      sales: existing.sales + Number(perf.totalSales),
      fcp: existing.fcp + Number(perf.totalSales),
      fcpAmount: existing.fcpAmount + Number(perf.totalFcp),
    });
  });

  // Calculate cumulative totals
  const dailyData: Array<{ day: number; sales: number; cumulative: number; goalTrack: number }> = [];
  let cumulative = 0;
  const daysInMonth = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0).getDate();
  const currentDay = reportDate.getDate();
  const goalAmount = monthGoal ? Number(monthGoal.targetValue) : 0;
  const dailyGoalAmount = goalAmount / daysInMonth;

  for (let day = 1; day <= currentDay; day++) {
    const dayData = dayMap.get(day) || { sales: 0, fcp: 0, fcpAmount: 0 };
    cumulative += dayData.sales;
    dailyData.push({
      day,
      sales: dayData.sales,
      cumulative,
      goalTrack: dailyGoalAmount * day,
    });
  }

  const totalSales = cumulative;
  const percentToGoal = goalAmount > 0 ? (totalSales / goalAmount) * 100 : 0;
  const daysElapsed = currentDay;
  const onTrackFor = daysElapsed > 0 ? (totalSales / daysElapsed) * daysInMonth : 0;
  const daysRemaining = daysInMonth - daysElapsed;
  const amountNeededDaily =
    daysRemaining > 0 && goalAmount > totalSales
      ? (goalAmount - totalSales) / daysRemaining
      : 0;

  // FCP data
  const fcpDailyData: Array<{ day: number; fcp: number; percentage: number }> = [];
  for (let day = 1; day <= currentDay; day++) {
    const dayData = dayMap.get(day) || { sales: 0, fcp: 0, fcpAmount: 0 };
    const percentage = dayData.fcp > 0 ? (dayData.fcpAmount / dayData.fcp) * 100 : 0;
    fcpDailyData.push({
      day,
      fcp: dayData.fcpAmount,
      percentage,
    });
  }

  const totalFcpAmount = Array.from(dayMap.values()).reduce((sum, d) => sum + d.fcpAmount, 0);
  const totalFcpBase = Array.from(dayMap.values()).reduce((sum, d) => sum + d.fcp, 0);
  const actualFcpPercentage = totalFcpBase > 0 ? (totalFcpAmount / totalFcpBase) * 100 : 0;
  const fcpGoalValue = fcpGoal ? Number(fcpGoal.targetValue) : 50;
  const fcpPercentToGoal = (actualFcpPercentage / fcpGoalValue) * 100;

  // Star Days data
  const starDays = await prisma.starDay.findMany({
    where: {
      organizationId,
      starDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          location: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const starDaysByLocation = starDays.reduce((acc, sd) => {
    const locationName = sd.user.location?.name || 'Unknown';
    acc[locationName] = (acc[locationName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const starDaysByPerson = starDays.reduce((acc, sd) => {
    const name = `${sd.user.firstName} ${sd.user.lastName}`;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

  return {
    totalSales: {
      actual: totalSales,
      goal: goalAmount,
      percentToGoal,
      onTrackFor,
      amountNeededDaily,
      dailyData,
    },
    fcp: {
      actual: actualFcpPercentage,
      goal: fcpGoalValue,
      percentToGoal: fcpPercentToGoal,
      dailyData: fcpDailyData,
    },
    starDays: {
      byLocation: Object.entries(starDaysByLocation).map(([location, count], index) => ({
        location,
        count,
        color: colors[index % colors.length],
      })),
      byPerson: Object.entries(starDaysByPerson)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    },
  };
}

export default {
  generateMorningReport,
};

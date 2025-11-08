import { PrismaClient, CoachingTrigger, CoachingStatus } from '@prisma/client';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

const prisma = new PrismaClient();

export interface CoachingRecommendation {
  userId: string;
  trigger: CoachingTrigger;
  priority: number;
  title: string;
  description: string;
  diagnosisData: any;
  recommendedActions: any;
}

class CoachingService {
  /**
   * Analyze performance and generate coaching recommendations
   */
  async generateCoachingRecommendations(organizationId: string): Promise<CoachingRecommendation[]> {
    const recommendations: CoachingRecommendation[] = [];
    const today = new Date();
    const last7Days = subDays(today, 7);
    const last14Days = subDays(today, 14);

    // Get active salespeople
    const users = await prisma.user.findMany({
      where: {
        organizationId,
        active: true,
        role: 'SALESPERSON',
      },
      include: {
        location: true,
      },
    });

    // Get performance data
    const performanceData = await prisma.dailyPerformance.findMany({
      where: {
        organizationId,
        performanceDate: { gte: last14Days },
      },
    });

    // Get current goals
    const goals = await prisma.goal.findMany({
      where: {
        organizationId,
        periodStart: { lte: today },
        periodEnd: { gte: today },
      },
    });

    // Analyze each user
    for (const user of users) {
      const userPerformance = performanceData.filter((p) => p.userId === user.id);
      const recentPerf = userPerformance.filter((p) => p.performanceDate >= last7Days);
      const olderPerf = userPerformance.filter(
        (p) => p.performanceDate >= last14Days && p.performanceDate < last7Days
      );

      if (recentPerf.length === 0) continue;

      // Check 1: Performance Drop (comparing last 7 days to previous 7 days)
      if (olderPerf.length > 0) {
        const recentAvgSales = recentPerf.reduce((sum, p) => sum + Number(p.totalSales), 0) / recentPerf.length;
        const olderAvgSales = olderPerf.reduce((sum, p) => sum + Number(p.totalSales), 0) / olderPerf.length;
        const dropPercentage = ((olderAvgSales - recentAvgSales) / olderAvgSales) * 100;

        if (dropPercentage > 20) {
          recommendations.push({
            userId: user.id,
            trigger: 'PERFORMANCE_DROP',
            priority: Math.min(10, Math.floor(dropPercentage / 10) + 5),
            title: `${user.firstName}'s sales dropped ${dropPercentage.toFixed(0)}%`,
            description: `Sales declined from $${olderAvgSales.toFixed(0)}/day to $${recentAvgSales.toFixed(0)}/day over the past 2 weeks.`,
            diagnosisData: {
              recentAvgSales: recentAvgSales.toFixed(2),
              olderAvgSales: olderAvgSales.toFixed(2),
              dropPercentage: dropPercentage.toFixed(1),
              daysAnalyzed: recentPerf.length,
            },
            recommendedActions: [
              {
                action: 'Schedule 1-on-1 meeting',
                description: 'Discuss what challenges they\'re facing',
                priority: 1,
              },
              {
                action: 'Review recent sales',
                description: 'Identify patterns in lost deals or objections',
                priority: 2,
              },
              {
                action: 'Shadow top performer',
                description: 'Pair with high performer for half-day',
                priority: 3,
              },
            ],
          });
        }
      }

      // Check 2: Below Goal (not meeting sales targets)
      const userGoals = goals.filter((g) => g.userId === user.id);
      for (const goal of userGoals) {
        if (goal.goalType === 'DAILY_SALES' || goal.goalType === 'MONTHLY_SALES') {
          const relevantPerf = recentPerf.slice(-5); // Last 5 days
          const avgSales = relevantPerf.reduce((sum, p) => sum + Number(p.totalSales), 0) / relevantPerf.length;
          const targetValue = Number(goal.targetValue);
          const percentOfGoal = (avgSales / targetValue) * 100;

          if (percentOfGoal < 70) {
            recommendations.push({
              userId: user.id,
              trigger: 'BELOW_GOAL',
              priority: 8,
              title: `${user.firstName} is ${(100 - percentOfGoal).toFixed(0)}% below ${goal.goalType.replace('_', ' ').toLowerCase()} goal`,
              description: `Averaging $${avgSales.toFixed(0)}/day vs. $${targetValue} goal. Needs improvement plan.`,
              diagnosisData: {
                currentAverage: avgSales.toFixed(2),
                goalTarget: targetValue,
                percentOfGoal: percentOfGoal.toFixed(1),
                daysRemaining: Math.ceil((goal.periodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
              },
              recommendedActions: [
                {
                  action: 'Set micro-goals',
                  description: `Break down goal into daily targets: $${targetValue}/day`,
                  priority: 1,
                },
                {
                  action: 'Increase activity',
                  description: 'Focus on greeting more customers (higher volume)',
                  priority: 2,
                },
                {
                  action: 'Product training',
                  description: 'Review high-margin products and upsell techniques',
                  priority: 3,
                },
              ],
            });
          }
        }
      }

      // Check 3: Low FCP Rate (below company average)
      const avgFcpRate = recentPerf.reduce((sum, p) => sum + Number(p.fcpPercentage), 0) / recentPerf.length;
      const companyAvgFcp =
        performanceData
          .filter((p) => p.performanceDate >= last7Days)
          .reduce((sum, p) => sum + Number(p.fcpPercentage), 0) /
        performanceData.filter((p) => p.performanceDate >= last7Days).length;

      if (avgFcpRate < companyAvgFcp * 0.7 && avgFcpRate < 35) {
        recommendations.push({
          userId: user.id,
          trigger: 'LOW_FCP_RATE',
          priority: 7,
          title: `${user.firstName}'s FCP rate is ${avgFcpRate.toFixed(0)}% (company avg: ${companyAvgFcp.toFixed(0)}%)`,
          description: `Missing FCP opportunities = lost profit. Needs FCP pitch coaching.`,
          diagnosisData: {
            userFcpRate: avgFcpRate.toFixed(1),
            companyAvgFcpRate: companyAvgFcp.toFixed(1),
            gapPercentage: (companyAvgFcp - avgFcpRate).toFixed(1),
          },
          recommendedActions: [
            {
              action: 'FCP script review',
              description: 'Practice FCP pitch with manager (role-play)',
              priority: 1,
            },
            {
              action: 'Objection handling',
              description: 'Learn responses to "I don\'t need protection"',
              priority: 2,
            },
            {
              action: 'Tie FCP to value',
              description: 'Teach to present FCP as part of total solution, not add-on',
              priority: 3,
            },
            {
              action: 'Track daily',
              description: 'Monitor FCP rate daily for next 2 weeks',
              priority: 4,
            },
          ],
        });
      }

      // Check 4: Low Conversion (few transactions relative to hours worked)
      const totalTransactions = recentPerf.reduce((sum, p) => sum + p.transactionCount, 0);
      const totalHours = recentPerf.reduce((sum, p) => sum + Number(p.hoursWorked), 0);
      const transactionsPerHour = totalHours > 0 ? totalTransactions / totalHours : 0;

      if (transactionsPerHour < 0.3 && totalHours > 10) {
        // Less than 1 transaction per 3 hours
        recommendations.push({
          userId: user.id,
          trigger: 'LOW_CONVERSION',
          priority: 6,
          title: `${user.firstName} has low conversion rate`,
          description: `Only ${transactionsPerHour.toFixed(2)} transactions/hour. May need closing techniques coaching.`,
          diagnosisData: {
            transactionsPerHour: transactionsPerHour.toFixed(2),
            totalTransactions,
            totalHours: totalHours.toFixed(1),
          },
          recommendedActions: [
            {
              action: 'Greeting technique',
              description: 'Review how to approach customers (engagement)',
              priority: 1,
            },
            {
              action: 'Qualifying questions',
              description: 'Teach to ask better discovery questions',
              priority: 2,
            },
            {
              action: 'Closing skills',
              description: 'Practice assumptive close and trial close techniques',
              priority: 3,
            },
            {
              action: 'Overcoming objections',
              description: 'Role-play common objections (price, thinking it over)',
              priority: 4,
            },
          ],
        });
      }
    }

    // Sort by priority (highest first)
    recommendations.sort((a, b) => b.priority - a.priority);

    return recommendations;
  }

  /**
   * Create coaching playbook from recommendation
   */
  async createCoachingPlaybook(
    organizationId: string,
    recommendation: CoachingRecommendation,
    managerId?: string
  ) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 1 week from now

    const playbook = await prisma.coachingPlaybook.create({
      data: {
        organizationId,
        userId: recommendation.userId,
        managerId,
        trigger: recommendation.trigger,
        priority: recommendation.priority,
        title: recommendation.title,
        description: recommendation.description,
        diagnosisData: recommendation.diagnosisData,
        recommendedActions: recommendation.recommendedActions,
        dueDate,
      },
    });

    return playbook;
  }

  /**
   * Bulk create coaching playbooks from recommendations
   */
  async createPlaybooksFromRecommendations(organizationId: string, managerId?: string) {
    const recommendations = await this.generateCoachingRecommendations(organizationId);

    // Only create for high-priority recommendations (7+)
    const highPriority = recommendations.filter((r) => r.priority >= 7);

    const playbooks = await Promise.all(
      highPriority.map((rec) => this.createCoachingPlaybook(organizationId, rec, managerId))
    );

    return playbooks;
  }

  /**
   * Get coaching playbooks for a manager
   */
  async getCoachingPlaybooks(organizationId: string, managerId?: string, status?: CoachingStatus) {
    const whereClause: any = {
      organizationId,
    };

    if (managerId) {
      whereClause.managerId = managerId;
    }

    if (status) {
      whereClause.status = status;
    }

    const playbooks = await prisma.coachingPlaybook.findMany({
      where: whereClause,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    // Get user details
    const userIds = playbooks.map((p) => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        location: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return playbooks.map((playbook) => ({
      ...playbook,
      user: userMap.get(playbook.userId),
    }));
  }

  /**
   * Update coaching playbook status
   */
  async updatePlaybookStatus(
    playbookId: string,
    organizationId: string,
    status: CoachingStatus,
    note?: string
  ) {
    const playbook = await prisma.coachingPlaybook.findFirst({
      where: {
        id: playbookId,
        organizationId,
      },
    });

    if (!playbook) {
      throw new Error('Coaching playbook not found');
    }

    const progressNotes = playbook.progressNotes as any[];
    if (note) {
      progressNotes.push({
        timestamp: new Date().toISOString(),
        note,
        status,
      });
    }

    const updateData: any = {
      status,
      progressNotes,
    };

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    await prisma.coachingPlaybook.update({
      where: { id: playbookId },
      data: updateData,
    });

    return { success: true };
  }

  /**
   * Add progress note to coaching playbook
   */
  async addProgressNote(playbookId: string, organizationId: string, note: string) {
    const playbook = await prisma.coachingPlaybook.findFirst({
      where: {
        id: playbookId,
        organizationId,
      },
    });

    if (!playbook) {
      throw new Error('Coaching playbook not found');
    }

    const progressNotes = playbook.progressNotes as any[];
    progressNotes.push({
      timestamp: new Date().toISOString(),
      note,
    });

    await prisma.coachingPlaybook.update({
      where: { id: playbookId },
      data: {
        progressNotes,
      },
    });

    return { success: true };
  }

  /**
   * Get coaching dashboard summary
   */
  async getCoachingDashboard(organizationId: string, managerId?: string) {
    const playbooks = await this.getCoachingPlaybooks(organizationId, managerId);

    const summary = {
      totalPlaybooks: playbooks.length,
      byStatus: {
        RECOMMENDED: playbooks.filter((p) => p.status === 'RECOMMENDED').length,
        ASSIGNED: playbooks.filter((p) => p.status === 'ASSIGNED').length,
        IN_PROGRESS: playbooks.filter((p) => p.status === 'IN_PROGRESS').length,
        COMPLETED: playbooks.filter((p) => p.status === 'COMPLETED').length,
        DISMISSED: playbooks.filter((p) => p.status === 'DISMISSED').length,
      },
      byTrigger: {
        PERFORMANCE_DROP: playbooks.filter((p) => p.trigger === 'PERFORMANCE_DROP').length,
        BELOW_GOAL: playbooks.filter((p) => p.trigger === 'BELOW_GOAL').length,
        LOW_FCP_RATE: playbooks.filter((p) => p.trigger === 'LOW_FCP_RATE').length,
        LOW_CONVERSION: playbooks.filter((p) => p.trigger === 'LOW_CONVERSION').length,
        MANUAL: playbooks.filter((p) => p.trigger === 'MANUAL').length,
      },
      highPriority: playbooks.filter((p) => p.priority >= 8 && p.status !== 'COMPLETED' && p.status !== 'DISMISSED'),
      overduePlaybooks: playbooks.filter(
        (p) => p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'COMPLETED'
      ),
    };

    return {
      summary,
      recentPlaybooks: playbooks.slice(0, 10),
    };
  }
}

export default new CoachingService();

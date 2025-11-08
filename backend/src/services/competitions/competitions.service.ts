import { PrismaClient, CompetitionType, CompetitionMetric, CompetitionStatus } from '@prisma/client';
import { startOfDay, endOfDay, addHours, parseISO } from 'date-fns';

const prisma = new PrismaClient();

export interface CreateCompetitionInput {
  name: string;
  description?: string;
  type: CompetitionType;
  metric: CompetitionMetric;
  startTime: Date;
  endTime: Date;
  prizeDescription?: string;
  rules?: any;
  locationIds?: string[];
  createdBy: string;
}

export interface UpdateCompetitionScoresInput {
  competitionId: string;
  organizationId: string;
}

class CompetitionsService {
  /**
   * Create a new competition
   */
  async createCompetition(organizationId: string, input: CreateCompetitionInput) {
    const competition = await prisma.competition.create({
      data: {
        organizationId,
        name: input.name,
        description: input.description,
        type: input.type,
        metric: input.metric,
        startTime: input.startTime,
        endTime: input.endTime,
        prizeDescription: input.prizeDescription,
        rules: input.rules || {},
        locationIds: input.locationIds || [],
        createdBy: input.createdBy,
      },
    });

    // Auto-enroll eligible users
    await this.enrollParticipants(competition.id, organizationId, input.locationIds);

    return competition;
  }

  /**
   * Auto-enroll participants based on location filter
   */
  private async enrollParticipants(competitionId: string, organizationId: string, locationIds?: string[]) {
    const whereClause: any = {
      organizationId,
      active: true,
      role: 'SALESPERSON',
    };

    if (locationIds && locationIds.length > 0) {
      whereClause.locationId = { in: locationIds };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        locationId: true,
      },
    });

    const participants = users.map((user) => ({
      competitionId,
      userId: user.id,
      locationId: user.locationId!,
    }));

    await prisma.competitionParticipant.createMany({
      data: participants,
      skipDuplicates: true,
    });
  }

  /**
   * Get active competitions
   */
  async getActiveCompetitions(organizationId: string, userId?: string) {
    const now = new Date();

    const competitions = await prisma.competition.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: {
        participants: {
          where: userId ? { userId } : undefined,
          take: userId ? 1 : undefined,
        },
        leaderboardEntries: {
          take: 10,
          orderBy: { rank: 'asc' },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return competitions;
  }

  /**
   * Get competition by ID with full details
   */
  async getCompetitionDetails(competitionId: string, organizationId: string) {
    const competition = await prisma.competition.findFirst({
      where: {
        id: competitionId,
        organizationId,
      },
      include: {
        participants: {
          include: {
            competition: false,
          },
          orderBy: { currentScore: 'desc' },
        },
        leaderboardEntries: {
          orderBy: { rank: 'asc' },
          take: 100,
        },
      },
    });

    return competition;
  }

  /**
   * Update competition scores based on real-time sales data
   */
  async updateCompetitionScores(competitionId: string, organizationId: string) {
    const competition = await prisma.competition.findFirst({
      where: {
        id: competitionId,
        organizationId,
        status: 'ACTIVE',
      },
      include: {
        participants: true,
      },
    });

    if (!competition) {
      throw new Error('Competition not found or not active');
    }

    const { startTime, endTime, metric } = competition;

    // Get sales data for competition period
    const sales = await prisma.sale.findMany({
      where: {
        organizationId,
        userId: { in: competition.participants.map((p) => p.userId) },
        saleDate: {
          gte: startOfDay(startTime),
          lte: endOfDay(endTime),
        },
      },
      include: {
        items: true,
      },
    });

    // Calculate scores per user
    const scoresByUser = new Map<string, number>();

    competition.participants.forEach((p) => {
      const userSales = sales.filter((s) => s.userId === p.userId);

      let score = 0;

      switch (metric) {
        case 'TOTAL_SALES':
          score = userSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
          break;

        case 'FCP_PERCENTAGE':
          const totalSales = userSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
          const totalFcp = userSales.reduce((sum, s) => sum + Number(s.fcpAmount), 0);
          score = totalSales > 0 ? (totalFcp / totalSales) * 100 : 0;
          break;

        case 'TRANSACTION_COUNT':
          score = userSales.length;
          break;

        case 'AVERAGE_SALE':
          const total = userSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
          score = userSales.length > 0 ? total / userSales.length : 0;
          break;

        case 'GROSS_MARGIN':
          score = userSales.reduce((sum, s) => {
            const marginSum = s.items.reduce((itemSum, item) =>
              itemSum + (Number(item.marginAmount) || 0), 0
            );
            return sum + marginSum;
          }, 0);
          break;

        case 'SALES_PER_HOUR':
          const totalHours = userSales.reduce((sum, s) => sum + Number(s.hoursWorked), 0);
          const totalAmount = userSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
          score = totalHours > 0 ? totalAmount / totalHours : 0;
          break;

        default:
          score = 0;
      }

      scoresByUser.set(p.userId, score);
    });

    // Update participant scores
    const updates = Array.from(scoresByUser.entries()).map(([userId, score]) =>
      prisma.competitionParticipant.updateMany({
        where: {
          competitionId,
          userId,
        },
        data: {
          currentScore: score,
        },
      })
    );

    await Promise.all(updates);

    // Update leaderboard
    await this.updateLeaderboard(competitionId, scoresByUser);

    return { updated: scoresByUser.size };
  }

  /**
   * Update competition leaderboard with rankings
   */
  private async updateLeaderboard(competitionId: string, scoresByUser: Map<string, number>) {
    // Sort by score descending
    const sorted = Array.from(scoresByUser.entries()).sort((a, b) => b[1] - a[1]);

    // Clear existing leaderboard
    await prisma.competitionLeaderboard.deleteMany({
      where: { competitionId },
    });

    // Create new leaderboard entries
    const entries = sorted.map(([userId, score], index) => ({
      competitionId,
      userId,
      rank: index + 1,
      score,
      metadata: {},
    }));

    await prisma.competitionLeaderboard.createMany({
      data: entries,
    });
  }

  /**
   * Start a competition (change status to ACTIVE)
   */
  async startCompetition(competitionId: string, organizationId: string) {
    const competition = await prisma.competition.updateMany({
      where: {
        id: competitionId,
        organizationId,
        status: 'SCHEDULED',
      },
      data: {
        status: 'ACTIVE',
      },
    });

    if (competition.count === 0) {
      throw new Error('Competition not found or already started');
    }

    // Initialize scores
    await this.updateCompetitionScores(competitionId, organizationId);

    return { success: true };
  }

  /**
   * End a competition (change status to COMPLETED)
   */
  async endCompetition(competitionId: string, organizationId: string) {
    // Final score update
    await this.updateCompetitionScores(competitionId, organizationId);

    // Get final rankings
    const leaderboard = await prisma.competitionLeaderboard.findMany({
      where: { competitionId },
      orderBy: { rank: 'asc' },
    });

    // Update participant final ranks
    const updates = leaderboard.map((entry) =>
      prisma.competitionParticipant.updateMany({
        where: {
          competitionId,
          userId: entry.userId,
        },
        data: {
          finalRank: entry.rank,
        },
      })
    );

    await Promise.all(updates);

    // Mark as completed
    await prisma.competition.updateMany({
      where: {
        id: competitionId,
        organizationId,
      },
      data: {
        status: 'COMPLETED',
      },
    });

    return { success: true, leaderboard };
  }

  /**
   * Get competition leaderboard
   */
  async getLeaderboard(competitionId: string, organizationId: string, limit: number = 100) {
    const competition = await prisma.competition.findFirst({
      where: {
        id: competitionId,
        organizationId,
      },
    });

    if (!competition) {
      throw new Error('Competition not found');
    }

    const leaderboard = await prisma.competitionLeaderboard.findMany({
      where: { competitionId },
      orderBy: { rank: 'asc' },
      take: limit,
    });

    // Get user details
    const userIds = leaderboard.map((entry) => entry.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        locationId: true,
        location: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return leaderboard.map((entry) => ({
      ...entry,
      user: userMap.get(entry.userId),
    }));
  }

  /**
   * Quick templates for common competitions
   */
  async createPowerHour(organizationId: string, createdBy: string, startTime: Date) {
    return this.createCompetition(organizationId, {
      name: 'Power Hour',
      description: 'Highest sales in the next hour wins!',
      type: 'POWER_HOUR',
      metric: 'TOTAL_SALES',
      startTime,
      endTime: addHours(startTime, 1),
      prizeDescription: '$50 gift card',
      createdBy,
    });
  }

  async createFCPFriday(organizationId: string, createdBy: string, date: Date) {
    return this.createCompetition(organizationId, {
      name: 'FCP Friday',
      description: 'Highest FCP attachment rate wins today!',
      type: 'DAILY_BLITZ',
      metric: 'FCP_PERCENTAGE',
      startTime: startOfDay(date),
      endTime: endOfDay(date),
      prizeDescription: 'Early release + $100 bonus',
      createdBy,
    });
  }
}

export default new CompetitionsService();

import { Response } from 'express';
import { AuthRequest } from '../../types';
import competitionsService from './competitions.service';
import { CompetitionType, CompetitionMetric } from '@prisma/client';

class CompetitionsController {
  /**
   * POST /api/v1/competitions
   * Create a new competition
   */
  async createCompetition(req: AuthRequest, res: Response) {
    try {
      const { organizationId, id: userId } = req.user!;
      const { name, description, type, metric, startTime, endTime, prizeDescription, rules, locationIds } = req.body;

      if (!name || !type || !metric || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, type, metric, startTime, endTime',
        });
      }

      const competition = await competitionsService.createCompetition(organizationId, {
        name,
        description,
        type: type as CompetitionType,
        metric: metric as CompetitionMetric,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        prizeDescription,
        rules,
        locationIds,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: competition,
      });
    } catch (error: any) {
      console.error('Error creating competition:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create competition',
      });
    }
  }

  /**
   * GET /api/v1/competitions/active
   * Get active competitions
   */
  async getActiveCompetitions(req: AuthRequest, res: Response) {
    try {
      const { organizationId, id: userId } = req.user!;

      const competitions = await competitionsService.getActiveCompetitions(organizationId, userId);

      res.json({
        success: true,
        data: competitions,
      });
    } catch (error: any) {
      console.error('Error fetching active competitions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch competitions',
      });
    }
  }

  /**
   * GET /api/v1/competitions/:id
   * Get competition details
   */
  async getCompetitionDetails(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      const { id } = req.params;

      const competition = await competitionsService.getCompetitionDetails(id, organizationId);

      if (!competition) {
        return res.status(404).json({
          success: false,
          error: 'Competition not found',
        });
      }

      res.json({
        success: true,
        data: competition,
      });
    } catch (error: any) {
      console.error('Error fetching competition details:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch competition details',
      });
    }
  }

  /**
   * GET /api/v1/competitions/:id/leaderboard
   * Get competition leaderboard
   */
  async getLeaderboard(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      const { id } = req.params;
      const { limit } = req.query;

      const leaderboard = await competitionsService.getLeaderboard(
        id,
        organizationId,
        limit ? parseInt(limit as string) : 100
      );

      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch leaderboard',
      });
    }
  }

  /**
   * POST /api/v1/competitions/:id/start
   * Start a competition
   */
  async startCompetition(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      const { id } = req.params;

      const result = await competitionsService.startCompetition(id, organizationId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error starting competition:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to start competition',
      });
    }
  }

  /**
   * POST /api/v1/competitions/:id/end
   * End a competition
   */
  async endCompetition(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      const { id } = req.params;

      const result = await competitionsService.endCompetition(id, organizationId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error ending competition:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to end competition',
      });
    }
  }

  /**
   * POST /api/v1/competitions/:id/update-scores
   * Update competition scores (real-time refresh)
   */
  async updateScores(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      const { id } = req.params;

      const result = await competitionsService.updateCompetitionScores(id, organizationId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error updating scores:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update scores',
      });
    }
  }

  /**
   * POST /api/v1/competitions/templates/power-hour
   * Quick create: Power Hour competition
   */
  async createPowerHour(req: AuthRequest, res: Response) {
    try {
      const { organizationId, id: userId } = req.user!;
      const { startTime } = req.body;

      if (!startTime) {
        return res.status(400).json({
          success: false,
          error: 'startTime is required',
        });
      }

      const competition = await competitionsService.createPowerHour(
        organizationId,
        userId,
        new Date(startTime)
      );

      res.status(201).json({
        success: true,
        data: competition,
      });
    } catch (error: any) {
      console.error('Error creating Power Hour:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create Power Hour',
      });
    }
  }

  /**
   * POST /api/v1/competitions/templates/fcp-friday
   * Quick create: FCP Friday competition
   */
  async createFCPFriday(req: AuthRequest, res: Response) {
    try {
      const { organizationId, id: userId } = req.user!;
      const { date } = req.body;

      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'date is required',
        });
      }

      const competition = await competitionsService.createFCPFriday(organizationId, userId, new Date(date));

      res.status(201).json({
        success: true,
        data: competition,
      });
    } catch (error: any) {
      console.error('Error creating FCP Friday:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create FCP Friday',
      });
    }
  }
}

export default new CompetitionsController();

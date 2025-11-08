import { Request, Response } from 'express';
import coachingService from './coaching.service';
import { CoachingStatus } from '@prisma/client';

class CoachingController {
  /**
   * GET /api/v1/coaching/recommendations
   * Generate coaching recommendations based on performance analysis
   */
  async getRecommendations(req: Request, res: Response) {
    try {
      const { organizationId } = req.user as any;

      const recommendations = await coachingService.generateCoachingRecommendations(organizationId);

      res.json({
        success: true,
        data: recommendations,
      });
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate recommendations',
      });
    }
  }

  /**
   * POST /api/v1/coaching/playbooks
   * Create coaching playbooks from recommendations
   */
  async createPlaybooks(req: Request, res: Response) {
    try {
      const { organizationId, id: userId } = req.user as any;

      const playbooks = await coachingService.createPlaybooksFromRecommendations(organizationId, userId);

      res.status(201).json({
        success: true,
        data: playbooks,
        message: `Created ${playbooks.length} coaching playbooks`,
      });
    } catch (error: any) {
      console.error('Error creating playbooks:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create playbooks',
      });
    }
  }

  /**
   * GET /api/v1/coaching/playbooks
   * Get coaching playbooks (optionally filter by manager or status)
   */
  async getPlaybooks(req: Request, res: Response) {
    try {
      const { organizationId, id: userId, role } = req.user as any;
      const { status } = req.query;

      // Managers only see their assigned playbooks, admins see all
      const managerId = role === 'MANAGER' ? userId : undefined;

      const playbooks = await coachingService.getCoachingPlaybooks(
        organizationId,
        managerId,
        status as CoachingStatus | undefined
      );

      res.json({
        success: true,
        data: playbooks,
      });
    } catch (error: any) {
      console.error('Error fetching playbooks:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch playbooks',
      });
    }
  }

  /**
   * PATCH /api/v1/coaching/playbooks/:id/status
   * Update playbook status
   */
  async updatePlaybookStatus(req: Request, res: Response) {
    try {
      const { organizationId } = req.user as any;
      const { id } = req.params;
      const { status, note } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'status is required',
        });
      }

      const result = await coachingService.updatePlaybookStatus(id, organizationId, status as CoachingStatus, note);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error updating playbook status:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update playbook status',
      });
    }
  }

  /**
   * POST /api/v1/coaching/playbooks/:id/notes
   * Add progress note to playbook
   */
  async addProgressNote(req: Request, res: Response) {
    try {
      const { organizationId } = req.user as any;
      const { id } = req.params;
      const { note } = req.body;

      if (!note) {
        return res.status(400).json({
          success: false,
          error: 'note is required',
        });
      }

      const result = await coachingService.addProgressNote(id, organizationId, note);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error adding progress note:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add progress note',
      });
    }
  }

  /**
   * GET /api/v1/coaching/dashboard
   * Get coaching dashboard summary
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const { organizationId, id: userId, role } = req.user as any;

      // Managers only see their assigned playbooks, admins see all
      const managerId = role === 'MANAGER' ? userId : undefined;

      const dashboard = await coachingService.getCoachingDashboard(organizationId, managerId);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      console.error('Error fetching coaching dashboard:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch coaching dashboard',
      });
    }
  }
}

export default new CoachingController();

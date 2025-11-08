import { Request, Response } from 'express';
import { generateMorningReport } from './morningReportService';
import logger from '../../utils/logger';
import { parseISO } from 'date-fns';

class ReportsController {
  async getMorningReport(req: Request, res: Response) {
    try {
      const { date } = req.query;
      const user = (req as any).user;

      if (!user || !user.organizationId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Parse date or use yesterday as default
      let reportDate: Date;
      if (date && typeof date === 'string') {
        reportDate = parseISO(date);
      } else {
        // Default to yesterday
        reportDate = new Date();
        reportDate.setDate(reportDate.getDate() - 1);
      }

      logger.info(`Generating morning report for organization ${user.organizationId} on ${reportDate}`);

      const reportData = await generateMorningReport(user.organizationId, reportDate);

      return res.json({
        success: true,
        data: reportData,
      });
    } catch (error) {
      logger.error('Error generating morning report:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate morning report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default new ReportsController();

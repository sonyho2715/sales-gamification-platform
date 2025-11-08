import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

class LocationsController {
  async getLocations(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user || !user.organizationId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const locations = await prisma.location.findMany({
        where: {
          organizationId: user.organizationId,
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
        },
      });

      return res.json({
        success: true,
        data: locations,
      });
    } catch (error) {
      logger.error('Error fetching locations:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch locations',
      });
    }
  }
}

export default new LocationsController();

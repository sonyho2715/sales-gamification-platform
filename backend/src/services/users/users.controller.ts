import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

class UsersController {
  async getUsers(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user || !user.organizationId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const users = await prisma.user.findMany({
        where: {
          organizationId: user.organizationId,
          active: true,
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' },
        ],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          location: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      logger.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
      });
    }
  }
}

export default new UsersController();

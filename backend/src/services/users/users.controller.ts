import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

class UsersController {
  /**
   * GET /api/v1/users
   * Get all users (with optional filters)
   */
  async getUsers(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user || !user.organizationId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { role, locationId, active, search } = req.query;

      const whereClause: any = {
        organizationId: user.organizationId,
      };

      if (role) {
        whereClause.role = role;
      }

      if (locationId) {
        whereClause.locationId = locationId;
      }

      if (active !== undefined) {
        whereClause.active = active === 'true';
      }

      if (search) {
        whereClause.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const users = await prisma.user.findMany({
        where: whereClause,
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
          active: true,
          hireDate: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          locationId: true,
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

  /**
   * GET /api/v1/users/:id
   * Get user by ID
   */
  async getUserById(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const { id } = req.params;

      const user = await prisma.user.findFirst({
        where: {
          id,
          organizationId: currentUser.organizationId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          locationId: true,
          location: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          active: true,
          hireDate: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
      });
    }
  }

  /**
   * POST /api/v1/users
   * Create new user (Admin only)
   */
  async createUser(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const { email, password, firstName, lastName, role, locationId, hireDate, avatarUrl } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: email, password, firstName, lastName, role',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          organizationId: currentUser.organizationId,
          email,
          passwordHash,
          firstName,
          lastName,
          role,
          locationId: locationId || null,
          hireDate: hireDate ? new Date(hireDate) : null,
          avatarUrl: avatarUrl || null,
          active: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          locationId: true,
          location: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          active: true,
          hireDate: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully',
      });
    } catch (error) {
      logger.error('Error creating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user',
      });
    }
  }

  /**
   * PUT /api/v1/users/:id
   * Update user (Admin only)
   */
  async updateUser(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const { id } = req.params;
      const { email, firstName, lastName, role, locationId, hireDate, avatarUrl, active } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: {
          id,
          organizationId: currentUser.organizationId,
        },
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });

        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use',
          });
        }
      }

      // Update user
      const updateData: any = {};
      if (email !== undefined) updateData.email = email;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (role !== undefined) updateData.role = role;
      if (locationId !== undefined) updateData.locationId = locationId || null;
      if (hireDate !== undefined) updateData.hireDate = hireDate ? new Date(hireDate) : null;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null;
      if (active !== undefined) updateData.active = active;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          locationId: true,
          location: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          active: true,
          hireDate: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      });
    } catch (error) {
      logger.error('Error updating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user',
      });
    }
  }

  /**
   * DELETE /api/v1/users/:id
   * Delete user (soft delete - set active = false)
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const { id } = req.params;

      // Prevent self-deletion
      if (id === currentUser.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account',
        });
      }

      // Check if user exists
      const user = await prisma.user.findFirst({
        where: {
          id,
          organizationId: currentUser.organizationId,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Soft delete (set active = false)
      await prisma.user.update({
        where: { id },
        data: { active: false },
      });

      return res.json({
        success: true,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user',
      });
    }
  }

  /**
   * POST /api/v1/users/:id/reset-password
   * Reset user password (Admin only)
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'newPassword is required',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }

      // Check if user exists
      const user = await prisma.user.findFirst({
        where: {
          id,
          organizationId: currentUser.organizationId,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });

      return res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      logger.error('Error resetting password:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reset password',
      });
    }
  }

  /**
   * POST /api/v1/users/:id/activate
   * Reactivate user (Admin only)
   */
  async activateUser(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const { id } = req.params;

      // Check if user exists
      const user = await prisma.user.findFirst({
        where: {
          id,
          organizationId: currentUser.organizationId,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Activate user
      await prisma.user.update({
        where: { id },
        data: { active: true },
      });

      return res.json({
        success: true,
        message: 'User activated successfully',
      });
    } catch (error) {
      logger.error('Error activating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to activate user',
      });
    }
  }
}

export default new UsersController();

import { Request, Response, NextFunction } from 'express';
import authService from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../types';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return sendError(res, 'Refresh token not provided', 401);
      }

      const result = await authService.refreshToken(refreshToken);

      return sendSuccess(res, result);
    } catch (error: any) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('refreshToken');
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'User not authenticated', 401);
      }

      const user = await authService.getMe(req.user.id);

      return sendSuccess(res, user);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new AuthController();

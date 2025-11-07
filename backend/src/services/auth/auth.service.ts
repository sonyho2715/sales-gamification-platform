import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { config } from '../../config/environment';
import { AuthenticationError, NotFoundError, ValidationError } from '../../utils/errors';
import { AuthenticatedUser, LoginDto } from '../../types';
import logger from '../../utils/logger';

export class AuthService {
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
        location: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (!user.active) {
      throw new AuthenticationError('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        locationId: user.locationId,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: any;
    organizationId: string;
    locationId?: string;
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
      },
    });

    logger.info('New user registered', {
      userId: user.id,
      email: user.email,
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        locationId: user.locationId,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as AuthenticatedUser;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.active) {
        throw new AuthenticationError('Invalid refresh token');
      }

      const newAccessToken = this.generateAccessToken(user);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        location: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId,
      locationId: user.locationId,
      avatarUrl: user.avatarUrl,
      hireDate: user.hireDate,
      organization: user.organization,
      location: user.location,
    };
  }

  private generateAccessToken(user: any): string {
    const payload: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      locationId: user.locationId,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  private generateRefreshToken(user: any): string {
    const payload: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      locationId: user.locationId,
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  verifyAccessToken(token: string): AuthenticatedUser {
    try {
      return jwt.verify(token, config.jwt.secret) as AuthenticatedUser;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }
}

export default new AuthService();

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel, IUser } from '../users/users.model.js';
import { OrganizationModel } from '../organizations/organizations.model.js';
import { env } from '../../config/env.js';
import { hashToken, compareTokens } from '../../utils/tokenCompare.js';
import { AppError } from '../../middleware/errorHandler.js';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  organizationName: string;
  organizationType: 'manufacturer' | 'retailer' | 'recycler' | 'logistics';
  city: string;
  country: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    const existing = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      const err: AppError = new Error('Email already registered');
      err.statusCode = 409;
      err.code = 'EMAIL_ALREADY_EXISTS';
      throw err;
    }

    const org = await OrganizationModel.create({
      name: input.organizationName,
      legalName: input.organizationName,
      type: input.organizationType,
      roles: input.organizationType === 'recycler' ? ['recycler'] : input.organizationType === 'logistics' ? ['carrier'] : ['seller'],
      contactEmail: input.email,
      address: {
        city: input.city,
        country: input.country,
      },
    });

    const passwordHash = await hashToken(input.password);
    const user = await UserModel.create({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      organizationId: org._id,
      role: 'owner',
    });

    const tokens = await this.generateTokens(user);
    return { user, tokens };
  }

  async login(email: string, password: string): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await UserModel.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) {
      const err: AppError = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const valid = await compareTokens(password, user.passwordHash);
    if (!valid) {
      const err: AppError = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const tokens = await this.generateTokens(user);
    return { user, tokens };
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(rawRefreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
      const user = await UserModel.findById(decoded.userId);

      if (!user || !user.refreshTokenHash) {
        const err: AppError = new Error('Invalid refresh token');
        err.statusCode = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
      }

      const isValid = await compareTokens(rawRefreshToken, user.refreshTokenHash);
      if (!isValid) {
        const err: AppError = new Error('Invalid or revoked refresh token');
        err.statusCode = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
      }

      // Single-flight rotation: replace stored hash with new token
      return this.generateTokens(user);
    } catch (_error) {
      const err: AppError = new Error('Invalid refresh token');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }
  }

  async logout(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }

  private async generateTokens(user: IUser): Promise<AuthTokens> {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      organizationId: user.organizationId?.toString(),
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const tokenId = crypto.randomUUID();
    const refreshToken = jwt.sign({ userId: user._id.toString(), tokenId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    const hashedRefresh = await hashToken(refreshToken);
    await UserModel.findByIdAndUpdate(user._id, { refreshTokenHash: hashedRefresh });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();

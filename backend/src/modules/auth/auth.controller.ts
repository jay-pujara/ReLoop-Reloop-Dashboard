import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';

const REFRESH_COOKIE_NAME = 'cpe_refresh_token';

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth',
  });
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log('Register request body:', req.body);
    try {
      const { user, tokens } = await authService.register(req.body);
      setRefreshCookie(res, tokens.refreshToken);
      res.status(201).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, tokens } = await authService.login(email, password);
      setRefreshCookie(res, tokens.refreshToken);
      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
      if (!rawRefreshToken) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'No refresh token provided', fields: {} },
        });
        return;
      }

      const tokens = await authService.refresh(rawRefreshToken);
      setRefreshCookie(res, tokens.refreshToken);
      res.json({
        success: true,
        data: { accessToken: tokens.accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.userId) {
        await authService.logout(req.user.userId);
      }
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
      res.json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

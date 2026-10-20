import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';

export class UsersController {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated', fields: {} },
        });
        return;
      }

      const user = await usersService.getById(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User record not found', fields: {} },
        });
        return;
      }

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();

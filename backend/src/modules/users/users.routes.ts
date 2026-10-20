import { Router } from 'express';
import { usersController } from './users.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

router.get('/me', requireAuth, usersController.getMe);

export const usersRoutes = router;

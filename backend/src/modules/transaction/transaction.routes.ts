import { Router } from 'express';
import { transactionController } from './transaction.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

// Start a new transaction workflow based on a match ID
router.post('/start', requireAuth, transactionController.start);

// Get status of a transaction by its ID
router.get('/:id/status', requireAuth, transactionController.status);

export const transactionRoutes = router;

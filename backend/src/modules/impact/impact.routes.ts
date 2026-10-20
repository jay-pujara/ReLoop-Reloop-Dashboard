import { Router } from 'express';
import { impactController } from './impact.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = Router();

// Create a new ledger entry (authenticated)
router.post('/entries', requireAuth, impactController.createEntry);

// Retrieve a ledger entry by id (authenticated)
router.get('/entries/:id', requireAuth, impactController.getEntry);

// Verify the integrity of the entire ledger chain (authenticated)
router.get('/verify', requireAuth, impactController.verifyChain);

export const impactRoutes = router;

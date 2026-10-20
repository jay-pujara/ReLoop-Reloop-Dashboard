import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { checkDBReady } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Tier 1: IDENTITY
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { organizationsRoutes } from './modules/organizations/organizations.routes.js';
import { facilitiesRoutes } from './modules/facilities/facilities.routes.js';

// Tier 2: CATALOG
import { materialsRoutes } from './modules/materials/materials.routes.js';
import { categoriesRoutes } from './modules/categories/categories.routes.js';
import { requirementsRoutes } from './modules/requirements/requirements.routes.js';
import { listingRoutes } from './modules/listings/listing.routes.js';

// Tier 3: INTELLIGENCE
import { matchingRoutes } from './modules/matching/matching.routes.js';
import { intelligenceRoutes } from './modules/intelligence/intelligence.routes.js';

// Tier 4: COMMERCE
import { ordersRoutes } from './modules/orders/orders.routes.js';
import { negotiationsRoutes } from './modules/negotiations/negotiations.routes.js';

// Tier 5: LOGISTICS
import { logisticsRoutes } from './modules/logistics/logistics.routes.js';
import { vehiclesRoutes } from './modules/vehicles/vehicles.routes.js';

// Tier 6: CIRCULARITY
import { impactRoutes } from './modules/impact/impact.routes.js';
import { circularityRoutes } from './modules/circularity/circularity.routes.js';

// Tier 7: TRUST
import { reviewsRoutes } from './modules/reviews/reviews.routes.js';
import { trustRoutes } from './modules/trust/trust.routes.js';

// Tier 8: EXPERIENCE
import { notificationsRoutes } from './modules/notifications/notifications.routes.js';
import { experienceRoutes } from './modules/experience/experience.routes.js';
import { carbonRoutes } from './modules/carbon/carbon.routes.js';
import { transactionRoutes } from './modules/transaction/transaction.routes.js';
import { routeRoutes } from './modules/route/route.routes.js';

export const createApp = (): Express => {
  const app = express();

  // Security Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());

  app.get('/', (_req, res) => {
    res.json({
      name: 'LoopLedger API',
      status: 'ok',
      frontend: env.CLIENT_URL,
      health: '/health',
      readiness: '/ready',
      api: '/api/v1',
    });
  });

  // Global Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests, please try again later',
        fields: {},
      },
    },
  });
  app.use('/api/', limiter);

  // Infrastructure Probes
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/ready', (_req, res) => {
    const isReady = checkDBReady();
    if (isReady) {
      res.json({ status: 'ready', database: 'connected' });
    } else {
      res.status(503).json({ status: 'not_ready', database: 'disconnected' });
    }
  });

  // REST API v1 Modules (Mounted across the 8-tier domain pipeline)

  // 1. IDENTITY
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/organizations', organizationsRoutes);
  app.use('/api/v1/facilities', facilitiesRoutes);

  // 2. CATALOG
  app.use('/api/v1/materials', materialsRoutes);
  app.use('/api/v1/categories', categoriesRoutes);
  app.use('/api/v1/requirements', requirementsRoutes);
  app.use('/api/v1/listings', listingRoutes);

  // 3. INTELLIGENCE
  app.use('/api/v1/matching', matchingRoutes);
  app.use('/api/v1/intelligence', intelligenceRoutes);

  // 4. COMMERCE
  app.use('/api/v1/orders', ordersRoutes);
  app.use('/api/v1/negotiations', negotiationsRoutes);

  // 5. LOGISTICS
  app.use('/api/v1/logistics', logisticsRoutes);
  app.use('/api/v1/vehicles', vehiclesRoutes);

  // 6. CIRCULARITY
  app.use('/api/v1/impact', impactRoutes);
  app.use('/api/v1/circularity', circularityRoutes);

  // 7. TRUST
  app.use('/api/v1/reviews', reviewsRoutes);
  app.use('/api/v1/trust', trustRoutes);

  // 8. EXPERIENCE
  app.use('/api/v1/notifications', notificationsRoutes);
  app.use('/api/v1/experience', experienceRoutes);
app.use('/api/v1/carbon', carbonRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/routes', routeRoutes);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};

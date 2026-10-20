import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { initSockets } from './sockets/index.js';

const startServer = async () => {
  // Connect to database
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  // Initialize Real-time WebSockets
  initSockets(server);

  server.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`Health check: http://localhost:${env.PORT}/health`);
    logger.info(`Readiness check: http://localhost:${env.PORT}/ready`);
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed.');
      void disconnectDB().finally(() => process.exit(0));
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((error) => {
  logger.error('Fatal error starting application', { error });
  process.exit(1);
});

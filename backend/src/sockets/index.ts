import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

let io: SocketIOServer | null = null;

export const initSockets = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket client connected: ${socket.id}`);

    // Prepared hook: Client joins organization or order room
    socket.on('join', (room: string) => {
      socket.join(room);
      logger.debug(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket client disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.io server initialized');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  fields?: Record<string, string>;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');

  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      fields[path] = e.message;
    });

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        fields,
      },
    });
    return;
  }

  if (statusCode >= 500) {
    logger.error('Unhandled Server Error', {
      message: err.message,
      stack: err.stack,
      code: errorCode,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred',
      fields: err.fields || {},
    },
  });
};

import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred';

  // In development, log the error internally
  if (process.env.NODE_ENV !== 'production') {
    console.error('[SafeReplay Error Handler]', err);
  }

  // Never expose raw stack trace or internal server path to end-users
  return res.status(status).json({
    success: false,
    message,
    status: 'error',
    timestamp: new Date().toISOString()
  });
}

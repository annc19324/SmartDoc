import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/api-response.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Unhandled Error:', err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(
    res,
    message,
    status,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { errorResponse } from '../utils/api-response.js';

export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: This action requires one of the following roles: [${roles.join(', ')}]`,
        403
      );
    }

    next();
  };
};

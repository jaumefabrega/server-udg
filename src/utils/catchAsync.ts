import { Response, NextFunction } from 'express';
import { Auth0Request } from '../interfaces';

export const catchAsync =
  (fn: any) => (req: Auth0Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };

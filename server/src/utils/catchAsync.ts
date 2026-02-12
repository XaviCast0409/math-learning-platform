import { Request, Response, NextFunction } from 'express';

/**
 * Higher-Order Function to wrap async controllers.
 * automatically catches errors and passes them to the next() middleware.
 * Use this to eliminate try-catch blocks in controllers.
 */
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

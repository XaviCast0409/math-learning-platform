import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../../services/admin/StatsService';
import { catchAsync } from '../../utils/catchAsync';

export class StatsController {
  static getDashboard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await StatsService.getDashboardStats();
    res.json(stats);
  });
}

import { Request, Response } from 'express';
import { StatsService } from '../../services/admin/StatsService';

export class StatsController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const stats = await StatsService.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
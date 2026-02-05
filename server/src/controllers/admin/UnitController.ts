import { Request, Response } from 'express';
import { UnitService } from '../../services/admin/UnitService';

export class UnitController {

  static async createUnit(req: Request, res: Response) {
    try {
      // Se espera { course_id, title, order_index, description }
      const unit = await UnitService.create(req.body);
      res.status(201).json(unit);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateUnit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unit = await UnitService.update(Number(id), req.body);
      res.json(unit);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async deleteUnit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await UnitService.delete(Number(id));
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}
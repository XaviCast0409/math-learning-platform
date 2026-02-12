import { Request, Response, NextFunction } from 'express';
import { UnitService } from '../../services/admin/UnitService';
import { catchAsync } from '../../utils/catchAsync';

export class UnitController {

  static createUnit = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Se espera { course_id, title, order_index, description }
    const unit = await UnitService.create(req.body);
    res.status(201).json(unit);
  });

  static updateUnit = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const unit = await UnitService.update(Number(id), req.body);
    res.json(unit);
  });

  static deleteUnit = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await UnitService.delete(Number(id));
    res.json(result);
  });
}

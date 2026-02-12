import { Request, Response, NextFunction } from 'express';
import { ExerciseService } from '../../services/admin/ExerciseService';
import { catchAsync } from '../../utils/catchAsync';

export class ExerciseController {

  static createExercise = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // req.body debe incluir options como objeto/array si es multiple_choice
    const exercise = await ExerciseService.create(req.body);
    res.status(201).json(exercise);
  });

  static updateExercise = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const exercise = await ExerciseService.update(Number(id), req.body);
    res.json(exercise);
  });

  static deleteExercise = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await ExerciseService.delete(Number(id));
    res.json({ message: 'Ejercicio eliminado' });
  });
}

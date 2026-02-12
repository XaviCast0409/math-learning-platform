import { Request, Response, NextFunction } from 'express';
import { LessonService } from '../../services/admin/LessonService';
import { catchAsync } from '../../utils/catchAsync';

export class LessonController {

  /**
   * GET /admin/lessons/:id
   * Trae la lección CON sus ejercicios para el panel de edición
   */
  static getLessonDetail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const lesson = await LessonService.getByIdWithExercises(Number(id));
    if (!lesson) {
      res.status(404).json({ message: 'Lección no encontrada' });
      return;
    }
    res.json(lesson);
  });

  static createLesson = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Se espera { unit_id, title, order_index, theory_content, xp_reward }
    const lesson = await LessonService.create(req.body);
    res.status(201).json(lesson);
  });

  static updateLesson = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const lesson = await LessonService.update(Number(id), req.body);
    res.json(lesson);
  });

  static deleteLesson = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await LessonService.delete(Number(id));
    res.json(result);
  });
}

import { Request, Response } from 'express';
import { LessonService } from '../../services/admin/LessonService';

export class LessonController {

  /**
   * GET /admin/lessons/:id
   * Trae la lección CON sus ejercicios para el panel de edición
   */
  static async getLessonDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const lesson = await LessonService.getByIdWithExercises(Number(id));
      if (!lesson) {
         res.status(404).json({ message: 'Lección no encontrada' });
         return; 
      }
      res.json(lesson);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createLesson(req: Request, res: Response) {
    try {
      // Se espera { unit_id, title, order_index, theory_content, xp_reward }
      const lesson = await LessonService.create(req.body);
      res.status(201).json(lesson);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateLesson(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const lesson = await LessonService.update(Number(id), req.body);
      res.json(lesson);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async deleteLesson(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await LessonService.delete(Number(id));
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}
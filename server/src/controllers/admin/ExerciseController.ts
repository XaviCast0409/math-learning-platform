import { Request, Response } from 'express';
import { ExerciseService } from '../../services/admin/ExerciseService';

export class ExerciseController {

  static async createExercise(req: Request, res: Response) {
    try {
      // req.body debe incluir options como objeto/array si es multiple_choice
      const exercise = await ExerciseService.create(req.body);
      res.status(201).json(exercise);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateExercise(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const exercise = await ExerciseService.update(Number(id), req.body);
      res.json(exercise);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async deleteExercise(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ExerciseService.delete(Number(id));
      res.json({ message: 'Ejercicio eliminado' });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}
import { Request, Response, NextFunction } from 'express';
import { LessonService } from '../services/lesson.service';
import { LogService } from '../services/admin/LogService'

// GET: Traer ejercicios
export const getLessonContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = await LessonService.getLessonContent(Number(id));
    
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

// POST: Enviar resultados
export const completeLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    // 👇 AHORA RECIBIMOS LIVES
    const { stars, lives } = req.body; 

    // Pasamos lives al servicio
    const result = await LessonService.completeLesson(userId, Number(id), stars, lives);

    await LogService.log(
       userId, 
       'LESSON_COMPLETE', 
       `Lección ${id} completada con ${stars} estrellas.`,
       req.ip
    );

    console.log(result);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
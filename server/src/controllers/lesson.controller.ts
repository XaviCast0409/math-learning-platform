import { Request, Response, NextFunction } from 'express';
import { lessonService } from '../services/lesson.service';
import { logService } from '../services/admin/LogService';
import { catchAsync } from '../utils/catchAsync';

// GET: Traer ejercicios
export const getLessonContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const data = await lessonService.getLessonContent(Number(id));

  res.status(200).json({
    status: 'success',
    data
  });
});

// POST: Enviar resultados
export const completeLesson = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id; // Usar tipado seguro si es posible, o (req as any) si no. Preferimos seguro.
  if (!userId) {
    // Fallback si no hay tipo (aunque debería estar)
    throw new Error("No user ID found");
  }

  // 👇 AHORA RECIBIMOS LIVES
  const { stars, lives } = req.body;

  // Pasamos lives al servicio
  const result = await lessonService.completeLesson(userId, Number(id), stars, lives);

  await logService.log(
    userId,
    'LESSON_COMPLETE',
    `Lección ${id} completada con ${stars} estrellas.`,
    req.ip || ''
  );

  res.status(200).json({
    status: 'success',
    data: result
  });
});

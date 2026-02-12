import { Request, Response, NextFunction } from 'express';
import { studyService } from '../services/study.service';
import { Deck } from '../models';
import AppError from '../utils/AppError';
import { logService } from '../services/admin/LogService';
import { catchAsync } from '../utils/catchAsync';

// 1. Iniciar Sesión de Estudio
export const startSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  const { deckId } = req.params;

  if (!deckId) {
    throw new AppError('Se requiere el ID del mazo (deckId)', 400);
  }

  const sessionData = await studyService.startSession(userId, Number(deckId));

  res.status(200).json({
    status: 'success',
    data: sessionData
  });
});

// 2. Sincronizar Progreso (Guardar respuestas)
export const syncProgress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  const { updates, xpToAdd, gemsToAdd } = req.body;

  if (!updates || !Array.isArray(updates)) {
    throw new AppError('Faltan datos de progreso (updates array)', 400);
  }

  const result = await studyService.syncProgress({
    userId,
    updates,
    xpToAdd: Number(xpToAdd) || 0,
    gemsToAdd: Number(gemsToAdd) || 0
  });

  if (result.xpEarned > 0 || result.gemsEarned > 0) {
    await logService.log(
      userId,
      'STUDY_SYNC',
      `Repaso completado. Ganó ${result.xpEarned} XP y ${result.gemsEarned} Gemas.`,
      req.ip || ''
    );
  }

  res.status(200).json({
    status: 'success',
    data: result
  });
});

// 3. (Extra) Listar Mazos por Unidad
export const getDecksByUnit = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { unitId } = req.params;

  const decks = await Deck.findAll({
    where: { unit_id: unitId, active: true }
  });

  res.status(200).json({
    status: 'success',
    data: { decks }
  });
});

export const getAllDecks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const filters = {
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    search: req.query.search as string | undefined,
    unit_id: req.query.unit_id ? Number(req.query.unit_id) : undefined,
    active: req.query.active as string | undefined,
    course_id: req.query.course_id ? Number(req.query.course_id) : undefined,
  };
  const decks = await studyService.getAllDecks(filters);

  res.status(200).json({
    status: 'success',
    data: { decks }
  });
});

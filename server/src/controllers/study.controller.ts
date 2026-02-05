import { Request, Response, NextFunction } from 'express';
import { StudyService } from '../services/study.service';
import { Deck } from '../models'; // Opcional, para listar mazos si quisieras
import AppError from '../utils/AppError';
import { LogService } from '../services/admin/LogService'

// 1. Iniciar Sesión de Estudio
export const startSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { deckId } = req.params;

    if (!deckId) {
      return next(new AppError('Se requiere el ID del mazo (deckId)', 400));
    }

    // Llamamos al servicio inteligente
    const sessionData = await StudyService.startSession(userId, Number(deckId));

    res.status(200).json({
      status: 'success',
      data: sessionData
    });
  } catch (error) {
    next(error);
  }
};

// 2. Sincronizar Progreso (Guardar respuestas)
export const syncProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    
    // Leemos los nuevos campos
    const { updates, xpToAdd, gemsToAdd } = req.body; 

    if (!updates || !Array.isArray(updates)) {
      return next(new AppError('Faltan datos de progreso (updates array)', 400));
    }

    // Ejecutamos el servicio
    const result = await StudyService.syncProgress({
      userId,
      updates,
      xpToAdd: Number(xpToAdd) || 0,
      gemsToAdd: Number(gemsToAdd) || 0
    });

    // 👇 LOG MEJORADO: Usamos 'result' en lugar de las variables del body
    // Así el log dirá "Ganó 200 XP" si tenía poción x2, en lugar de "Ganó 100 XP".
    if (result.xpEarned > 0 || result.gemsEarned > 0) {
        await LogService.log(
            userId, 
            'STUDY_SYNC', 
            `Repaso completado. Ganó ${result.xpEarned} XP y ${result.gemsEarned} Gemas.`,
            req.ip
        );
    }
    
    // Debug en consola
    console.log('[StudySync] Result:', result);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 3. (Extra) Listar Mazos por Unidad
// Útil para que el frontend sepa qué mostrar antes de iniciar
export const getDecksByUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { unitId } = req.params;

    // Consulta directa simple (o podrías moverlo a un DeckService)
    const decks = await Deck.findAll({
      where: { unit_id: unitId, active: true } // ✅ Correcto: 'unit_id'
    });

    res.status(200).json({
      status: 'success',
      data: { decks }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDecks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      search: req.query.search as string | undefined,
      unit_id: req.query.unit_id ? Number(req.query.unit_id) : undefined,
      active: req.query.active as string | undefined,
      course_id: req.query.course_id ? Number(req.query.course_id) : undefined,
    };
    const decks = await StudyService.getAllDecks(filters);

    res.status(200).json({
      status: 'success',
      data: { decks }
    });
  } catch (error) {
    next(error);
  }
};
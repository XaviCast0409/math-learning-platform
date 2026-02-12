import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { validateResult } from '../middlewares/validate.middleware';
import { syncProgressValidators } from '../middlewares/study.validators';
import * as StudyController from '../controllers/study.controller';

const router = Router();

// Todas las rutas de estudio requieren autenticación
router.use(protect);

// GET /api/study/unit/:unitId/decks -> Ver mazos disponibles en una unidad
router.get('/unit/:unitId/decks', StudyController.getDecksByUnit);

// GET /api/study/deck/:deckId/start -> Pedir las cartas para iniciar sesión (20 min)
router.get('/deck/:deckId/start', StudyController.startSession);

// POST /api/study/sync -> Enviar mis respuestas para que el algoritmo guarde
router.post(
    '/sync',
    syncProgressValidators,
    validateResult,
    StudyController.syncProgress
);

router.get('/decks', StudyController.getAllDecks);

export default router;
import { Router } from 'express';
import { getLessonContent, completeLesson } from '../controllers/lesson.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect); // Rutas protegidas

// GET /api/lessons/1/play  -> Trae teoría y ejercicios
router.get('/:id/play', getLessonContent);

// POST /api/lessons/1/complete -> Envía el resultado
router.post('/:id/complete', completeLesson);

export default router;
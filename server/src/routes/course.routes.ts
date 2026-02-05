import { Router } from 'express';
import { getCourses, getCourseMap } from '../controllers/course.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas de cursos requieren login
router.use(protect);

// GET /api/courses -> Lista todos
router.get('/', getCourses);

// GET /api/courses/1/map -> Trae el árbol con el progreso
router.get('/:id/map', getCourseMap);

export default router;
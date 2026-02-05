// src/routes/admin.routes.ts
import { Router } from 'express';
import { CourseController } from '../controllers/admin/CourseController';
import { UnitController } from '../controllers/admin/UnitController';
import { LessonController } from '../controllers/admin/LessonController';
import { ExerciseController } from '../controllers/admin/ExerciseController';
import { AdminAuthController } from '../controllers/admin/AdminAuthController';
import { AdminUserController } from '../controllers/admin/AdminUserController';
import { ProductController } from '../controllers/admin/ProductController';
import { DeckController } from '../controllers/admin/DeckController';
import { FlashcardController } from '../controllers/admin/FlashcardController';
import { StatsController } from '../controllers/admin/StatsController';

// Aquí podrías importar un middleware 'isAdmin' para proteger estas rutas
import { requireAdmin, protect } from '../middlewares/auth.middleware';

const router = Router();

// --- CURSOS ---
router.get('/courses', CourseController.getCourses); // Lista paginada
router.get('/courses/:id/structure', CourseController.getCourseDetail); // Árbol completo
router.post('/courses', CourseController.createCourse);
router.put('/courses/:id', CourseController.updateCourse);
router.delete('/courses/:id', CourseController.deleteCourse); // Soft delete
router.post('/courses/:id/restore', CourseController.restoreCourse); // Restore

// --- UNIDADES ---
router.post('/units', UnitController.createUnit);
router.put('/units/:id', UnitController.updateUnit);
router.delete('/units/:id', UnitController.deleteUnit);

// --- LECCIONES ---
router.get('/lessons/:id', LessonController.getLessonDetail); // Obtiene lección + ejercicios
router.post('/lessons', LessonController.createLesson);
router.put('/lessons/:id', LessonController.updateLesson);
router.delete('/lessons/:id', LessonController.deleteLesson);

// --- EJERCICIOS ---
router.post('/exercises', ExerciseController.createExercise);
router.put('/exercises/:id', ExerciseController.updateExercise);
router.delete('/exercises/:id', ExerciseController.deleteExercise);

// --- AUTH (Público para admins) ---
router.post('/auth/login', AdminAuthController.login);

// --- GESTIÓN DE USUARIOS (Protegido) ---
router.get('/users', protect, requireAdmin, AdminUserController.getAllUsers);
router.put('/users/:userId/password', protect, requireAdmin, AdminUserController.forceChangePassword);
router.delete('/users/:userId', protect, requireAdmin, AdminUserController.banUser); // Banear
router.post('/users/:userId/restore', protect, requireAdmin, AdminUserController.unbanUser); // Desbanear

// --- PRODUCTOS / TIENDA ---
router.get('/products', protect, requireAdmin, ProductController.getProducts);
router.get('/products/:id', protect, requireAdmin, ProductController.getProductDetail);
router.post('/products', protect, requireAdmin, ProductController.createProduct);
router.put('/products/:id', protect, requireAdmin, ProductController.updateProduct);
router.delete('/products/:id', protect, requireAdmin, ProductController.deleteProduct);
// --- MAZOS (DECKS) ---
router.get('/decks', DeckController.getDecks); // Soporta ?unit_id=X
router.get('/decks/:id', DeckController.getDeckDetail);
router.post('/decks', DeckController.createDeck);
router.put('/decks/:id', DeckController.updateDeck);
router.patch('/decks/:id/toggle', DeckController.toggleDeckStatus); // Deshabilitar/Habilitar

// --- FLASHCARDS ---
// Obtener cartas de un mazo específico
router.get('/decks/:deckId/cards', FlashcardController.getCardsByDeck);

// CRUD Cartas
router.post('/flashcards', FlashcardController.createCard);
router.put('/flashcards/:id', FlashcardController.updateCard);
router.delete('/flashcards/:id', FlashcardController.deleteCard);

// --- ESTADÍSTICAS ---
router.get('/stats/dashboard', protect, requireAdmin, StatsController.getDashboard);

// ==========================================
// 🎓 MODO PROFESOR / SOPORTE (DETALLES AVANZADOS)
// ==========================================
// 1. Perfil General
router.get('/users/:userId', AdminUserController.getUserDetail);

// 2. Progreso Académico (Tab "Historial Académico")
router.get('/users/:userId/academic', AdminUserController.getAcademicProgress);

// 3. Inventario (Tab "Mochila")
router.get('/users/:userId/inventory', AdminUserController.getUserInventory);

// 4. Gestión de Ítems (Regalar o Quitar ítems manualmente)
router.post('/users/:userId/inventory', AdminUserController.grantItem);         // Regalar ítem
router.delete('/users/:userId/inventory/:itemId', AdminUserController.revokeItem); // Quitar ítem
router.post('/users/:userId/gems', AdminUserController.grantGems);

// 5. Logs de Actividad (Tab "Logs")
router.get('/users/:userId/logs', AdminUserController.getActivityLogs);

export default router;
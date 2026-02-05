import { Router } from 'express';
import * as clanController from '../controllers/clan.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

// --- RUTAS GET ---

// 1. Rutas específicas (Deben ir primero)
router.get('/me', clanController.getMyClan);           // Obtener mi clan
router.get('/war/current', clanController.getCurrentWar); // Estado de guerra actual
router.get('/war/pending', clanController.getPendingChallenges); // 👈 FALTABA ESTA (Retos pendientes)

// 2. Búsqueda
router.get('/', clanController.searchClans);           // Buscar clanes (?search=...)

// 3. Rutas dinámicas (Deben ir al final de los GET)
// Esta atiende a clanApi.getClanDetails y clanApi.getClanById
router.get('/:id', clanController.getClanById);        // 👈 FALTABA ESTA (Ver perfil de otro clan)


// --- RUTAS POST ---
router.post('/', clanController.createClan);           // Crear clan
router.post('/:id/join', clanController.joinClan);     // Unirse a clan
router.post('/leave', clanController.leaveClan);       // Salir del clan

// Acciones de Guerra
router.post('/war/challenge', clanController.challengeClan);
router.post('/war/respond', clanController.respondToChallenge);


// --- RUTAS DELETE ---
router.delete('/members/:memberId', clanController.kickMember); // Expulsar

export default router;
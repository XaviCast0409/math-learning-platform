// src/routes/ranking.routes.ts
import { Router } from 'express';
import * as RankingController from '../controllers/ranking.controller';
import { protect } from '../middlewares/auth.middleware'; // Tu middleware de protección

const router = Router();

// Rutas públicas (o protegidas según prefieras)
router.get('/leagues-meta', RankingController.getLeaguesMetadata);

// Rutas protegidas (Usuario debe estar logueado para ver rankings detallados)
router.use(protect);

router.get('/global', RankingController.getGlobalRanking);
router.get('/me', RankingController.getMyRank); // Importante poner esta antes de :leagueName para evitar conflictos
router.get('/league/:leagueName', RankingController.getLeagueRanking);

export default router;
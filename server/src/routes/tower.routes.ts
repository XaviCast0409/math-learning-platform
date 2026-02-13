import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import * as towerController from '../controllers/tower.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.post('/start', towerController.startTowerRun);
router.get('/status', towerController.getTowerStatus);
router.post('/submit', towerController.submitTowerAnswer);
router.get('/leaderboard', towerController.getTowerLeaderboard);

export default router;

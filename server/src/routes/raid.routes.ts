import { Router, RequestHandler } from 'express'; // Import RequestHandler
import * as RaidController from '../controllers/raid.controller';
import { protect, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Cast controllers to RequestHandler
router.get('/current', protect, RaidController.getCurrentBoss as RequestHandler);
router.post('/spawn', protect, requireAdmin, RaidController.spawnBoss as RequestHandler);

// If you keep the manual attack route for testing:
// router.post('/attack', protect, RaidController.attackBossManual as RequestHandler);

export default router;
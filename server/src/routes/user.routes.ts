import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { validateResult } from '../middlewares/validate.middleware';
import { manualXpValidators } from '../middlewares/user.validators';
import * as UserController from '../controllers/user.controller';

const router = Router();

router.use(protect);

router.get('/progress', UserController.getUserProgress);
router.post(
    '/add-xp',
    manualXpValidators,
    validateResult,
    UserController.addXpManually
); // Solo para dev/admin

export default router;
import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { validateResult } from '../middlewares/validate.middleware';
import { registerValidators, loginValidators } from '../middlewares/auth.validators';
// Assuming protect middleware exists and works
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/register',
  registerValidators,
  validateResult,
  register
);

router.post(
  '/login',
  loginValidators,
  validateResult,
  login
);

router.get('/me', protect, getMe);

export default router;
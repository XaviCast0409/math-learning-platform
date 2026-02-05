import { Router } from 'express';
import { body } from 'express-validator'; // Importamos el validador
import { register, login, getMe } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/register',
  [
    // Reglas de validación
    body('username')
      .trim()
      .notEmpty().withMessage('El nombre de usuario es obligatorio')
      .isLength({ min: 3 }).withMessage('El usuario debe tener al menos 3 caracteres'),
    
    body('email')
      .trim()
      .isEmail().withMessage('Debe ser un correo electrónico válido'),
    
    body('password')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
      
    // Middleware que ejecuta las reglas
    validateRequest
  ],
  register
);

// 👇 NUEVA RUTA LOGIN
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Ingresa un correo válido'),
    body('password').notEmpty().withMessage('Ingresa tu contraseña'),
    validateRequest
  ],
  login
);

router.get('/me', protect, getMe);

export default router;
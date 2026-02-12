import { body } from 'express-validator';

export const registerValidators = [
    body('username')
        .notEmpty()
        .withMessage('El nombre de usuario es obligatorio')
        .isLength({ min: 3 })
        .withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
    body('email')
        .isEmail()
        .withMessage('Debe ser un correo electrónico válido'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
];

export const loginValidators = [
    body('email')
        .isEmail()
        .withMessage('Debe ser un correo electrónico válido'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
];

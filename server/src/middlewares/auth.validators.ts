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
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('full_name')
        .notEmpty()
        .withMessage('El nombre completo es obligatorio')
        .isLength({ min: 3 })
        .withMessage('El nombre completo debe tener al menos 3 caracteres'),
    body('age')
        .optional()
        .isInt({ min: 5, max: 100 })
        .withMessage('La edad debe ser un número entre 5 y 100'),
    body('phone')
        .optional()
        .matches(/^[0-9]{9,15}$/)
        .withMessage('El teléfono debe tener entre 9 y 15 dígitos'),
    body('grade_level')
        .notEmpty()
        .withMessage('El año de estudio es obligatorio')
        .isIn([
            '4to_primaria', '5to_primaria', '6to_primaria',
            '1ro_secundaria', '2do_secundaria', '3ro_secundaria', '4to_secundaria', '5to_secundaria'
        ])
        .withMessage('Año de estudio inválido')
];

export const loginValidators = [
    body('email')
        .isEmail()
        .withMessage('Debe ser un correo electrónico válido'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
];

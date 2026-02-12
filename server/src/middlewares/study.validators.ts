import { body } from 'express-validator';

export const syncProgressValidators = [
    body('updates')
        .exists().withMessage('El array de actualizaciones es requerido')
        .isArray().withMessage('Updates debe ser un array'),
    body('updates.*.cardId')
        .exists().withMessage('CardId es requerido en cada update')
        .isInt(),
    body('updates.*.quality')
        .exists().withMessage('Quality es requerido en cada update')
        .isInt({ min: 0, max: 5 }).withMessage('Quality debe estar entre 0 y 5'),
    body('xpToAdd')
        .optional()
        .isInt({ min: 0 }).withMessage('XP a añadir debe ser positivo'),
    body('gemsToAdd')
        .optional()
        .isInt({ min: 0 }).withMessage('Gemas a añadir debe ser positivo')
];

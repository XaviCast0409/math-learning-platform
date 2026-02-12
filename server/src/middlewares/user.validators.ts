import { body } from 'express-validator';

export const manualXpValidators = [
    body('amount')
        .exists().withMessage('La cantidad es requerida')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo')
];

import { body } from 'express-validator';

export const buyItemValidators = [
    body('productId')
        .exists().withMessage('El ID del producto es requerido')
        .isInt().withMessage('El ID del producto debe ser un número entero')
];

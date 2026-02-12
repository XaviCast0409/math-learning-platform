import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { validateResult } from '../middlewares/validate.middleware';
import { buyItemValidators } from '../middlewares/shop.validators';
import * as ShopController from '../controllers/shop.controller';

const router = Router();

router.use(protect); // Todo protegido
router.get('/', ShopController.getShopItems);
router.post(
    '/buy',
    buyItemValidators,
    validateResult,
    ShopController.buyItem
);

export default router;
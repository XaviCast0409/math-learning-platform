import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import * as ShopController from '../controllers/shop.controller';

const router = Router();

router.use(protect); // Todo protegido
router.get('/', ShopController.getShopItems);
router.post('/buy', ShopController.buyItem);

export default router;
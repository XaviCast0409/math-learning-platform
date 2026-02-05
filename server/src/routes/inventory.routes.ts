import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import * as InventoryController from '../controllers/inventory.controller';

const router = Router();

router.use(protect); // Todas requieren login

// 1. Ver Mochila (Items NO equipados y Consumibles)
// GET /api/inventory
router.get('/', InventoryController.getInventory);

// 2. Ver Avatar (Solo items EQUIPADOS) - ¡NUEVO! 
// Úsalo al cargar el juego para saber qué ropa dibujar.
// GET /api/inventory/avatar
router.get('/avatar', InventoryController.getAvatar);

// 3. Equipar/Desequipar ítem (Paper Doll)
// POST /api/inventory/equip -> { "userItemId": 5 }
router.post('/equip', InventoryController.equipItem);

// 4. Usar consumible
// POST /api/inventory/use -> { "userItemId": 8 }
router.post('/use', InventoryController.useItem);

export default router;
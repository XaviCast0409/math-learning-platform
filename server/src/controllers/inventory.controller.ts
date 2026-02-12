import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';
import { logService } from '../services/admin/LogService';
import { catchAsync } from '../utils/catchAsync';

// 1. Obtener todo el inventario (Mochila: consumibles y no equipados)
export const getInventory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const items = await inventoryService.getInventory(userId);

  res.status(200).json({ status: 'success', data: { items } });
});

// 2. NUEVO: Obtener solo el Avatar (Items equipados actualmente)
// Esto lo llama el frontend al iniciar para "vestir" al muñeco.
export const getAvatar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const equippedItems = await inventoryService.getEquippedItems(userId);

  res.status(200).json({
    status: 'success',
    data: { equippedItems }
  });
});

// 3. Equipar ítem (Avatar/Cosmético)
export const equipItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const { userItemId } = req.body; // El ID de la tabla user_items

  if (!userItemId) return res.status(400).json({ message: 'Falta userItemId' });

  // 👇 USAMOS EL NUEVO MÉTODO DEL SERVICIO
  // Este se encarga de quitar el sombrero viejo y poner el nuevo
  const result = await inventoryService.equipAvatarItem(userId, userItemId);

  // Log de auditoría
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const finalIp = Array.isArray(ip) ? ip[0] : ip;

  await logService.log(userId, 'ITEM_EQUIP', `Equipó/Desequipó ítem cosmético ID ${userItemId}`, finalIp);

  res.status(200).json({
    status: 'success',
    message: result.message,
    data: {
      // Devolvemos el avatar actualizado completo para que el frontend se redibuje
      updatedAvatar: result.updatedAvatar
    }
  });
});

// 4. Usar ítem (Consumibles: Pociones, etc.)
export const useItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const { userItemId } = req.body;

  if (!userItemId) return res.status(400).json({ message: 'Falta userItemId' });

  const result = await inventoryService.useItem(userId, userItemId);

  // Log de auditoría
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const finalIp = Array.isArray(ip) ? ip[0] : ip;

  await logService.log(userId, 'ITEM_USE', `Usó consumible ID ${userItemId}. Resultado: ${result.message}`, finalIp);

  res.status(200).json({
    status: 'success',
    message: result.message,
    data: result // Incluye updatedUser (vidas, xp, etc.)
  });
});

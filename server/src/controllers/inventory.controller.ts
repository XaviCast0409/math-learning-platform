import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { LogService } from '../services/admin/LogService';

// 1. Obtener todo el inventario (Mochila: consumibles y no equipados)
export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const items = await InventoryService.getInventory(userId);

    res.status(200).json({ status: 'success', data: { items } });
  } catch (error) { next(error); }
};

// 2. NUEVO: Obtener solo el Avatar (Items equipados actualmente)
// Esto lo llama el frontend al iniciar para "vestir" al muñeco.
export const getAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const equippedItems = await InventoryService.getEquippedItems(userId);
    
    res.status(200).json({ 
      status: 'success', 
      data: { equippedItems } 
    });
  } catch (error) { next(error); }
};

// 3. Equipar ítem (Avatar/Cosmético)
export const equipItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { userItemId } = req.body; // El ID de la tabla user_items

    if (!userItemId) return res.status(400).json({ message: 'Falta userItemId' });

    // 👇 USAMOS EL NUEVO MÉTODO DEL SERVICIO
    // Este se encarga de quitar el sombrero viejo y poner el nuevo
    const result = await InventoryService.equipAvatarItem(userId, userItemId);

    // Log de auditoría
    await LogService.log(userId, 'ITEM_EQUIP', `Equipó/Desequipó ítem cosmético ID ${userItemId}`);

    res.status(200).json({ 
        status: 'success', 
        message: result.message,
        data: { 
            // Devolvemos el avatar actualizado completo para que el frontend se redibuje
            updatedAvatar: result.updatedAvatar 
        } 
    });
  } catch (error) { next(error); }
};

// 4. Usar ítem (Consumibles: Pociones, etc.)
export const useItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { userItemId } = req.body;

    if (!userItemId) return res.status(400).json({ message: 'Falta userItemId' });

    const result = await InventoryService.useItem(userId, userItemId);
    
    // Log de auditoría
    await LogService.log(userId, 'ITEM_USE', `Usó consumible ID ${userItemId}. Resultado: ${result.message}`);
    
    res.status(200).json({
      status: 'success',
      message: result.message, 
      data: result // Incluye updatedUser (vidas, xp, etc.)
    });
  } catch (error) { next(error); }
};
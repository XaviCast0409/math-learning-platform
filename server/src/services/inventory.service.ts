import { User, UserItem, Product } from '../models';
import AppError from '../utils/AppError';
import { UserService } from './user.service';

export class InventoryService {

  // =========================================================
  // 1. MÉTODOS EXISTENTES (NO TOCADOS, SOLO TYPE-CHECKING)
  // =========================================================

  static async getInventory(userId: number) {
    const items = await UserItem.findAll({
      where: { user_id: userId, is_used: false },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'description', 'image_url', 'category', 'type', 'effect_metadata']
      }],
      order: [['is_equipped', 'DESC'], ['acquired_at', 'DESC']]
    });
    return items;
  }

  static async equipItem(userId: number, userItemId: number) {
    const itemToEquip = await UserItem.findOne({
      where: { id: userItemId, user_id: userId },
      include: [Product]
    });

    if (!itemToEquip) throw new AppError('Ítem no encontrado en tu inventario', 404);
    
    // Casting seguro para TS
    const product = (itemToEquip as any).Product as Product;

    if (product.category !== 'cosmetic') {
      throw new AppError('Este ítem no se puede equipar (tal vez es una poción para "usar")', 400);
    }

    const currentlyEquipped = await UserItem.findAll({
      where: { user_id: userId, is_equipped: true },
      include: [{
        model: Product,
        where: { type: product.type }
      }]
    });

    for (const item of currentlyEquipped) {
      item.is_equipped = false;
      await item.save();
    }

    itemToEquip.is_equipped = true;
    await itemToEquip.save();

    return { 
      message: `Equipado: ${product.name}`, 
      equippedItem: itemToEquip 
    };
  }

  static async useItem(userId: number, userItemId: number) {
    const itemToUse = await UserItem.findOne({
      where: { id: userItemId, user_id: userId },
      include: [Product]
    });

    if (!itemToUse) throw new AppError('Ítem no encontrado', 404);
    if (itemToUse.is_used) throw new AppError('Este ítem ya fue usado', 400);

    const product = (itemToUse as any).Product as Product;
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    let effectMessage = '';
    const meta = product.effect_metadata || {};

    switch (product.type) {
        
        case 'xp_boost_time': 
            const durationMin = meta.duration_minutes || 30;
            const expiryXp = new Date();
            expiryXp.setMinutes(expiryXp.getMinutes() + durationMin);
            
            user.xp_boost_expires_at = expiryXp;
            effectMessage = `¡XP Doble activada por ${durationMin} minutos!`;
            break;

        case 'gem_boost_time':
            const durationGem = meta.duration_minutes || 30;
            const expiryGem = new Date();
            expiryGem.setMinutes(expiryGem.getMinutes() + durationGem);
            
            user.gem_boost_expires_at = expiryGem;
            effectMessage = `¡Gemas Dobles activadas por ${durationGem} minutos!`;
            break;

        case 'xp_boost_instant': 
            const amountXP = meta.amount || 100;
            await UserService.addExperience(userId, amountXP); 
            await user.reload(); 
            effectMessage = `¡Obtuviste +${amountXP} XP!`;
            break;

        case 'refill_health_potion':
            user.lives = 5;
            user.last_life_regen = null;
            effectMessage = '¡Salud restaurada al máximo!';
            break;
        
        case 'real_world_reward':
            effectMessage = 'Cupón canjeado. ¡Muestra esta pantalla a tu profesor!';
            break;

        default:
            throw new AppError('No se puede usar este objeto manualmente', 400);
    }

    itemToUse.is_used = true; 
    await itemToUse.save();
    await user.save(); 

    return {
        message: effectMessage,
        updatedUser: {
            xp: user.xp_total,
            lives: user.lives,
            activeBuffs: { 
                xpExpires: user.xp_boost_expires_at,
                gemExpires: user.gem_boost_expires_at
            }
        }
    };
  }

  // =========================================================
  // 2. NUEVOS MÉTODOS PARA AVATAR (CORREGIDOS)
  // =========================================================

  // A. OBTENER AVATAR (Items equipados)
  static async getEquippedItems(userId: number) {
    return await UserItem.findAll({
      where: { 
        user_id: userId, 
        is_equipped: true 
      },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'image_url', 'type', 'effect_metadata']
      }]
    });
  }

  // B. EQUIPAR ÍTEM (Lógica "Uno por Slot")
  static async equipAvatarItem(userId: number, userItemId: number) {
    // 1. Buscar el ítem (SIN filtrar por tipo todavía, porque no sabemos qué tipo es)
    const itemToEquip = await UserItem.findOne({
      where: { id: userItemId, user_id: userId },
      include: [Product] // Solo incluimos el modelo, sin where
    });

    // Validamos que exista el item Y el producto asociado
    if (!itemToEquip || !itemToEquip.Product) {
      throw new AppError('Ítem no encontrado en tu inventario', 404);
    }

    // Definimos product para usarlo cómodamente
    const product = itemToEquip.Product;

    // 2. Validar que sea cosmético
    if (product.category !== 'cosmetic') {
      throw new AppError('Este ítem no es equipable (es un consumible)', 400);
    }

    const slotType = product.type; // Ej: 'cosmetic_head'

    // 3. DES-EQUIPAR CUALQUIER OTRO ÍTEM DEL MISMO SLOT
    const currentEquipped = await UserItem.findAll({
      where: { 
        user_id: userId, 
        is_equipped: true 
      },
      include: [{
        model: Product,
        where: { type: slotType } // Aquí sí filtramos por el tipo que acabamos de descubrir
      }]
    });

    // Los desmarcamos
    for (const item of currentEquipped) {
      item.is_equipped = false;
      await item.save();
    }

    // 4. EQUIPAR EL NUEVO
    let message = 'Ítem equipado';
    
    // Verificamos si acabamos de desequipar EL MISMO ítem (toggle)
    const wasAlreadyEquipped = currentEquipped.some(i => i.id === itemToEquip.id);
    
    if (!wasAlreadyEquipped) {
       itemToEquip.is_equipped = true;
       await itemToEquip.save();
    } else {
       message = 'Ítem desequipado';
    }

    return { 
      message, 
      item: itemToEquip,
      updatedAvatar: await this.getEquippedItems(userId) 
    };
  }
}
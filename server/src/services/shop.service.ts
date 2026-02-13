import { Product, User, UserItem } from '../models';
import AppError from '../utils/AppError';

export class ShopService {

  // Listar productos activos
  async getProducts() {
    return await Product.findAll({
      where: { active: true },
      order: [['cost_gems', 'ASC']]
    });
  }

  // Lógica de Compra Genérica
  async buyProduct(userId: number, productId: number) {
    const user = await User.findByPk(userId);
    const product = await Product.findByPk(productId);

    if (!user) throw new AppError('Usuario no encontrado', 404);
    if (!product) throw new AppError('Producto no encontrado', 404);

    // 1. VALIDAR GEMAS
    if (user.gems < product.cost_gems) {
      throw new AppError(`Te faltan ${product.cost_gems - user.gems} gemas`, 400);
    }

    // 2. LÓGICA DE ENTREGA (Switch simple vs Genérico)

    // CASO A: Vidas (Es especial porque toca el Core Loop)
    if (product.type === 'life_refill' || product.type === 'refill_health_potion') {
      if (user.lives >= 5) throw new AppError('¡Salud llena!', 400);
      user.lives = 5;
      user.last_life_regen = null;
    }

    // CASO B: Cosméticos Únicos (Skins, Fondos)
    else if (product.category === 'cosmetic') {
      // Verificar si ya lo tiene para no cobrarle doble
      const alreadyOwns = await UserItem.findOne({
        where: { user_id: userId, product_id: product.id }
      });
      if (alreadyOwns) throw new AppError('Ya tienes este artículo', 400);

      // Guardar en inventario
      await UserItem.create({
        user_id: userId,
        product_id: product.id,
        is_equipped: false
      });
    }

    // CASO C: Items de Inventario Acumulables (Escudos de Racha, Pociones)
    else if (product.category === 'inventory') {
      // Simplemente creamos el item. Si compra 10, tendrá 10 filas (o podrías añadir un campo 'quantity')
      // Para simplificar, creamos una entrada nueva por cada compra
      await UserItem.create({
        user_id: userId,
        product_id: product.id,
        is_used: false
      });
    }

    // CASO D: Otros instantáneos (Ej: Comprar 500 XP con Gemas)
    else if (product.type === 'xp_boost_instant') {
      const amount = product.effect_metadata?.amount || 0;
      user.xp_total += amount;
    }

    // 3. COBRAR
    user.gems -= product.cost_gems;
    await user.save();

    return {
      message: `¡Compraste ${product.name}!`,
      product,
      updatedUser: {
        gems: user.gems,
        lives: user.lives,
        xp_total: user.xp_total
      }
    };
  }
}

export const shopService = new ShopService();
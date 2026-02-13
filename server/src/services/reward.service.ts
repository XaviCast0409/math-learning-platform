import { User, UserItem, Product, Clan } from '../models';
import { CLAN_LEVELS } from '../config/clanLevels.config';

export class RewardService {

  /**
   * Calcula las recompensas finales aplicando bonificaciones.
   * Fórmula: (Base + Suma de Bonos Planos) * (1 + Suma de Multiplicadores % + Multiplicadores Globales)
   */
  async calculateBonuses(userId: number, baseXp: number, baseXaviCoins: number, userModel?: User | null) {
    try {
      // 1. Obtener usuario con relaciones si no se pasó
      let user = userModel;

      if (!user || user.clan === undefined || user.user_items === undefined) {
        user = await User.findByPk(userId, {
          include: [
            {
              model: Clan,
              as: 'clan',
              attributes: ['id', 'total_xp', 'name', 'level']
            },
            {
              model: UserItem,
              as: 'user_items', // Asegúrate de que el alias en User.hasMany sea 'user_items'
              where: { is_equipped: true },
              required: false, // Left Join para traer usuario aunque no tenga items
              include: [{ model: Product, where: { category: 'cosmetic' } }]
            }
          ]
        });
      }

      if (!user) return { finalXp: baseXp, finalXaviCoins: baseXaviCoins, appliedBonuses: [] };

      // 2. Variables de Cálculo
      let flatBonusXp = 0;
      let flatBonusXaviCoins = 0;

      let multiplierXp = 1.0; // 1.0 = 100% (Base)
      let multiplierXaviCoins = 1.0;

      const appliedBonuses: string[] = [];
      const now = new Date();

      // --- A. BONUS DE CLAN (Multiplicador) ---
      if (user.clan) {
        const clanLevel = user.clan.level;
        const levelData = CLAN_LEVELS[clanLevel];

        if (levelData && levelData.goldMultiplier > 1.0) {
          // goldMultiplier es ej: 1.10 (10% extra)
          // Sumamos solo el extra al multiplicador global
          const extraMultiplier = levelData.goldMultiplier - 1.0;
          multiplierXaviCoins += extraMultiplier;

          appliedBonuses.push(`Clan Lvl ${clanLevel} (+${Math.round(extraMultiplier * 100)}% XaviCoins)`);
        }
      }

      // --- B. COSMÉTICOS (Plano y Multiplicador) ---
      // Nota: Si pasaste userModel sin includes, inventory podría ser undefined si no se cargó.
      // Asumimos que si se pasa userModel, viene con lo necesario, o el findByPk de arriba lo cubrió.
      // Si user.inventory es un array (por el include), iteramos.
      // Ojo: En Sequelize, si es una relación hasMany, user.inventory suele ser un array.
      // Si usaste user.getInventory(), es una promesa. Aquí asumimos Eager Loading (array).
      const equippedItems = (Array.isArray(user.user_items) ? user.user_items : []) as any[];

      for (const item of equippedItems) {
        if (!item.Product) continue;
        const product = item.Product;
        const meta = product.effect_metadata || {};
        console.log("meta", meta);

        // 1. Support for nested 'passive_bonus'
        if (meta.passive_bonus) {
          const { stat, value, type } = meta.passive_bonus;

          let percent = Number(meta.passive_bonus.percent || 0);

          // Soporte para propiedad 'value' si no existe 'percent'
          const rawValue = Number(value || 0);

          if (!percent && rawValue > 0) {
            // Si value > 1 (e.g. 25), asumimos que es porcentaje entero (25%) -> 0.25
            if (rawValue > 1) percent = rawValue / 100;
            else percent = rawValue;
          }

          if (stat === 'xp') {
            if (percent > 0) {
              multiplierXp += percent;
              appliedBonuses.push(`${product.name} (+${Math.round(percent * 100)}% XP)`);
            }
          }

          if (stat === 'gems' || stat === 'xavicoins') { // Soportar ambos nombres
            if (percent > 0) {
              multiplierXaviCoins += percent;
              appliedBonuses.push(`${product.name} (+${Math.round(percent * 100)}% XaviCoins)`);
            }
          }
        }

        // 2. Support for direct 'xp_bonus' (Legacy)
        if (meta.xp_bonus) {
          const val = Number(meta.xp_bonus);
          if (val > 0) {
            let percent = val;
            if (percent > 1) percent = percent / 100; // Handle 25 vs 0.25
            multiplierXp += percent;
            appliedBonuses.push(`${product.name} (+${Math.round(percent * 100)}% XP)`);
          }
        }

        // 3. Support for direct 'coin_bonus' / 'gem_bonus' (Legacy)
        // Also support plural forms just in case: 'gems_bonus', 'coins_bonus'
        if (meta.coin_bonus || meta.gem_bonus || meta.xavicoin_bonus || meta.gems_bonus || meta.coins_bonus) {
          const val = Number(meta.coin_bonus || meta.gem_bonus || meta.xavicoin_bonus || meta.gems_bonus || meta.coins_bonus);
          if (val > 0) {
            let percent = val;
            if (percent > 1) percent = percent / 100; // Handle 25 vs 0.25
            multiplierXaviCoins += percent;
            appliedBonuses.push(`${product.name} (+${Math.round(percent * 100)}% XaviCoins)`);
          }
        }
      }

      // --- C. POCIONES (Multiplicador Global Final o Aditivo Potente) ---
      // Las pociones "x2" suelen ser x2 al final de todo. 
      // O pueden ser +100% aditivo.
      // Si es "Doble de XP", matemáticamente es `Total * 2`.
      let globalMultiplierXp = 1;
      let globalMultiplierXaviCoins = 1;

      if (user.xp_boost_expires_at && new Date(user.xp_boost_expires_at) > now) {
        globalMultiplierXp = 2; // Duplica TODO
        appliedBonuses.push('Poción de XP (x2)');
      }

      if (user.gem_boost_expires_at && new Date(user.gem_boost_expires_at) > now) {
        globalMultiplierXaviCoins = 2; // Duplica TODO
        appliedBonuses.push('Poción de XaviCoins (x2)');
      }

      // --- CÁLCULO FINAL ---
      // Formula: (Base + Flat) * (Multiplicadores Acumulados) * (Multiplicador Global/Poción)

      let finalXp = (baseXp + flatBonusXp) * multiplierXp * globalMultiplierXp;
      let finalXaviCoins = (baseXaviCoins + flatBonusXaviCoins) * multiplierXaviCoins * globalMultiplierXaviCoins;

      console.log(`[RewardService] 🧮 CALCULATION DEBUG:`);
      console.log(`- User ID: ${userId}`);
      console.log(`- Base XP: ${baseXp} | Base Coins: ${baseXaviCoins}`);
      console.log(`- Multiplier XP: ${multiplierXp} (Items) * ${globalMultiplierXp} (Global)`);
      console.log(`- Multiplier Coins: ${multiplierXaviCoins} (Items/Clan) * ${globalMultiplierXaviCoins} (Global)`);
      console.log(`- Applied Bonuses: ${JSON.stringify(appliedBonuses)}`);
      console.log(`- Final XP: ${finalXp} | Final Coins: ${finalXaviCoins}`);

      return {
        finalXp: Math.floor(finalXp),
        finalXaviCoins: Math.floor(finalXaviCoins),
        appliedBonuses
      };

    } catch (error) {
      console.error('[RewardService] 💥 CRITICAL ERROR in calculateBonuses:', error);
      // Fallback seguro: retornar base sin bonos para evitar crash
      return { finalXp: baseXp, finalXaviCoins: baseXaviCoins, appliedBonuses: [] };
    }
  }
}

export const rewardService = new RewardService();
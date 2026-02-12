import { User, UserItem, Product, Clan } from '../models';
import { CLAN_LEVELS } from '../config/clanLevels.config';

export class RewardService {

  async calculateBonuses(userId: number, baseXp: number, baseGems: number) {
    // console.log(`[RewardService] Calculando para UserID: ${userId}...`); // Debug opcional

    const user = await User.findByPk(userId, {
      include: [{
        model: Clan,
        as: 'clan',
        attributes: ['id', 'total_xp', 'name', 'level'] // Added level explicitly if not inferred
      }]
    });

    if (!user) return { finalXp: baseXp, finalGems: baseGems, bonuses: [] };

    let finalXp = baseXp;
    let finalGems = baseGems;
    const appliedBonuses: string[] = [];
    const now = new Date();

    // --- A. POCIONES ---
    if (user.xp_boost_expires_at && new Date(user.xp_boost_expires_at) > now) {
      // Solo aplicar si hay XP base que multiplicar
      if (baseXp > 0) {
        finalXp *= 2;
        appliedBonuses.push('Poción de XP (x2)');
      }
    }

    if (user.gem_boost_expires_at && new Date(user.gem_boost_expires_at) > now) {
      // Solo aplicar si hay Gemas base que multiplicar
      if (baseGems > 0) {
        finalGems *= 2;
        appliedBonuses.push('Poción de Gemas (x2)');
      }
    }

    // --- B. COSMÉTICOS ---
    const equippedItems = await UserItem.findAll({
      where: { user_id: userId, is_equipped: true },
      include: [{ model: Product, where: { category: 'cosmetic' } }]
    });

    for (const item of equippedItems) {
      const product = (item as any).Product;
      const meta = product.effect_metadata || {};

      if (meta.passive_bonus) {
        const { stat, percent } = meta.passive_bonus;

        if (stat === 'xp') {
          const bonus = Math.floor(baseXp * percent);
          // 👇 CORRECCIÓN: Solo sumar y mostrar si el bono es real (> 0)
          if (bonus > 0) {
            finalXp += bonus;
            appliedBonuses.push(`${product.name} (+${percent * 100}% XP)`);
          }
        }

        if (stat === 'gems') {
          const bonus = Math.ceil(baseGems * percent);
          // 👇 CORRECCIÓN: Solo sumar y mostrar si el bono es real (> 0)
          if (bonus > 0) {
            finalGems += bonus;
            appliedBonuses.push(`${product.name} (+${percent * 100}% Gemas)`);
          }
        }
      }
    }

    // --- C. BONUS DE CLAN 🛡️ ---
    if (user.clan) {
      const clanLevel = user.clan.level;
      const levelData = CLAN_LEVELS[clanLevel];

      if (levelData && levelData.goldMultiplier > 1.0) {

        const bonusPercent = levelData.goldMultiplier - 1;
        let bonusAmount = Math.ceil(baseGems * bonusPercent);

        // Si hay bono configurado y gemas base > 0, dar al menos 1
        if (bonusAmount === 0 && baseGems > 0 && bonusPercent > 0) {
          bonusAmount = 1;
        }

        // Solo mostrar si se ganaron gemas extra
        if (bonusAmount > 0) {
          finalGems += bonusAmount;
          const percentText = Math.round(bonusPercent * 100);
          appliedBonuses.push(`Bonus Clan Nvl ${clanLevel} (+${percentText}% Gemas)`);
        }
      }
    }

    return {
      finalXp: Math.floor(finalXp),
      finalGems: Math.floor(finalGems),
      appliedBonuses
    };
  }
}

export const rewardService = new RewardService();
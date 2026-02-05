import { RaidBoss, RaidParticipation, Exercise, Lesson, User } from '../models'; 
import { Sequelize, Op } from 'sequelize';
// 👇 IMPORTACIONES CLAVE
import { UserService } from './user.service';
import { RewardService } from './reward.service';

export class RaidService {

  // 1. Obtener el Boss Activo actual (Igual)
  static async getActiveBoss() {
    return await RaidBoss.findOne({
      where: {
        status: 'active',
        end_time: { [Op.gt]: new Date() } 
      }
    });
  }

  // 2. Atacar al Boss (Igual)
  static async attackBoss(userId: number, damage: number) {
    const boss = await this.getActiveBoss();
    if (!boss) return null; 

    await boss.decrement('current_hp', { by: damage });
    await boss.reload();

    const [participation] = await RaidParticipation.findOrCreate({
      where: { user_id: userId, raid_boss_id: boss.id },
      defaults: { total_damage_dealt: 0, attacks_count: 0 }
    });

    await participation.increment({
      'total_damage_dealt': damage,
      'attacks_count': 1
    });

    if (boss.current_hp <= 0 && boss.status === 'active') {
      await boss.update({ status: 'defeated', current_hp: 0 });
      return { bossState: 'DEFEATED', participation };
    }

    return { bossState: 'ALIVE', currentHp: boss.current_hp, participation };
  }

  // 3. Admin: Invocar Boss Manualmente (Igual)
  static async spawnBoss(name: string, hp: number, durationHours: number, imageUrl: string) {
    await RaidBoss.update({ status: 'expired' }, { where: { status: 'active' } });

    const endTime = new Date();
    endTime.setHours(endTime.getHours() + durationHours);

    return await RaidBoss.create({
      name,
      total_hp: hp,
      current_hp: hp,
      image_url: imageUrl,
      start_time: new Date(),
      end_time: endTime,
      status: 'active',
      rewards_pool: { xp: 500, gems: 50 } 
    });
  }

  // Obtener preguntas (Igual)
  static async getRaidQuestions(limit: number = 20, excludeIds: number[] = []) {
    return await Exercise.findAll({
      where: {
        type: { [Op.in]: ['multiple_choice', 'true_false'] },
        id: { [Op.notIn]: excludeIds }
      },
      order: [Sequelize.fn('RANDOM')], 
      limit: limit,
      include: [{ model: Lesson, attributes: ['title'] }] 
    });
  }

  // 👇 FUNCIÓN CORREGIDA Y OPTIMIZADA
  static async grantRaidRewards(userIds: number[]) {
    if (userIds.length === 0) return { xp: 0, gems: 0 };

    const BASE_XP = 500;
    const BASE_GEMS = 50;

    console.log(`🎁 Entregando premios a ${userIds.length} héroes...`);

    // Iteramos por cada usuario para aplicar sus bonos INDIVIDUALES
    for (const userId of userIds) {
        try {
            // 1. XP + CLAN + NIVELES (Todo en uno con UserService)
            // Esto suma la XP, revisa si sube de nivel y le da la XP al Clan.
            await UserService.addExperience(userId, BASE_XP);

            // 2. GEMAS (Calculadas con RewardService)
            // UserService no da gemas "arbitrarias", así que las calculamos aquí.
            const gemResult = await RewardService.calculateBonuses(userId, 0, BASE_GEMS);
            
            // Sumamos las gemas finales
            await User.increment(
                { gems: gemResult.finalGems }, 
                { where: { id: userId } }
            );

        } catch (error) {
            console.error(`Error premiando usuario ${userId}:`, error);
        }
    }

    // Retornamos la BASE para mostrarla en el Socket (Frontend)
    // El frontend dirá "+500 XP", pero si alguien tenía poción, habrá ganado 1000 realmente.
    return { xp: BASE_XP, gems: BASE_GEMS };
  }
}
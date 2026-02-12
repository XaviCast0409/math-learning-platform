import { Clan, User, ClanWar } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import { CLAN_LEVELS } from '../config/clanLevels.config';
import AppError from '../utils/AppError';

export class ClanService {

  // =================================================================
  // 🏗️ GESTIÓN BÁSICA (Crear, Unirse)
  // =================================================================

  async createClan(ownerId: number, name: string, description: string, emblemId: string) {
    const t = await sequelize.transaction();

    try {
      const existing = await Clan.findOne({ where: { name }, transaction: t });
      if (existing) throw new AppError('El nombre del clan ya está en uso.', 400);

      const user = await User.findByPk(ownerId, { transaction: t });
      if (!user) throw new AppError('Usuario no encontrado.', 404);
      if (user.clan_id) throw new AppError('Ya perteneces a un clan. Debes salirte primero.', 400);

      const newClan = await Clan.create({
        name,
        description,
        emblem_id: emblemId,
        owner_id: ownerId,
        total_xp: 0
      }, { transaction: t });

      await user.update({ clan_id: newClan.id }, { transaction: t });

      await t.commit();

      return newClan;

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async joinClan(clanId: number, userId: number) {
    const clan = await Clan.findByPk(clanId, {
      include: [{ model: User, as: 'members', attributes: ['id'] }]
    });

    if (!clan) throw new AppError('Clan no encontrado.', 404);

    const members = (clan as any).members as User[];
    if (!members) throw new AppError('Error al cargar miembros del clan.', 500);

    if (members.length >= clan.max_members) {
      throw new AppError(`El clan está lleno (Nivel ${clan.level} cap: ${clan.max_members}). ¡Ayúdalos a subir de nivel!`, 400);
    }

    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Usuario no encontrado.', 404);
    if (user.clan_id) throw new AppError('Ya perteneces a un clan.', 400);

    if (user.elo_rating < clan.min_elo_required) {
      throw new AppError(`Necesitas ${clan.min_elo_required} de ELO para entrar.`, 400);
    }

    await user.update({ clan_id: clan.id });

    return { message: `Bienvenido a ${clan.name}` };
  }

  async getClanDetails(clanId: number) {
    return await Clan.findByPk(clanId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'elo_rating', 'xp_total', 'role', 'avatar']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username']
        }
      ]
    });
  }

  async getLeaderboard() {
    return await Clan.findAll({
      order: [['total_xp', 'DESC']],
      limit: 10,
      include: [{ model: User, as: 'members', attributes: ['id'] }]
    });
  }

  async leaveClan(userId: number) {
    const t = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction: t });
      if (!user) throw new AppError('Usuario no encontrado.', 404);
      if (!user.clan_id) throw new AppError('No perteneces a ningún clan.', 400);

      const clanId = user.clan_id;
      const clan = await Clan.findByPk(clanId, { transaction: t });

      if (!clan) {
        await user.update({ clan_id: null }, { transaction: t });
        await t.commit();
        return { message: 'Has salido (El clan no existía).' };
      }

      if (clan.owner_id === user.id) {
        const otherMembers = await User.findAll({
          where: {
            clan_id: clanId,
            id: { [Op.ne]: user.id }
          },
          order: [['createdAt', 'ASC']],
          limit: 1,
          transaction: t
        });

        if (otherMembers.length > 0) {
          const newLeader = otherMembers[0];
          await clan.update({ owner_id: newLeader.id }, { transaction: t });
        } else {
          await clan.destroy({ transaction: t });
          await ClanWar.destroy({
            where: { [Op.or]: [{ clan_1_id: clanId }, { clan_2_id: clanId }] },
            transaction: t
          });
        }
      }

      await user.update({ clan_id: null }, { transaction: t });

      await t.commit();
      return { message: 'Has abandonado el clan exitosamente.' };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // 👇 NUEVO: Mover Lógica de kickMember aquí
  async kickMember(leaderId: number, memberId: number) {
    const leader = await User.findByPk(leaderId);
    const member = await User.findByPk(memberId);

    if (!leader || !leader.clan_id) throw new AppError("No autorizado", 403);
    if (!member || !member.clan_id) throw new AppError("Miembro no encontrado o sin clan", 404);

    if (leader.clan_id !== member.clan_id) {
      throw new AppError("No puedes expulsar a alguien de otro clan", 403);
    }

    const clan = await Clan.findByPk(leader.clan_id);
    if (clan?.owner_id !== leaderId) {
      throw new AppError("Solo el líder puede expulsar", 403);
    }

    if (memberId === leaderId) {
      throw new AppError("No puedes expulsarte a ti mismo", 400);
    }

    await member.update({ clan_id: null });

    return { message: "Miembro expulsado exitosamente" };
  }

  // =================================================================
  // ⚔️ SISTEMA DE GUERRA (WARS)
  // =================================================================

  async challengeClan(senderUserId: number, targetClanId: number) {
    const sender = await User.findByPk(senderUserId);
    if (!sender?.clan_id) throw new AppError('No tienes clan.', 400);

    const myClan = await Clan.findByPk(sender.clan_id);
    if (myClan?.owner_id !== senderUserId) throw new AppError('Solo el líder puede iniciar una guerra.', 403);

    if (myClan.id === targetClanId) throw new AppError('No puedes retarte a ti mismo.', 400);

    const enemyClan = await Clan.findByPk(targetClanId);
    if (!enemyClan) throw new AppError('El clan rival no existe.', 404);

    const activeWar = await ClanWar.findOne({
      where: {
        status: { [Op.in]: ['active', 'pending'] },
        [Op.or]: [
          { clan_1_id: myClan.id }, { clan_2_id: myClan.id },
          { clan_1_id: targetClanId }, { clan_2_id: targetClanId }
        ]
      }
    });

    if (activeWar) throw new AppError('Uno de los clanes ya está en guerra o tiene un reto pendiente.', 400);

    const war = await ClanWar.create({
      clan_1_id: myClan.id,
      clan_2_id: enemyClan.id,
      clan_1_score: 0,
      clan_2_score: 0,
      start_time: new Date(),
      end_time: new Date(),
      status: 'pending'
    });

    return { message: `Has retado a ${enemyClan.name}.`, warId: war.id };
  }

  async respondToChallenge(userId: number, warId: number, accept: boolean) {
    const war = await ClanWar.findByPk(warId);
    if (!war || war.status !== 'pending') throw new AppError('El reto no existe o ya no está pendiente.', 404);

    const user = await User.findByPk(userId);
    if (war.clan_2_id !== user?.clan_id) throw new AppError('No tienes permiso para responder a este reto.', 403);

    const myClan = await Clan.findByPk(user.clan_id);
    if (myClan?.owner_id !== userId) throw new AppError('Solo el líder puede decidir.', 403);

    if (!accept) {
      await war.destroy();
      return { message: 'Has rechazado el desafío.' };
    }

    const now = new Date();
    const durationHours = 24;
    const endTime = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    await war.update({
      status: 'active',
      start_time: now,
      end_time: endTime
    });

    return { message: '¡Guerra iniciada! Que gane el mejor.', war };
  }

  async addClanXp(clanId: number, amount: number) {
    const clan = await Clan.findByPk(clanId);
    if (!clan) return;

    const oldLevel = clan.level;
    const updatedClan = await clan.increment('total_xp', { by: amount });

    await updatedClan.reload();

    if (updatedClan.level > oldLevel) {
      console.log(`🎉 Clan ${clan.name} subió a nivel ${updatedClan.level}!`);
    }

    const activeWar = await ClanWar.findOne({
      where: {
        status: 'active',
        [Op.or]: [{ clan_1_id: clanId }, { clan_2_id: clanId }]
      }
    });

    if (activeWar) {
      if (new Date() > new Date(activeWar.end_time)) {
        await this.finishWar(activeWar);
      } else {
        if (activeWar.clan_1_id === clanId) {
          await activeWar.increment('clan_1_score', { by: amount });
        } else {
          await activeWar.increment('clan_2_score', { by: amount });
        }
      }
    }
  }

  private async finishWar(war: ClanWar) {
    if (war.status === 'finished') return;

    let winnerId: number | null = null;
    if (war.clan_1_score > war.clan_2_score) winnerId = war.clan_1_id;
    else if (war.clan_2_score > war.clan_1_score) winnerId = war.clan_2_id;

    if (winnerId) {
      const CLAN_XP_PRIZE = 5000;
      const MEMBER_GEMS_PRIZE = 100;

      await Clan.increment({ total_xp: CLAN_XP_PRIZE }, { where: { id: winnerId } });
      await User.increment({ gems: MEMBER_GEMS_PRIZE }, { where: { clan_id: winnerId } });
    }

    await war.update({
      status: 'finished',
      winner_clan_id: winnerId
    });
  }

  async getWarStatus(clanId: number) {
    const war = await ClanWar.findOne({
      where: {
        status: { [Op.in]: ['active', 'pending'] },
        [Op.or]: [{ clan_1_id: clanId }, { clan_2_id: clanId }]
      },
      include: [
        { model: Clan, as: 'clan1', attributes: ['id', 'name', 'emblem_id'] },
        { model: Clan, as: 'clan2', attributes: ['id', 'name', 'emblem_id'] }
      ]
    });

    if (!war) return null;

    const timeLeft = new Date(war.end_time).getTime() - Date.now();

    if (war.status === 'active' && timeLeft <= 0) {
      this.finishWar(war);
      return { status: 'finished' };
    }

    const isClan1 = war.clan_1_id === clanId;
    const opponentData = isClan1 ? (war as any).clan2 : (war as any).clan1;

    return {
      warId: war.id,
      status: war.status,
      myClanId: clanId,
      opponent: {
        id: opponentData.id,
        name: opponentData.name,
        emblem_id: opponentData.emblem_id
      },
      scores: {
        myScore: war.clan_1_id === clanId ? war.clan_1_score : war.clan_2_score,
        opponentScore: war.clan_1_id === clanId ? war.clan_2_score : war.clan_1_score
      },
      endTime: war.end_time,
      timeLeftMs: Math.max(0, timeLeft),
    };
  }
}

export const clanService = new ClanService();
import { Clan, User, ClanWar } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/database'; // 👈 Necesario para transacciones
import { CLAN_LEVELS } from '../config/clanLevels.config';

export class ClanService {

  // =================================================================
  // 🏗️ GESTIÓN BÁSICA (Crear, Unirse)
  // =================================================================

  /**
   * Crea un clan y asigna al creador como líder.
   * IMPORTANTE: Usa transacciones para asegurar integridad.
   */
  static async createClan(ownerId: number, name: string, description: string, emblemId: string) {
    // Iniciamos una transacción: o se hace todo, o no se hace nada.
    const t = await sequelize.transaction();

    try {
      // 1. Validaciones previas (lecturas no necesitan transacción obligatoria, pero es buena práctica si hay mucha concurrencia)
      const existing = await Clan.findOne({ where: { name }, transaction: t });
      if (existing) throw new Error('El nombre del clan ya está en uso.');

      const user = await User.findByPk(ownerId, { transaction: t });
      if (!user) throw new Error('Usuario no encontrado.');
      if (user.clan_id) throw new Error('Ya perteneces a un clan. Debes salirte primero.');

      // 2. Crear Clan (Pasamos la transacción 't')
      const newClan = await Clan.create({
        name,
        description,
        emblem_id: emblemId,
        owner_id: ownerId, // El creador es el dueño
        total_xp: 0
      }, { transaction: t });

      // 3. Actualizar al usuario para vincularlo al clan
      await user.update({ clan_id: newClan.id }, { transaction: t });

      // 4. Confirmar cambios
      await t.commit();
      
      return newClan;

    } catch (error) {
      // Si algo falla, revertimos todo
      await t.rollback();
      throw error;
    }
  }

  // Unirse a un clan
  static async joinClan(clanId: number, userId: number) {
    // Buscamos clan con sus miembros para validar capacidad
    const clan = await Clan.findByPk(clanId, {
      include: [{ model: User, as: 'members', attributes: ['id'] }]
    });

    if (!clan) throw new Error('Clan no encontrado.');

    // Validación de Capacidad Dinámica
    // Usamos cast seguro o validación
    const members = (clan as any).members as User[]; 
    if (!members) throw new Error('Error al cargar miembros del clan.');

    if (members.length >= clan.max_members) {
      throw new Error(`El clan está lleno (Nivel ${clan.level} cap: ${clan.max_members}). ¡Ayúdalos a subir de nivel!`);
    }

    const user = await User.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado.');
    if (user.clan_id) throw new Error('Ya perteneces a un clan.');

    if (user.elo_rating < clan.min_elo_required) {
      throw new Error(`Necesitas ${clan.min_elo_required} de ELO para entrar.`);
    }

    // Actualizar usuario
    await user.update({ clan_id: clan.id });
    
    return { message: `Bienvenido a ${clan.name}` };
  }

  // Obtener detalles (Público/Privado)
  static async getClanDetails(clanId: number) {
    return await Clan.findByPk(clanId, {
      include: [
        {
          model: User,
          as: 'members', // Coincide con index.ts
          attributes: ['id', 'username', 'elo_rating', 'xp_total', 'role', 'avatar'] // Agregué avatar si existe
        },
        {
          model: User,
          as: 'owner', // Coincide con index.ts
          attributes: ['id', 'username']
        }
      ]
    });
  }

  static async getLeaderboard() {
    // Para el conteo de miembros, idealmente usamos un atributo virtual o un subquery COUNT,
    // pero sequelize.fn('COUNT') con group by es complejo. 
    // Por simplicidad, traemos los miembros (solo ID) para contarlos en backend o usamos un campo members_count cacheado.
    // Aquí asumo que tu frontend cuenta el array o que tienes un campo virtual.
    return await Clan.findAll({
      order: [['total_xp', 'DESC']],
      limit: 10,
      include: [{ model: User, as: 'members', attributes: ['id'] }] // Traemos IDs para contar length
    });
  }

  /**
   * Salir del clan.
   * Maneja lógica compleja de herencia de liderazgo.
   */
  static async leaveClan(userId: number) {
    const t = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction: t });
      if (!user) throw new Error('Usuario no encontrado.');
      if (!user.clan_id) throw new Error('No perteneces a ningún clan.');

      const clanId = user.clan_id;
      const clan = await Clan.findByPk(clanId, { transaction: t });

      // Caso huérfano (User tiene ID pero clan no existe)
      if (!clan) {
        await user.update({ clan_id: null }, { transaction: t });
        await t.commit();
        return { message: 'Has salido (El clan no existía).' };
      }

      // CASO: EL DUEÑO SE SALE
      if (clan.owner_id === user.id) {
        // Buscar sucesor
        const otherMembers = await User.findAll({
          where: {
            clan_id: clanId,
            id: { [Op.ne]: user.id }
          },
          order: [['createdAt', 'ASC']], // El más antiguo hereda
          limit: 1,
          transaction: t
        });

        if (otherMembers.length > 0) {
          // Hay sucesor: Transferir corona
          const newLeader = otherMembers[0];
          await clan.update({ owner_id: newLeader.id }, { transaction: t });
        } else {
          // No hay nadie: Destruir clan
          await clan.destroy({ transaction: t });
          // También debemos borrar guerras pendientes si el clan muere (opcional, por integridad)
          await ClanWar.destroy({ 
             where: { [Op.or]: [{ clan_1_id: clanId }, { clan_2_id: clanId }] },
             transaction: t
          });
        }
      }

      // Salida del usuario
      await user.update({ clan_id: null }, { transaction: t });

      await t.commit();
      return { message: 'Has abandonado el clan exitosamente.' };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // =================================================================
  // ⚔️ SISTEMA DE GUERRA (WARS)
  // =================================================================

  static async challengeClan(senderUserId: number, targetClanId: number) {
    const sender = await User.findByPk(senderUserId);
    if (!sender?.clan_id) throw new Error('No tienes clan.');

    const myClan = await Clan.findByPk(sender.clan_id);
    if (myClan?.owner_id !== senderUserId) throw new Error('Solo el líder puede iniciar una guerra.');
    
    if (myClan.id === targetClanId) throw new Error('No puedes retarte a ti mismo.');

    const enemyClan = await Clan.findByPk(targetClanId);
    if (!enemyClan) throw new Error('El clan rival no existe.');

    // Verificar guerras activas
    const activeWar = await ClanWar.findOne({
      where: {
        status: { [Op.in]: ['active', 'pending'] },
        [Op.or]: [
          { clan_1_id: myClan.id }, { clan_2_id: myClan.id },
          { clan_1_id: targetClanId }, { clan_2_id: targetClanId }
        ]
      }
    });

    if (activeWar) throw new Error('Uno de los clanes ya está en guerra o tiene un reto pendiente.');

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

  static async respondToChallenge(userId: number, warId: number, accept: boolean) {
    const war = await ClanWar.findByPk(warId);
    if (!war || war.status !== 'pending') throw new Error('El reto no existe o ya no está pendiente.');

    const user = await User.findByPk(userId);
    // Quien responde debe ser del Clan 2 (El Retado)
    if (war.clan_2_id !== user?.clan_id) throw new Error('No tienes permiso para responder a este reto.');
    
    const myClan = await Clan.findByPk(user.clan_id);
    if (myClan?.owner_id !== userId) throw new Error('Solo el líder puede decidir.');

    if (!accept) {
      await war.destroy();
      return { message: 'Has rechazado el desafío.' };
    }

    // ACEPTAR GUERRA
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

  static async addClanXp(clanId: number, amount: number) {
    const clan = await Clan.findByPk(clanId);
    if (!clan) return;

    // 1. Sumar XP al Clan (Modelo Clan)
    const oldLevel = clan.level;
    const updatedClan = await clan.increment('total_xp', { by: amount });
    
    // Recarga necesaria para actualizar los campos virtuales 'level'
    await updatedClan.reload(); 
    
    if (updatedClan.level > oldLevel) {
       console.log(`🎉 Clan ${clan.name} subió a nivel ${updatedClan.level}!`);
    }

    // 2. Lógica de Guerra
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

  private static async finishWar(war: ClanWar) {
    if (war.status === 'finished') return;

    let winnerId: number | null = null;
    if (war.clan_1_score > war.clan_2_score) winnerId = war.clan_1_id;
    else if (war.clan_2_score > war.clan_1_score) winnerId = war.clan_2_id;

    if (winnerId) {
      const CLAN_XP_PRIZE = 5000;
      const MEMBER_GEMS_PRIZE = 100;

      // Importante: No llamar a addClanXp aquí para evitar bucles.
      // Usamos increment directo.
      await Clan.increment({ total_xp: CLAN_XP_PRIZE }, { where: { id: winnerId } });
      
      // Premiar a los miembros
      await User.increment({ gems: MEMBER_GEMS_PRIZE }, { where: { clan_id: winnerId } });
    }

    await war.update({
      status: 'finished',
      winner_clan_id: winnerId
    });
  }

  static async getWarStatus(clanId: number) {
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

      // 👇 DEFINIMOS QUIÉN ES QUIÉN
      const isClan1 = war.clan_1_id === clanId;
      const opponentData = isClan1 ? (war as any).clan2 : (war as any).clan1;

      return {
          warId: war.id,
          status: war.status,
          myClanId: clanId,
          // 👇 CORRECCIÓN 1: Enviamos el OBJETO con nombre y emblema, no solo el ID
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
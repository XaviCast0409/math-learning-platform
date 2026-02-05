// src/services/ranking.service.ts
import { Op } from 'sequelize';
import User from '../models/User'; // Asegúrate que la ruta sea correcta
import { PVP_LEAGUES, getLeagueFromElo } from '../config/pvp.config';

export class RankingService {

  /**
   * Obtiene el Top Global de jugadores ordenados por ELO
   */
  static async getGlobalLeaderboard(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: {
        role: 'student', // Excluir admins para que sea justo
        elo_rating: { [Op.gt]: 0 } // Solo usuarios que hayan jugado o tengan ELO positivo
      },
      attributes: ['id', 'username', 'elo_rating', 'level', 'xp_total', 'clan_id', 'metadata'], // Excluir password
      order: [['elo_rating', 'DESC'], ['xp_total', 'DESC']], // Desempate por XP
      limit,
      offset,
    });

    // Mapeamos para asegurar que el virtual field se procese si es necesario
    const formattedRows = rows.map(user => ({
      id: user.id,
      username: user.username,
      elo: user.elo_rating,
      level: user.level, // O user.current_level_calc si prefieres el calculado
      league: user.current_league, // El campo virtual que ya tienes en el modelo
      avatar: (user.metadata as any)?.avatar || null // Si guardas avatar en metadata
    }));

    return {
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      ranking: formattedRows
    };
  }

  /**
   * Obtiene el ranking filtrado por una Liga Específica (ej. 'León de Hierro')
   */
  static async getLeagueLeaderboard(leagueName: string, page = 1, limit = 10) {
    // 1. Buscamos los rangos de esa liga en tu config
    const targetLeague = PVP_LEAGUES.find(l => l.name.toLowerCase() === leagueName.toLowerCase());

    if (!targetLeague) {
      throw new Error('Liga no encontrada');
    }

    const offset = (page - 1) * limit;

    // 2. Buscamos usuarios cuyo ELO esté en ese rango
    const { count, rows } = await User.findAndCountAll({
      where: {
        role: 'student',
        elo_rating: {
          [Op.between]: [targetLeague.minElo, targetLeague.maxElo === Infinity ? 999999 : targetLeague.maxElo]
        }
      },
      attributes: ['id', 'username', 'elo_rating', 'level'],
      order: [['elo_rating', 'DESC']],
      limit,
      offset
    });

    return {
      leagueInfo: targetLeague,
      total: count,
      page,
      ranking: rows.map(u => ({
        id: u.id,
        username: u.username,
        elo: u.elo_rating,
        level: u.level,
        league: u.current_league
      }))
    };
  }

  /**
   * Obtiene la posición exacta del usuario y sus vecinos (el de arriba y el de abajo)
   * Estilo Duolingo: "Tú estás aquí"
   */
  static async getUserRankContext(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');

    // 1. Calcular mi posición (Rank)
    // Contamos cuántos tienen más ELO que yo
    const betterPlayersCount = await User.count({
      where: {
        role: 'student',
        elo_rating: { [Op.gt]: user.elo_rating }
      }
    });

    const myRank = betterPlayersCount + 1;

    // 2. Buscar vecinos (ej: 2 arriba y 2 abajo)
    // Para esto, traemos un rango alrededor del ELO del usuario
    // Nota: Esto es una simplificación eficiente. 
    
    // Vecinos superiores (Mejores que yo)
    const neighborsAbove = await User.findAll({
      where: {
        role: 'student',
        elo_rating: { [Op.gte]: user.elo_rating }, // Mayor o igual
        id: { [Op.ne]: userId } // No yo mismo
      },
      order: [['elo_rating', 'ASC']], // Los más cercanos a mi ELO hacia arriba
      limit: 2
    });

    // Vecinos inferiores (Peores que yo)
    const neighborsBelow = await User.findAll({
      where: {
        role: 'student',
        elo_rating: { [Op.lte]: user.elo_rating },
        id: { [Op.ne]: userId }
      },
      order: [['elo_rating', 'DESC']], // Los más cercanos a mi ELO hacia abajo
      limit: 2
    });

    // Ordenamos la lista final para mostrarla en orden: [Mejor, Yo, Peor]
    const contextList = [
      ...neighborsAbove.reverse(), // Revertir para que el mejor esté arriba
      user,
      ...neighborsBelow
    ].map(u => ({
        id: u.id,
        username: u.username,
        elo: u.elo_rating,
        league: u.current_league,
        isMe: u.id === userId
    }));

    return {
      myRank,
      myLeague: user.current_league,
      context: contextList
    };
  }
}
import { Request, Response, NextFunction } from 'express';
import { Clan, User, ClanWar } from '../models'; // Asegúrate de importar ClanWar también
import { ClanService } from '../services/clan.service';
import AppError from '../utils/AppError';
import { Op } from 'sequelize'; // 👈 Asegúrate de importar Op

export const getMyClan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Obtener ID del usuario autenticado
    const userId = (req as any).user.id;
    const user = await User.findByPk(userId);

    if (!user || !user.clan_id) {
      // Si no tiene clan, devolvemos null, no un error 404 (para que el front muestre el lobby de "unirse")
      return res.status(200).json({ clan: null });
    }

    // 2. Buscar el clan con sus miembros
    const clan = await Clan.findByPk(user.clan_id, {
      include: [
        { 
          model: User, 
          as: 'members', // 👈 Debe coincidir con el alias en index.ts
          attributes: ['id', 'username', 'elo_rating', 'role', 'xp_total'] // Solo info pública
        }
      ]
    });

    if (!clan) {
      // Caso raro: User tiene clan_id pero el clan no existe
      return res.status(200).json({ clan: null });
    }

    // 3. (Opcional) Agregar rol del usuario actual en la respuesta
    const clanJSON = clan.toJSON() as any;
    clanJSON.my_role = (clan.owner_id === userId) ? 'leader' : 'member';

    res.status(200).json({ clan: clanJSON });
  } catch (error) {
    next(error);
  }
};

export const searchClans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    // Aquí podrías usar Op.like para filtrar por nombre
    // Por simplicidad devolvemos todos o los primeros 10
    const clans = await Clan.findAll({
      limit: 20,
      include: [{ model: User, as: 'members', attributes: ['id'] }] // Para contar miembros
    });

    // Formatear respuesta (añadir members_count)
    const results = clans.map(c => ({
        ...c.toJSON(),
        members_count: (c as any).members?.length || 0
    }));

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const createClan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    console.log("Creating clan for user:", userId);
    const { name, description, emblemId } = req.body;
    console.log("Clan data:", name, description, emblemId);

    // Llamamos al servicio existente
    const newClan = await ClanService.createClan(userId, name, description, emblemId);

    res.status(201).json(newClan);
  } catch (error) {
    next(error);
  }
};

export const joinClan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params; // clanId

    const result = await ClanService.joinClan(userId, Number(id));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const leaveClan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      // Implementar lógica de salir en servicio si no existe, o hacerlo manual aquí:
      const user = await User.findByPk(userId);
      if(!user?.clan_id) throw new AppError("No tienes clan", 400);

      const clan = await Clan.findByPk(user.clan_id);
      if(clan && clan.owner_id === userId) throw new AppError("El líder no puede abandonar el clan (debe borrarlo o pasar el liderazgo)", 400);

      user.clan_id = null; // null hack si TS se queja usa undefined o any
      (user as any).clan_id = null; 
      await user.save();

      res.status(200).json({ message: "Has salido del clan" });
    } catch (error) {
      next(error);
    }
};

// 👇 NUEVO: Para el widget de guerra
export const getCurrentWar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const user = await User.findByPk(userId);
        if(!user?.clan_id) return res.json(null);

        // Usamos el servicio que creamos antes
        const warStatus = await ClanService.getWarStatus(user.clan_id);
        
        res.status(200).json(warStatus);
    } catch (error) {
        next(error);
    }
};

// 👇 NUEVO: Expulsar miembro
export const kickMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const leaderId = (req as any).user.id;
        const { memberId } = req.params;

        // Validaciones rápidas
        const leader = await User.findByPk(leaderId);
        const member = await User.findByPk(memberId);
        
        if (!leader?.clan_id || leader.clan_id !== member?.clan_id) {
            throw new AppError("No autorizado", 403);
        }

        const clan = await Clan.findByPk(leader.clan_id);
        if (clan?.owner_id !== leaderId) {
            throw new AppError("Solo el líder puede expulsar", 403);
        }

        if (Number(memberId) === leaderId) {
             throw new AppError("No puedes expulsarte a ti mismo", 400);
        }

        // Ejecutar expulsión
        (member as any).clan_id = null;
        await member!.save();

        res.status(200).json({ message: "Miembro expulsado" });
    } catch (error) {
        next(error);
    }
};

// 1. Obtener Clan por ID (Perfil Público)
export const getClanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const clan = await Clan.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'members', 
          attributes: ['id', 'username', 'elo_rating', 'role', 'xp_total'] 
        }
      ]
    });

    if (!clan) {
        // Usamos return para evitar que siga ejecutando
        return res.status(404).json({ message: 'Clan no encontrado' });
    }

    res.status(200).json({ clan });
  } catch (error) {
    next(error);
  }
};

// 2. Enviar Reto (Usa ClanService)
export const challengeClan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { targetClanId } = req.body;

    // Delegamos la lógica compleja al servicio (validaciones, estados, etc.)
    const result = await ClanService.challengeClan(userId, targetClanId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 3. Responder Reto (Usa ClanService)
export const respondToChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { warId, accept } = req.body;

    const result = await ClanService.respondToChallenge(userId, warId, accept);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 4. Obtener Retos Pendientes (Incoming)
export const getPendingChallenges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findByPk(userId);

    // Solo mostramos retos si el usuario tiene clan
    if (!user?.clan_id) return res.status(200).json([]);

    // Buscamos guerras donde:
    // 1. Estado es 'pending'
    // 2. Mi clan es el DESTINATARIO (clan_2_id)
    const pendingWars = await ClanWar.findAll({
      where: {
        status: 'pending',
        clan_2_id: user.clan_id
      },
      include: [
        { model: Clan, as: 'clan1', attributes: ['id', 'name', 'emblem_id'] } // Quién me retó
      ]
    });

    // Formateamos para el frontend
    const results = pendingWars.map(war => ({
        warId: war.id,
        opponent: (war as any).clan1, // El que envió el reto
        status: war.status
    }));

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
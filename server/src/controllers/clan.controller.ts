import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import { clanService } from '../services/clan.service';
import AppError from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

export const getMyClan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  // Mantenemos lógica original simplificada:
  const { User } = require('../models');
  const user = await User.findByPk(userId);

  if (!user || !user.clan_id) {
    return res.status(200).json({ clan: null });
  }

  const clan = await clanService.getClanDetails(user.clan_id);

  if (!clan) {
    return res.status(200).json({ clan: null });
  }

  const clanJSON = clan.toJSON();
  // @ts-ignore
  clanJSON.my_role = (clan.owner_id === userId) ? 'leader' : 'member';

  res.status(200).json({ clan: clanJSON });
});

export const searchClans = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const clans = await clanService.getLeaderboard();

  const results = clans.map((c: any) => ({
    ...c.toJSON(),
    members_count: c.members?.length || 0
  }));

  res.status(200).json(results);
});

export const createClan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  const { name, description, emblemId } = req.body;
  const newClan = await clanService.createClan(userId, name, description, emblemId);

  res.status(201).json(newClan);
});

export const joinClan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  const { id } = req.params; // clanId
  const result = await clanService.joinClan(Number(id), userId);

  res.status(200).json(result);
});

export const leaveClan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  const result = await clanService.leaveClan(userId);
  res.status(200).json(result);
});

export const getCurrentWar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  // Mismo pattern: necesitamos clan_id.
  const { User } = require('../models');
  const user = await User.findByPk(userId);
  if (!user?.clan_id) return res.json(null);

  const warStatus = await clanService.getWarStatus(user.clan_id);

  res.status(200).json(warStatus);
});

export const kickMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const leaderId = req.user?.id;
  if (!leaderId) throw new AppError('No autenticado', 401);

  const { memberId } = req.params;

  // Delegar TODO al servicio
  const result = await clanService.kickMember(leaderId, Number(memberId));

  res.status(200).json(result);
});

export const getClanById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const clan = await clanService.getClanDetails(Number(id));

  if (!clan) {
    return res.status(404).json({ message: 'Clan no encontrado' });
  }

  res.status(200).json({ clan });
});

export const challengeClan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  const { targetClanId } = req.body;
  const result = await clanService.challengeClan(userId, targetClanId);

  res.status(200).json(result);
});

export const respondToChallenge = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  const { warId, accept } = req.body;
  const result = await clanService.respondToChallenge(userId, warId, accept);

  res.status(200).json(result);
});

export const getPendingChallenges = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  // Mismo pattern: obtener User para clan_id
  const { User, ClanWar, Clan } = require('../models');
  const user = await User.findByPk(userId);
  if (!user?.clan_id) return res.status(200).json([]);

  const pendingWars = await ClanWar.findAll({
    where: {
      status: 'pending',
      clan_2_id: user.clan_id
    },
    include: [
      { model: Clan, as: 'clan1', attributes: ['id', 'name', 'emblem_id'] }
    ]
  });

  const results = pendingWars.map((war: any) => ({
    warId: war.id,
    opponent: war.clan1,
    status: war.status
  }));

  res.status(200).json(results);
});

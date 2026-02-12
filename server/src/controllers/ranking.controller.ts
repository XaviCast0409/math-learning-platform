// src/controllers/ranking.controller.ts
import { Request, Response, NextFunction } from 'express';
import { RankingService } from '../services/ranking.service';
import { PVP_LEAGUES } from '../config/pvp.config';
import { catchAsync } from '../utils/catchAsync';

// GET /api/ranking/global
export const getGlobalRanking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const data = await RankingService.getGlobalLeaderboard(page, limit);

  res.status(200).json({
    status: 'success',
    data
  });
});

// GET /api/ranking/league/:leagueName
export const getLeagueRanking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { leagueName } = req.params;
  const page = parseInt(req.query.page as string) || 1;

  const data = await RankingService.getLeagueLeaderboard(leagueName, page);

  res.status(200).json({
    status: 'success',
    data
  });
});

// GET /api/ranking/me
export const getMyRank = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Asumimos que tienes un middleware de auth que pone el usuario en req.user
  const userId = (req as any).user.id;

  const data = await RankingService.getUserRankContext(userId);

  res.status(200).json({
    status: 'success',
    data
  });
});

// GET /api/ranking/leagues-meta
// Endpoint simple para que el front sepa qué ligas existen (para pintar iconos, nombres, etc)
export const getLeaguesMetadata = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: 'success',
    data: PVP_LEAGUES
  });
});

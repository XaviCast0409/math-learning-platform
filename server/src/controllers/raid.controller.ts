import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { raidService } from '../services/raid.service';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/AppError';

// 1. Cambiamos 'req: AuthRequest' a 'req: Request' para que Express no se queje
export const getCurrentBoss = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const boss = await raidService.getActiveBoss();
  if (!boss) return res.status(200).json({ active: false, message: 'No hay Raid activa' });

  res.json({ active: true, boss });
});

export const spawnBoss = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, hp, duration, image } = req.body;
  const boss = await raidService.spawnBoss(name, hp, duration, image);
  res.status(201).json(boss);
});

// 2. Aquí necesitamos el usuario. Hacemos el cast DENTRO de la función.
export const attackBossManual = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 👇 Truco: Le decimos a TS "Confía en mí, esto es un AuthRequest"
  const userId = (req as AuthRequest).user?.id;

  if (!userId) throw new AppError('Usuario no identificado', 401);

  const damage = 10;
  const result = await raidService.attackBoss(userId, damage);

  if (!result) throw new AppError('No hay boss activo.', 400);

  res.json(result);
});

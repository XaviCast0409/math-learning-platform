// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { User } from '../models';
import { logService } from '../services/admin/LogService';
import AppError from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

// Para pruebas o admin: dar XP manual
export const addXpManually = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('No autenticado', 401);

    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'La cantidad debe ser positiva' });
    }

    const result = await userService.addExperience(userId, Number(amount));

    await logService.log(userId, 'MANUAL_XP', `Se agregaron manualmente ${amount} XP`);

    res.status(200).json({
        status: 'success',
        data: {
            level: result.user.level,
            xp_total: result.user.xp_total,
            leveled_up: result.leveledUp,
            rewards: result.leveledUp ? result.rewards : null
        }
    });
});

// Obtener info de progreso (nivel, barra de XP)
export const getUserProgress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('No autenticado', 401);

    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const progress = userService.getProgressInfo(user);

    res.status(200).json({
        status: 'success',
        data: progress
    });
});

// Nuevo método para obtener estado de racha (si quisieras una llamada separada)
export const getStreakStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('No autenticado', 401);

    const user = await User.findByPk(userId, {
        attributes: ['current_streak', 'highest_streak', 'last_activity_date']
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
        status: 'success',
        data: {
            current_streak: user.current_streak,
            highest_streak: user.highest_streak,
            last_activity: user.last_activity_date
        }
    });
});

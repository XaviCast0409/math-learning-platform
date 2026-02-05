// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { User } from '../models'; // Importa tu modelo
import { LogService } from '../services/admin/LogService'

// Para pruebas o admin: dar XP manual
export const addXpManually = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id; 
        const { amount } = req.body; 

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'La cantidad debe ser positiva' });
        }

        const result = await UserService.addExperience(userId, Number(amount));

        // 👇 AGREGAR ESTO:
        await LogService.log(userId, 'MANUAL_XP', `Se agregaron manualmente ${amount} XP`);

        res.status(200).json({
            status: 'success',
            data: {
                level: result.user.level,
                xp_total: result.user.xp_total,
                leveled_up: result.leveledUp,
                rewards: result.leveledUp ? result.rewards : null 
            }
        });
    } catch (error) {
        next(error);
    }
};

// Obtener info de progreso (nivel, barra de XP)
export const getUserProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const user = await User.findByPk(userId);
        
        if (!user) return res.status(404).json({message: 'User not found'});

        const progress = UserService.getProgressInfo(user);

        res.status(200).json({
            status: 'success',
            data: progress
        });
    } catch (error) {
        next(error);
    }
};

// Nuevo método para obtener estado de racha (si quisieras una llamada separada)
export const getStreakStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
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
    } catch (error) {
        next(error);
    }
};
import { Request, Response, NextFunction } from 'express';
import { towerService } from '../services/tower.service';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/AppError';

export const startTowerRun = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('No autenticado', 401);

    const result = await towerService.startRun(userId);

    // Si 'result' tiene propiedad 'run', es el objeto { run, costType }.
    // Si no, es la instancia del modelo TowerRun (partida activa).
    let run;
    let costType = null;

    if (result && typeof result === 'object' && 'run' in result) {
        // Es el objeto { run, costType }
        run = result.run;
        costType = result.costType;
    } else {
        // Es la instancia del modelo
        run = result;
    }

    res.status(200).json({
        status: 'success',
        data: { run, costType }
    });
});

export const getTowerStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('No autenticado', 401);

    const status = await towerService.getStatus(userId);

    res.status(200).json({
        status: 'success',
        data: status
    });
});

export const submitTowerAnswer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { exerciseId, answer } = req.body;

    if (!userId) throw new AppError('No autenticado', 401);
    if (!exerciseId || !answer) throw new AppError('Datos incompletos', 400);

    const result = await towerService.submitAnswer(userId, exerciseId, answer);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

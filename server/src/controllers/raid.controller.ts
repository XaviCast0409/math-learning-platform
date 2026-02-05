import { Request, Response } from 'express'; // Usa Request estándar aquí
import { AuthRequest } from '../middlewares/auth.middleware'; 
import { RaidService } from '../services/raid.service';

// 1. Cambiamos 'req: AuthRequest' a 'req: Request' para que Express no se queje
export const getCurrentBoss = async (req: Request, res: Response) => {
  try {
    const boss = await RaidService.getActiveBoss();
    if (!boss) return res.status(200).json({ active: false, message: 'No hay Raid activa' });
    
    res.json({ active: true, boss });
  } catch (error: any) {
    res.status(500).json({ message: 'Error obteniendo Raid' });
  }
};

export const spawnBoss = async (req: Request, res: Response) => {
    try {
        const { name, hp, duration, image } = req.body;
        const boss = await RaidService.spawnBoss(name, hp, duration, image);
        res.status(201).json(boss);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// 2. Aquí necesitamos el usuario. Hacemos el cast DENTRO de la función.
export const attackBossManual = async (req: Request, res: Response) => {
  try {
    // 👇 Truco: Le decimos a TS "Confía en mí, esto es un AuthRequest"
    const userId = (req as AuthRequest).user?.id; 
    
    if (!userId) return res.status(401).json({ message: 'Usuario no identificado' });

    const damage = 10; 
    const result = await RaidService.attackBoss(userId, damage);
    
    if (!result) return res.status(400).json({ message: 'No hay boss activo.' });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../models';
import { LifeService } from '../services/life.service';
import { LogService } from '../services/admin/LogService';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor provee username, email y password'
      });
    }

    const { user, token } = await AuthService.register({ username, email, password });

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      token,
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Email y contraseña requeridos' });
    }

    const { user, token, streak_reward } = await AuthService.login({ email, password });

    // 👇 LÓGICA ROBUSTA PARA OBTENER IP REAL
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    // A veces 'x-forwarded-for' devuelve una lista "IP_CLIENTE, PROXY1, PROXY2".
    // Nos interesa la primera (la del cliente).
    if (Array.isArray(clientIp)) {
       clientIp = clientIp[0];
    } else if (typeof clientIp === 'string' && clientIp.includes(',')) {
       clientIp = clientIp.split(',')[0].trim();
    }
    
    // Normalizar si es localhost IPv6 (::1) a IPv4 (127.0.0.1) si prefieres, o dejarlo así.
    const finalIp = (clientIp as string) || '0.0.0.0';

    console.log('IP Detectada:', finalIp); 

    // Guardamos la IP real
    await LogService.log(user.id, 'LOGIN', 'Inicio de sesión exitoso', finalIp);

    const { lives, nextRegen } = await LifeService.syncLives(user);

    res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      token,
      streak_reward,
      data: {
        user: {
          ...user,
          lives,
          nextRegen
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Usuario no encontrado' });
    }

    // 👇 3. ACTUALIZAR VIDAS AL RECARGAR PERFIL (F5)
    // Esto asegura que si recarga la página, se recalcule el tiempo
    const { lives, nextRegen } = await LifeService.syncLives(user);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user.toJSON(), // Convertimos a objeto plano de JS
          lives,            // Vidas actualizadas
          nextRegen         // Fecha para el contador
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
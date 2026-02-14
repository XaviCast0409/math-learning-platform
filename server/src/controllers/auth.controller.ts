import { Request, Response, NextFunction } from 'express';
// 👇 Importar INSTANCIAS (ya no las clases estáticas)
import { AuthService } from '../services/auth.service'; // Esto es una clase pero en nuestro refactor anterior lo dejamos como clase, no exportamos instancia. Espera, verificaremos.
import { lifeService } from '../services/life.service';
import AppError from '../utils/AppError';

// ⚠️ NOTA: Si AuthService sigue siendo una clase para instanciar, lo instanciamos aquí.
// Si lo cambiamos a singleton, importamos 'authService'.
// Revisando mi paso anterior (215), AuthService es una CLASE exportada.
// Pero en mi plan dije que lo haría singleton.
// Para ser consistente con lo que hice en 215 (overwrite), AuthService es una CLASE.
// Sin embargo, para estandarizar, DEBERÍA ser singleton.
// Pero como ya escribí el archivo como clase, lo usaré como clase aquí por ahora
// O mejor: Lo instancio aquí mismo si no exporté instancia.

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // La validación ya pasó por el middleware
    const result = await authService.register(req.body);

    res.status(200).json({
      status: 'success',
      data: result // { message, email }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      throw new AppError('Email y código son requeridos', 400);
    }

    const { user, token } = await authService.verifyEmailAndCreateUser(email, code);

    res.status(201).json({
      status: 'success',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

export const resendCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email es requerido', 400);
    }

    const { verificationService } = require('../services/verification.service');
    await verificationService.resendCode(email);

    res.status(200).json({
      status: 'success',
      message: 'Código reenviado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtenemos la IP real (útil para seguridad)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const finalIp = Array.isArray(ip) ? ip[0] : ip || '';

    const { user, token, streak_reward } = await authService.login({
      ...req.body,
      ipAddress: finalIp
    });

    // Sincronizar vidas al hacer login
    const lifeStatus = await lifeService.syncLives(user);
    // (Opcional) podriamos actualizar el user object con las vidas si cambió

    res.status(200).json({
      status: 'success',
      data: {
        user: { ...user, lives: lifeStatus.lives, next_life: lifeStatus.nextRegen },
        token,
        streak_reward
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user ya está poblado por el middleware 'protect'
    // Pero 'protect' a veces solo pone id y role. 
    // Si queremos datos frescos, consultamos la BD o usamos lo que venga.
    // Asumimos que queremos datos frescos de vidas y eso.

    // Aquí necesitamos el User Model o usar un UserService.getProfile
    // Como no tenemos userService.getProfile explícito que devuelva el modelo completo
    // (UserService por ahora solo tiene addExperience/updateStreak),
    // Usaremos el modelo directo O mejor, usaremos lifeService.syncLives que sabe buscarlo.

    // IMPORTANTE: req.user es { id, role }, no el modelo completo.
    const userId = req.user?.id;
    if (!userId) throw new AppError('No logueado', 401);

    // Truco: lifeService.syncLives busca al usuario si le pasamos {id}
    const lifeStatus = await lifeService.syncLives({ id: userId } as any);

    // Pero necesitamos el usuario entero para devolverlo.
    // Vamos a importar User model aquí (excepción aceptable o mover a UserService.getMe)
    const { User } = require('../models'); // Lazy import para evitar ciclos si los hubiera
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) throw new AppError('Usuario no encontrado', 404);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user.toJSON(),
          lives: lifeStatus.lives,
          next_life: lifeStatus.nextRegen
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
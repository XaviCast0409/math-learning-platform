// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models'; // Importamos desde el index para asegurar relaciones
import AppError from '../utils/AppError';
import { UserService } from './user.service';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_dev';
const JWT_EXPIRES_IN = '7d'; // El login dura 7 días

export class AuthService {

  // Función para registrar usuario
  static async register(userData: any) {
    const { username, email, password } = userData;

    // 1. Verificar si el usuario o email ya existen
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('El correo electrónico ya está registrado.', 400);
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      throw new AppError('El nombre de usuario ya está en uso.', 400);
    }

    // 2. Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Crear usuario (Inicializamos gamificación por defecto en el Modelo, pero aseguramos aquí)
    const newUser = await User.create({
      username,
      email,
      password_hash: passwordHash,
      role: 'student',
      xp_total: 0,
      level: 1,
      lives: 5, // Empieza con vidas llenas
      gems: 0
    });

    // 4. Generar Token JWT
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // 5. Retornar usuario (sin la contraseña) y token
    const userResponse = newUser.toJSON();
    // @ts-ignore - Eliminamos el hash de la respuesta por seguridad
    delete userResponse.password_hash;

    return { user: userResponse, token };
  }
  
  static async login(loginData: any) {
    const { email, password } = loginData;

    // 1. Buscar usuario
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AppError('Credenciales incorrectas', 401);
    }

    // 2. Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Credenciales incorrectas', 401);
    }

    // 3. CALCULAR RACHA Y OBTENER RECOMPENSA 👇 (CAMBIO AQUÍ)
    // Desestructuramos para obtener el usuario actualizado y la posible recompensa
    const { user: updatedUser, reward } = await UserService.updateStreak(user);

    // 4. Generar Token (Usamos updatedUser para asegurar datos frescos)
    const token = jwt.sign(
      { id: updatedUser.id, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 5. Preparar respuesta
    const userResponse = updatedUser.toJSON();
    // @ts-ignore
    delete userResponse.password_hash;

    // 6. RETORNAR RESPUESTA CON RECOMPENSA 👇 (CAMBIO AQUÍ)
    return {
      user: userResponse,
      token,
      streak_reward: reward // Esto será null o el objeto con gemas/xp
    };
  }
}
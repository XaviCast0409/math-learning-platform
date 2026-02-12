import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import AppError from '../utils/AppError';
import { userService } from './user.service';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_dev';
const JWT_EXPIRES_IN = '7d';

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  ipAddress?: string;
}

export class AuthService {
  constructor() { }

  async register(userData: RegisterDTO) {
    const { username, email, password } = userData;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('El correo electrónico ya está registrado.', 400);
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      throw new AppError('El nombre de usuario ya está en uso.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password_hash: passwordHash,
      role: 'student',
      xp_total: 0,
      level: 1,
      lives: 5,
      gems: 0
    });

    const token = this.signToken(newUser);

    const userResponse = newUser.toJSON();
    // @ts-ignore
    delete userResponse.password_hash;

    return { user: userResponse, token };
  }

  async login(loginData: LoginDTO) {
    const { email, password, ipAddress } = loginData;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Credenciales incorrectas', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Credenciales incorrectas', 401);
    }

    // Calcular racha y recompensa
    const { user: updatedUser, reward } = await userService.updateStreak(user);

    // Logging de IP (Delegado al servicio, aunque idealmente UserService manejaría esto si no Auth)
    // Para simplificar y limpiar el controlador, podemos emitir eventos o llamar aqui.
    // Por ahora, retornamos lo necesario.

    const token = this.signToken(updatedUser);

    const userResponse = updatedUser.toJSON();
    // @ts-ignore
    delete userResponse.password_hash;

    return {
      user: userResponse,
      token,
      streak_reward: reward
    };
  }

  private signToken(user: User): string {
    return jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }
}
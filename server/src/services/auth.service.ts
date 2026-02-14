import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import AppError from '../utils/AppError';
import { userService } from './user.service';
import { verificationService } from './verification.service';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_dev';
const JWT_EXPIRES_IN = '7d';

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  full_name: string;
  age?: number;
  phone?: string;
  grade_level: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  ipAddress?: string;
}

export class AuthService {
  constructor() { }

  async register(userData: RegisterDTO) {
    const { username, email, password, full_name, age, phone, grade_level } = userData;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.email_verified) {
      throw new AppError('El correo electrónico ya está registrado.', 400);
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      throw new AppError('El nombre de usuario ya está en uso.', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update unverified user with all data
    if (existingUser && !existingUser.email_verified) {
      // Update existing unverified user
      existingUser.username = username;
      existingUser.password_hash = passwordHash;
      existingUser.full_name = full_name;
      existingUser.age = age || null;
      existingUser.phone = phone || null;
      existingUser.grade_level = grade_level;
      existingUser.email_verification_code = code;
      existingUser.verification_code_expires_at = expiresAt;
      await existingUser.save();
    } else {
      // Create new unverified user
      await User.create({
        username,
        email,
        password_hash: passwordHash,
        full_name,
        age: age || null,
        phone: phone || null,
        grade_level,
        role: 'student',
        xp_total: 0,
        level: 1,
        lives: 5,
        gems: 0,
        email_verified: false,
        email_verification_code: code,
        verification_code_expires_at: expiresAt
      });
    }

    // Send verification email
    await verificationService.sendVerificationCode(email, full_name);

    return {
      message: 'Código de verificación enviado a tu correo',
      email
    };
  }

  async verifyEmailAndCreateUser(email: string, code: string) {
    // Verify the code
    await verificationService.verifyCode(email, code);

    // Get the now-verified user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Generate token
    const token = this.signToken(user);

    const userResponse = user.toJSON();
    // @ts-ignore
    delete userResponse.password_hash;
    // @ts-ignore
    delete userResponse.email_verification_code;
    // @ts-ignore
    delete userResponse.verification_code_expires_at;

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
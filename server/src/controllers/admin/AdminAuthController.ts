import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models';
import { logService } from '../../services/admin/LogService';
import { catchAsync } from '../../utils/catchAsync';

export class AdminAuthController {

  // POST /api/admin/auth/login
  static login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1. Buscamos usuario (incluso si está "borrado/baneado" para decirle que está baneado)
    const user = await User.findOne({
      where: { email },
      paranoid: false // Buscamos incluso entre los eliminados
    });

    if (!user) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    // 2. VERIFICACIÓN DE SEGURIDAD EXTREMA 🛡️
    if (user.role !== 'admin' && user.role !== 'moderator') {
      // Importante: No decir "no eres admin", mejor decir "Credenciales inválidas" por seguridad
      // Pero para tu desarrollo interno:
      console.warn(`Intento de acceso admin por usuario estudiante: ${email}`);
      res.status(403).json({ message: 'Acceso denegado. No tienes permisos de administrador.' });
      return;
    }

    // 3. Verificar si está baneado (Soft deleted)
    if (user.getDataValue('deletedAt')) {
      res.status(403).json({ message: 'Esta cuenta de administrador ha sido deshabilitada.' });
      return;
    }

    // 4. Verificar Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    // 5. Generar Token (Con payload diferente para diferenciarlo en el front)
    const token = jwt.sign(
      { id: user.id, role: user.role, scope: 'admin_dashboard' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' } // Los tokens de admin suelen durar menos por seguridad
    );

    await logService.log(
      user.id,
      'ADMIN_LOGIN',
      'Acceso al panel de administración',
      req.ip || ''
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  });

  // POST /api/admin/auth/register
  // ¡OJO! Esta ruta debe estar protegida o ser secreta. No cualquiera debe poder crear un admin.
  // Idealmente, el primer admin se crea por Seed/Base de datos y luego ese crea a los demás.
  static registerAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // ... Lógica similar al registro normal pero forzando role: 'admin'
    res.status(501).json({ message: 'Not implemented yet' });
  });
}

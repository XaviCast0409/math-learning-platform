import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models'; // Asegúrate de que importas tu modelo User

// 1. Definimos la interfaz extendida y la exportamos para usarla en controladores
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_dev';

// --- MIDDLEWARE 1: AUTENTICACIÓN (¿Quién eres?) ---
// --- MIDDLEWARE 1: AUTENTICACIÓN (¿Quién eres?) ---
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 1. Extraer el token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // Usamos res.status directamente para no depender de AppError si no lo tienes configurado igual
    return res.status(401).json({ message: 'No has iniciado sesión. Falta el token.' });
  }

  try {
    // 2. Verificar Token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // 3. (Opcional pero recomendado) Verificar si el usuario sigue existiendo en BD
    // Esto es útil si borraste al usuario pero su token sigue vivo.
    const currentUser = await User.findByPk(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ message: 'El usuario de este token ya no existe.' });
    }

    // 4. Inyectar usuario en la Request
    // Aquí asignamos los datos que necesitan tus controladores (id, role, etc.)
    (req as AuthRequest).user = {
      id: currentUser.id,
      username: currentUser.username,
      role: currentUser.role
    };

    next(); // Pasa al siguiente middleware (o al controlador)

  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// --- MIDDLEWARE 2: AUTORIZACIÓN (¿Tienes permiso?) ---
// NOTA: Este middleware debe usarse SIEMPRE después de 'protect'
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Como 'protect' se ejecuta antes, req.user YA EXISTE. No hace falta verificar token de nuevo.
  const user = (req as AuthRequest).user;
  console.log(user);

  if (!user) {
    return res.status(401).json({ message: 'Usuario no identificado.' });
  }

  // Verificamos el rol
  if (user.role !== 'admin' && user.role !== 'moderator') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }

  next();
};
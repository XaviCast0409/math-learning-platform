import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
// Importamos todos los modelos vinculados en index.ts
import {
  User,
  UserItem,
  UserProgress,
  Product,
  Lesson,
  Unit,
  Course,
  ActivityLog
} from '../../models';
import { LogService } from '../../services/admin/LogService'

export class AdminUserController {

  // ==========================================================
  //  GESTIÓN DE USUARIOS (CRUD BÁSICO)
  // ==========================================================

  // 1. LISTAR USUARIOS
  static async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = 20;
      const search = req.query.search as string;
      const role = req.query.role as string;

      const whereClause: any = {};

      if (search) {
        whereClause[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (role) whereClause.role = role;

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['createdAt', 'DESC']],
        paranoid: false, // Incluye baneados (soft deleted)
        attributes: { exclude: ['password_hash'] }
      });

      res.json({ total: count, pages: Math.ceil(count / pageSize), data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error obteniendo usuarios' });
    }
  }

  // 2. CAMBIAR CONTRASEÑA (FORCE)
  static async forceChangePassword(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        res.status(400).json({ message: 'La contraseña debe tener mínimo 6 caracteres' });
        return;
      }

      const user = await User.findByPk(userId, { paranoid: false });
      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(newPassword, salt);
      await user.save();

      // 👇 Log
      await LogService.log(user.id, 'ADMIN_PWD_CHANGE', 'Admin forzó cambio de contraseña', req.ip);

      res.json({ message: `Contraseña actualizada para el usuario ${user.username}` });
    } catch (error) {
      res.status(500).json({ message: 'Error actualizando contraseña' });
    }
  }

  // 3. BANEAR USUARIO
  static async banUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await User.findByPk(userId);

      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado o ya está baneado' });
        return;
      }

      if (user.role === 'admin') {
        res.status(403).json({ message: 'No puedes banear a otro administrador' });
        return;
      }

      await user.destroy(); // Soft delete

      // 👇 Log
      await LogService.log(Number(userId), 'ADMIN_BAN', 'Usuario baneado por Admin', req.ip);
      res.json({ message: 'Usuario baneado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error baneando usuario' });
    }
  }

  // 4. DESBANEAR USUARIO
  static async unbanUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await User.restore({ where: { id: userId } });

      // 👇 Log
      await LogService.log(Number(userId), 'ADMIN_UNBAN', 'Usuario reactivado por Admin', req.ip);
      res.json({ message: 'Usuario reactivado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error reactivando usuario' });
    }
  }

  // ==========================================================
  //  MODO PROFESOR / GOD MODE (DETALLES AVANZADOS)
  // ==========================================================

  // 5. OBTENER PERFIL BÁSICO
  static async getUserDetail(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] },
        paranoid: false
      });

      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error obteniendo perfil' });
    }
  }

  // 6. OBTENER PROGRESO ACADÉMICO REAL
  // Usa UserProgress -> Lesson -> Unit -> Course
  static async getAcademicProgress(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Buscamos todas las lecciones que el usuario ha tocado
      const progress = await UserProgress.findAll({
        where: { user_id: userId }, // usa user_id
        include: [
          {
            model: Lesson,
            as: 'lesson', // Definido en index.ts
            attributes: ['title', 'id'],
            include: [
              {
                model: Unit,
                as: 'unit', // Definido en index.ts
                attributes: ['title'],
                include: [
                  {
                    model: Course,
                    // Unit belongsTo Course. No tiene alias 'as' definido en index.ts para el belongsTo, 
                    // así que Sequelize usa el nombre del modelo por defecto.
                    attributes: ['id', 'title']
                  }
                ]
              }
            ]
          }
        ],
        order: [['updatedAt', 'DESC']]
      });

      // Transformamos la data plana de SQL a una estructura agrupada por Curso para el Frontend
      // Esto devuelve un array donde cada item es una lección con contexto del curso
      const formatted = progress.map((p: any) => {
        const lesson = p.lesson;
        const unit = lesson?.unit;
        const course = unit?.Course; // Sequelize pone mayúscula automática si no hay alias

        return {
          progressId: p.id,
          courseId: course?.id || 0,
          courseTitle: course?.title || 'Sin Curso',
          unitTitle: unit?.title || 'Sin Unidad',
          lessonTitle: lesson?.title || 'Lección desconocida',
          stars: p.stars, //
          status: p.status, //
          attempts: p.attempts,
          lastLessonDate: p.updatedAt
        };
      });

      res.json(formatted);

    } catch (error) {
      console.error("Error en getAcademicProgress:", error);
      res.status(500).json({ message: 'Error obteniendo progreso académico' });
    }
  }

  // 7. OBTENER INVENTARIO REAL
  // Usa UserItem -> Product
  static async getUserInventory(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Obtenemos los ítems RAW de la tabla user_items
      const rawItems = await UserItem.findAll({
        where: { user_id: userId }, // usa user_id
        include: [
          {
            model: Product,
            attributes: ['id', 'name', 'image_url', 'cost_gems']
            // Product pertenece a UserItem (definido implícitamente en index.ts)
          }
        ]
      });

      // Agrupamos por producto para mostrar cantidad (Quantity)
      // user_items suele guardar una fila por cada ítem adquirido individualmente
      const inventoryMap = new Map<number, any>();

      rawItems.forEach((item: any) => {
        const prod = item.Product;
        if (!prod) return;

        if (inventoryMap.has(prod.id)) {
          // Si ya existe en el mapa, sumamos 1 a la cantidad
          const existing = inventoryMap.get(prod.id);
          existing.quantity += 1;
          // Si alguno de los ítems individuales es el más reciente, actualizamos fecha
          if (new Date(item.acquired_at) > new Date(existing.acquiredAt)) {
            existing.acquiredAt = item.acquired_at;
          }
        } else {
          // Si es nuevo, lo creamos
          inventoryMap.set(prod.id, {
            id: item.id, // ID de referencia (útil para borrar uno de ellos)
            productId: prod.id,
            productName: prod.name,
            productImage: prod.image_url,
            quantity: 1,
            acquiredAt: item.acquired_at, // usa acquired_at
            active: true
          });
        }
      });

      // Convertimos el mapa a array para el frontend
      res.json(Array.from(inventoryMap.values()));

    } catch (error) {
      console.error("Error en getUserInventory:", error);
      res.status(500).json({ message: 'Error obteniendo inventario' });
    }
  }

  // 8. REGALAR ÍTEM (GRANT)
  static async grantItem(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { productId } = req.body;

      if (!productId) {
        res.status(400).json({ message: 'Falta productId' });
        return;
      }

      // Creamos una nueva entrada en user_items
      await UserItem.create({
        user_id: Number(userId),      //
        product_id: Number(productId), //
        acquired_at: new Date(),       //
        is_used: false,
        is_equipped: false
      });

      console.log(`Admin regaló producto ${productId} al usuario ${userId}`);
      res.json({ message: 'Ítem entregado correctamente' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error entregando ítem' });
    }
  }

  // 9. REVOCAR ÍTEM (DELETE)
  static async revokeItem(req: Request, res: Response) {
    try {
      const { userId, itemId } = req.params; // itemId es el ID de la fila en user_items

      // Borramos un ítem específico usando su PK
      const deleted = await UserItem.destroy({
        where: {
          id: itemId,
          user_id: userId // Seguridad extra: asegurar que pertenece a ese usuario
        }
      });

      if (deleted === 0) {
        // Si no se borró por ID directo, puede que el frontend haya mandado 
        // un ID de referencia. Intentamos borrar el más reciente de ese usuario 
        // que coincida con lo que se intenta borrar (lógica de respaldo).
        res.status(404).json({ message: 'Ítem no encontrado o ya eliminado' });
        return;
      }

      console.log(`Admin eliminó user_item ${itemId} del usuario ${userId}`);
      res.json({ message: 'Ítem eliminado del inventario' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error eliminando ítem' });
    }
  }

  // 10. LOGS DE ACTIVIDAD
  static async getActivityLogs(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const logs = await ActivityLog.findAll({
        where: { user_id: userId },
        order: [['createdAt', 'DESC']], // Lo más reciente primero
        limit: 50 // Traemos solo los últimos 50 para no saturar
      });

      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error obteniendo logs' });
    }
  }
  // Agrega esto dentro de la clase AdminUserController

  // 11. GESTIONAR GEMAS (Dar o Quitar)
  static async grantGems(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { amount } = req.body; // Puede ser positivo (500) o negativo (-100)

      if (!amount || isNaN(amount)) {
        res.status(400).json({ message: 'La cantidad debe ser un número válido' });
        return;
      }

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      // Actualizamos el saldo
      // Aseguramos que gems sea numérico (por si es null en BD)
      const currentGems = user.gems || 0;
      const newBalance = currentGems + Number(amount);

      // Evitar saldos negativos
      user.gems = newBalance < 0 ? 0 : newBalance;

      await user.save();

      console.log(`Admin ajustó gemas al usuario ${userId}: ${amount} (Saldo final: ${user.gems})`);

      res.json({
        message: 'Saldo de gemas actualizado correctamente',
        newBalance: user.gems
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error actualizando gemas' });
    }
  }
}
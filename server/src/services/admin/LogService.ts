import { ActivityLog } from '../../models';

export class LogService {
  /**
   * Registra una acción de usuario
   * @param userId - Quién hizo la acción
   * @param action - Qué hizo (LOGIN, PURCHASE, ETC)
   * @param details - Detalles extra
   * @param ip - IP del usuario (opcional)
   */
  async log(userId: number, action: string, details: string = '', ip: string = '') {
    try {
      await ActivityLog.create({
        user_id: userId,
        action: action.toUpperCase(),
        details,
        ip_address: ip
      });
    } catch (error) {
      console.error("Error guardando log:", error);
      // No lanzamos error para no interrumpir el flujo principal si el log falla
    }
  }
}

export const logService = new LogService();
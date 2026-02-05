import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class ActivityLog extends Model {
  public id!: number;
  public user_id!: number;
  public action!: string;   // Ej: "LOGIN", "PURCHASE", "LEVEL_UP", "ADMIN_BAN"
  public details!: string;  // Ej: "Compró Poción ID 5", "IP: 192.168.1.1"
  public ip_address!: string;
}

ActivityLog.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT }, // Texto largo para detalles
  ip_address: { type: DataTypes.STRING },
}, { 
  sequelize, 
  tableName: 'activity_logs', 
  timestamps: true, // Esto crea createdAt automáticamente (fecha del suceso)
  updatedAt: false  // No necesitamos saber cuándo se actualizó el log
});

export default ActivityLog;
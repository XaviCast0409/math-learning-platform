import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class UserProgress extends Model {
  public id!: number;
  public user_id!: number;
  public lesson_id!: number;
  public status!: 'locked' | 'active' | 'completed';
  public stars!: number; // 0 a 3 estrellas según desempeño
  public attempts!: number; // Cuantas veces lo intentó
}

UserProgress.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  lesson_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('locked', 'active', 'completed'), defaultValue: 'locked' },
  stars: { type: DataTypes.INTEGER, defaultValue: 0 },
  attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { sequelize, tableName: 'user_progress', timestamps: true });

export default UserProgress;